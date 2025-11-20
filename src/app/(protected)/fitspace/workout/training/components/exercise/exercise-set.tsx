import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { debounce, isNil } from 'lodash'
import { CheckIcon, Edit2Icon } from 'lucide-react'
import { useQueryState } from 'nuqs'
import React, {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUserPreferences } from '@/context/user-preferences-context'
import {
  GQLFitspaceGetWorkoutDayQuery,
  GQLFitspaceMarkSetAsCompletedMutation,
  GQLTrainingView,
  useFitspaceGetWorkoutDayQuery,
  useFitspaceMarkSetAsCompletedMutation,
  useFitspaceUpdateSetLogMutation,
} from '@/generated/graphql-client'
import { useWeightConversion } from '@/hooks/use-weight-conversion'
import { formatDecimalInput } from '@/lib/format-tempo'
import { useOptimisticMutation } from '@/lib/optimistic-mutations'
import { cn } from '@/lib/utils'
import { calculateEstimated1RM } from '@/utils/one-rm-calculator'

import { getSetRange } from '../../../utils'
import { ExerciseWeightInput } from '../exercise-weight-input'
import { createOptimisticSetUpdate } from '../optimistic-updates'

import { sharedLayoutAdvancedStyles } from './shared-styles'
import {
  StepperInput,
  decrementValue,
  getWeightIncrement,
  incrementValue,
} from './stepper-input'
import { ExerciseSetProps } from './types'

export function ExerciseSet({
  set,
  previousSetWeightLog,
  previousSetRepsLog,
  reps,
  weight,
  onRepsChange,
  onWeightChange,
  onSetCompleted,
  onSetUncompleted,
}: ExerciseSetProps) {
  const [dayId] = useQueryState('day')
  const { preferences } = useUserPreferences()
  const isAdvancedView = preferences.trainingView === GQLTrainingView.Advanced
  const hasUserEditedRef = useRef(false)
  const queryClient = useQueryClient()
  const [skipTimer, setSkipTimer] = useState(false)
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [prData, setPRData] = useState<{
    show: boolean
    improvement: number
    estimated1RM: number
  } | null>(null)
  const { mutateAsync: updateSetLog } = useFitspaceUpdateSetLogMutation({
    onMutate: async (newLog) => {
      await queryClient.cancelQueries({
        queryKey: useFitspaceGetWorkoutDayQuery.getKey({ dayId: dayId ?? '' }),
      })

      const previousWorkout = queryClient.getQueryData(
        useFitspaceGetWorkoutDayQuery.getKey({ dayId: dayId ?? '' }),
      )

      queryClient.setQueryData(
        useFitspaceGetWorkoutDayQuery.getKey({ dayId: dayId ?? '' }),
        (old: GQLFitspaceGetWorkoutDayQuery) => {
          if (!old?.getWorkoutDay?.day) return old

          const newData = JSON.parse(
            JSON.stringify(old),
          ) as NonNullable<GQLFitspaceGetWorkoutDayQuery>
          if (!newData.getWorkoutDay?.day) return newData

          const updatedSet = newData.getWorkoutDay.day.exercises
            .flatMap(
              (exercise) => exercise.substitutedBy?.sets || exercise.sets,
            )
            .find((s) => s.id === newLog.input.setId)

          if (updatedSet) {
            updatedSet.log = {
              id: updatedSet.log?.id || 'temp-id',
              reps: newLog.input.loggedReps,
              weight: newLog.input.loggedWeight,
              rpe: updatedSet.log?.rpe,
              createdAt: new Date().toISOString(),
            }
          }

          return newData
        },
      )

      return { previousWorkout }
    },
    onError: (_, __, context) => {
      if (context?.previousWorkout) {
        queryClient.setQueryData(
          useFitspaceGetWorkoutDayQuery.getKey({ dayId: dayId ?? '' }),
          context.previousWorkout,
        )
      }
    },
  })

  // ✅ Simplified using existing useOptimisticMutation pattern
  const { optimisticMutate: markSetAsCompletedOptimistic } =
    useOptimisticMutation<
      GQLFitspaceGetWorkoutDayQuery,
      GQLFitspaceMarkSetAsCompletedMutation,
      {
        setId: string
        completed: boolean
        reps?: number | null
        weight?: number | null
      }
    >({
      queryKey: useFitspaceGetWorkoutDayQuery.getKey({ dayId: dayId ?? '' }),
      mutationFn: useFitspaceMarkSetAsCompletedMutation().mutateAsync,
      updateFn: (oldData, { setId, completed, reps, weight }) => {
        const updateFn = createOptimisticSetUpdate(setId, completed, {
          reps,
          weight,
        })
        return updateFn(oldData)
      },
      onSuccess: (data, variables) => {
        // Check if it's a PR and trigger overlay
        if (data?.markSetAsCompleted?.isPersonalRecord && variables.completed) {
          const improvement = data.markSetAsCompleted.improvement || 0

          // Calculate estimated 1RM for display
          const currentWeight = variables.weight || 0
          const currentReps = variables.reps || 0
          const estimated1RM = calculateEstimated1RM(currentWeight, currentReps)

          // Show PR overlay
          setPRData({
            show: true,
            improvement,
            estimated1RM,
          })

          // Auto-hide after 4 seconds
          setTimeout(() => setPRData(null), 5000)
        }

        // Timer logic
        if (variables.completed && !skipTimer) {
          onSetCompleted(false)
        }
        setSkipTimer(false)
      },
      onError: (error, variables) => {
        console.error('Failed to mark set as completed:', error, variables)

        // On error, sync cache with server to fix inconsistencies
        queryClient.invalidateQueries({
          queryKey: useFitspaceGetWorkoutDayQuery.getKey({
            dayId: dayId ?? '',
          }),
        })
        // Reset timer states on error
        setSkipTimer(false)
      },
    })

  // Remove the useEffect as state is now managed by parent component
  // The initial values are already set in the parent's setsLogs state

  const debouncedUpdate = useMemo(
    () =>
      debounce(async (repsValue: string, weightValue: string) => {
        if (!hasUserEditedRef.current) return
        await updateSetLog({
          input: {
            setId: set.id,
            loggedReps: repsValue ? +repsValue : null,
            loggedWeight: weightValue ? +weightValue : null,
          },
        })
      }, 1500),
    [set.id, updateSetLog],
  )

  useEffect(() => {
    debouncedUpdate(reps, weight)
    return () => debouncedUpdate.cancel()
  }, [reps, weight, debouncedUpdate])

  const repRange = useMemo(() => getSetRange(set), [set])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: 'reps' | 'weight',
  ) => {
    const sanitizedValue =
      key === 'weight'
        ? formatDecimalInput(e)
        : e.target.value.replace(/[^0-9]/g, '')

    hasUserEditedRef.current = true

    if (key === 'reps') {
      onRepsChange(sanitizedValue)
    } else {
      onWeightChange(sanitizedValue)
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
      }
    }
  }, [])

  const handleToggleSetCompletion = useCallback(
    async (isDoubleClick = false) => {
      const willBeCompleted = !set.completedAt
      const repsValue = reps ? +reps : previousSetRepsLog || null
      const weightValue = weight ? +weight : previousSetWeightLog || null

      // Set skip timer flag for double clicks
      if (isDoubleClick) {
        setSkipTimer(true)
      }

      // Close editing mode when toggling completion
      setIsEditing(false)

      startTransition(() => {
        // Close timer immediately for uncompleting
        if (!willBeCompleted) {
          onSetUncompleted()
        }
      })

      try {
        await markSetAsCompletedOptimistic({
          setId: set.id,
          completed: willBeCompleted,
          reps: repsValue,
          weight: weightValue,
        })
      } catch (error) {
        console.error('Failed to toggle set completion:', error)
        // Reset timer states on error (error handling is also done in the mutation onError)
        setSkipTimer(false)
      }
    },
    [
      markSetAsCompletedOptimistic,
      set.completedAt,
      set.id,
      reps,
      weight,
      previousSetRepsLog,
      previousSetWeightLog,
      onSetUncompleted,
    ],
  )

  const handleClick = useCallback(() => {
    // Clear any existing timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
    }

    // Set timeout for single click
    clickTimeoutRef.current = setTimeout(() => {
      handleToggleSetCompletion(false) // Single click
    }, 250) // 250ms delay to detect double click
  }, [handleToggleSetCompletion])

  const [isEditing, setIsEditing] = useState(false)
  const isCompleted = !!set.completedAt
  const showInputs = isAdvancedView && (!isCompleted || isEditing)

  return (
    <motion.div
      key={`set-${set.id}`}
      initial={{ height: 0 }}
      animate={{ height: 'auto' }}
      exit={{ height: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className={cn(
        'relative',
        'bg-card shadow-xs border border-border rounded-xl overflow-hidden',
      )}
    >
      <motion.div
        animate={{ height: 'auto' }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        <div className={cn('flex items-start gap-1')}>
          <div
            className={cn(
              'p-2 py-2 w-full',
              showInputs ? 'space-y-2' : 'space-y-0',
              isAdvancedView ? 'space-y-2' : 'space-y-0',
            )}
          >
            <SetHeader
              setOrder={set.order}
              isCompleted={isCompleted}
              isEditing={isEditing}
              onCheckClick={handleClick}
              onEditClick={() => setIsEditing((prev) => !prev)}
              loggedReps={reps ? +reps : null}
              loggedWeight={weight ? +weight : null}
              isAdvancedView={isAdvancedView}
              repRange={repRange}
              plannedWeight={set.weight ?? null}
            />

            <AnimatePresence mode="wait">
              {showInputs && (
                <motion.div
                  key="set-inputs"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <SetInputs
                    setId={set.id}
                    reps={reps}
                    weight={weight}
                    repRange={repRange}
                    plannedWeight={set.weight ?? null}
                    isAdvancedView={isAdvancedView}
                    hasUserEditedRef={hasUserEditedRef}
                    onRepsChange={onRepsChange}
                    onWeightChange={onWeightChange}
                    handleInputChange={handleInputChange}
                    previousRepsLog={previousSetRepsLog}
                    previousWeightLog={previousSetWeightLog}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <PROverlay
        isAdvancedView={isAdvancedView}
        prData={prData}
        onClose={() => setPRData(null)}
      />
    </motion.div>
  )
}

interface SetHeaderProps {
  setOrder: number
  isCompleted: boolean
  isEditing: boolean
  onCheckClick: () => void
  onEditClick: () => void
  loggedReps: number | null
  loggedWeight: number | null
  isAdvancedView: boolean
  repRange?: string | number | null
  plannedWeight?: number | null
}

function SetHeader({
  setOrder,
  isCompleted,
  isEditing,
  onCheckClick,
  onEditClick,
  loggedReps,
  loggedWeight,
  isAdvancedView,
  repRange,
  plannedWeight,
}: SetHeaderProps) {
  const { preferences } = useUserPreferences()
  const { toDisplayWeight } = useWeightConversion()

  const showLoggedValues = isAdvancedView && isCompleted && !isEditing
  const showPlannedValues = !isAdvancedView
  plannedWeight = 40
  return (
    <div className="flex justify-between items-center gap-2">
      <p className="text-lg font-medium text-foreground pl-1">Set {setOrder}</p>

      <div className="flex items-center gap-4 flex-1 justify-end">
        <div className="relative min-h-[20px]">
          <AnimatePresence mode="wait">
            {showLoggedValues && (
              <motion.div
                key="logged-values"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.08, ease: 'easeInOut' }}
                className="text-sm text-foreground font-medium"
              >
                <span>
                  {typeof loggedReps === 'number' ? `${loggedReps} reps` : '--'}
                  {!isNil(loggedWeight) && !isNil(loggedReps) && ' x '}
                  {typeof loggedWeight === 'number'
                    ? toDisplayWeight(loggedWeight)?.toString() +
                      preferences.weightUnit
                    : ''}
                </span>
              </motion.div>
            )}
            {showPlannedValues && (
              <div className="text-sm flex items-center gap-1">
                {repRange && <span>{repRange} reps</span>}
                {plannedWeight && (
                  <>
                    {repRange && <span>×</span>}
                    <span>
                      {toDisplayWeight(plannedWeight)?.toString()}{' '}
                      {preferences.weightUnit}
                    </span>
                  </>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-2">
          <AnimatePresence mode="wait">
            {isCompleted && isAdvancedView && (
              <motion.div
                key="edit-button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <Button
                  variant="outline"
                  size="icon-md"
                  iconOnly={
                    <Edit2Icon className="size-4 text-muted-foreground" />
                  }
                  onClick={onEditClick}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            variant={isCompleted ? 'default' : 'outline'}
            size="icon-md"
            iconOnly={
              <CheckIcon
                className={cn(
                  'transition-colors',
                  isCompleted ? 'text-green-600' : '',
                )}
              />
            }
            onClick={onCheckClick}
            className={cn(
              'shadow-xs',
              isCompleted &&
                'bg-green-500/20 dark:bg-green-500/20 hover:bg-green-500/20 dark:hover:bg-green-500/20',
            )}
          />
        </div>
      </div>
    </div>
  )
}

interface SetInputsProps {
  previousRepsLog?: number | null
  previousWeightLog?: number | null
  setId: string
  reps: string
  weight: string
  repRange: string | number | null | undefined
  plannedWeight: number | null
  isAdvancedView: boolean
  hasUserEditedRef: React.MutableRefObject<boolean>
  onRepsChange: (value: string) => void
  onWeightChange: (value: string) => void
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    key: 'reps' | 'weight',
  ) => void
}

function SetInputs({
  previousRepsLog,
  previousWeightLog,
  setId,
  reps,
  weight,
  repRange,
  plannedWeight,
  isAdvancedView,
  hasUserEditedRef,
  onRepsChange,
  onWeightChange,
  handleInputChange,
}: SetInputsProps) {
  const { preferences } = useUserPreferences()
  const { toDisplayWeight, toStorageWeight } = useWeightConversion()

  const getWeightLabel = () => {
    const unit = preferences.weightUnit
    const displayPlanned = plannedWeight
      ? toDisplayWeight(plannedWeight)?.toString()
      : null
    const displayPrevious = previousWeightLog
      ? toDisplayWeight(previousWeightLog)?.toString()
      : null

    if (displayPlanned && displayPrevious) {
      return (
        <>
          {displayPlanned}
          {unit}{' '}
          <span className="text-muted-foreground">({displayPrevious})</span>
        </>
      )
    }
    if (displayPrevious) {
      return (
        <span className="text-muted-foreground">
          ({displayPrevious} {unit})
        </span>
      )
    }
    return unit
  }

  const getRepsLabel = () => {
    if (!repRange) return ''

    if (previousRepsLog) {
      return (
        <span className="flex items-center gap-1">
          <span className="text-muted-foreground flex items-center gap-1">
            ({previousRepsLog})
          </span>{' '}
          {repRange} reps
        </span>
      )
    }

    return `${repRange} reps`
  }

  return (
    <div className="grid grid-cols-2 items-end gap-2">
      {isAdvancedView ? (
        <StepperInput
          value={reps}
          onIncrement={() => {
            hasUserEditedRef.current = true
            const newReps = incrementValue(reps, () => 1)
            onRepsChange(newReps)
          }}
          onDecrement={() => {
            hasUserEditedRef.current = true
            const newReps = decrementValue(reps, () => 1)
            onRepsChange(newReps)
          }}
          label={getRepsLabel()}
          htmlFor={`set-${setId}-reps`}
        >
          <Input
            id={`set-${setId}-reps`}
            value={reps}
            onChange={(e) => handleInputChange(e, 'reps')}
            inputMode="decimal"
            variant={'ghost'}
            placeholder=""
            className="text-center text-lg rounded-none border-x border-border focus-visible:ring-0"
            size="lg"
          />
        </StepperInput>
      ) : (
        <div className="text-center text-sm">{repRange}</div>
      )}
      {isAdvancedView && (
        <StepperInput
          value={weight || '0'}
          label={getWeightLabel()}
          htmlFor={`set-${setId}-weight`}
          onIncrement={() => {
            hasUserEditedRef.current = true
            const displayWeight = toDisplayWeight(
              weight ? parseFloat(weight) : 0,
            )
            const newDisplayWeight = incrementValue(
              displayWeight?.toString() || '0',
              getWeightIncrement,
            )
            const newWeightInKg = toStorageWeight(parseFloat(newDisplayWeight))
            if (newWeightInKg !== null) {
              const rounded = Math.round(newWeightInKg * 10000) / 10000
              onWeightChange(rounded.toString())
            }
          }}
          onDecrement={() => {
            hasUserEditedRef.current = true
            const displayWeight = toDisplayWeight(
              weight ? parseFloat(weight) : 0,
            )
            const newDisplayWeight = decrementValue(
              displayWeight?.toString() || '0',
              getWeightIncrement,
            )
            const newWeightInKg = toStorageWeight(parseFloat(newDisplayWeight))
            if (newWeightInKg !== null) {
              const rounded = Math.round(newWeightInKg * 10000) / 10000
              onWeightChange(rounded.toString())
            }
          }}
        >
          <ExerciseWeightInput
            setId={setId}
            weightInKg={weight ? parseFloat(weight) : null}
            onWeightChange={(weightInKg) => {
              hasUserEditedRef.current = true
              onWeightChange(weightInKg?.toString() || '')
            }}
            placeholder=""
            disabled={false}
            showWeightUnit={false}
          />
        </StepperInput>
      )}
    </div>
  )
}

interface PROverlayProps {
  isAdvancedView: boolean
  prData: {
    show: boolean
    improvement: number
    estimated1RM: number
  } | null
  onClose: () => void
}

function PROverlay({ isAdvancedView, prData, onClose }: PROverlayProps) {
  const { preferences } = useUserPreferences()
  const { toDisplayWeight } = useWeightConversion()

  if (!isAdvancedView) return null

  return (
    <AnimatePresence mode="wait">
      {prData?.show && (
        <motion.div
          key="pr-overlay"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          exit={{ width: 0 }}
          transition={{
            duration: 1,
            type: 'spring',
            stiffness: 400,
            damping: 25,
          }}
          onClick={onClose}
          className={cn(
            sharedLayoutAdvancedStyles,
            'absolute left-0 top-0 bottom-0 z-10 h-full px-0',
          )}
        >
          <motion.div
            key="pr-overlay-content"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            exit={{ width: 0 }}
            className={cn(
              'bg-gradient-to-r from-yellow-200/10 to-yellow-300/80 dark:from-amber-400/2 dark:to-amber-600/60 backdrop-blur-[5px] rounded-r-lg h-full overflow-hidden',
              'col-span-3',
            )}
          >
            <div
              className={cn(
                'flex items-center justify-end h-full',
                'px-4 gap-4',
              )}
            >
              <motion.div
                key="pr-overlay-content-inner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.2,
                  delay: 0.2,
                  type: 'spring',
                  stiffness: 200,
                  damping: 25,
                }}
                className="flex justify-center items-center gap-4 overflow-hidden"
              >
                <div
                  className={cn(
                    'text-lg font-semibold whitespace-nowrap',
                    'text-lg',
                  )}
                >
                  <p
                    className={cn(
                      'text-[10px] font-medium whitespace-nowrap',
                      'text-[10px]',
                    )}
                  >
                    New PR!
                  </p>
                  {toDisplayWeight(prData?.estimated1RM || 10)?.toFixed(1)}{' '}
                  {preferences.weightUnit}
                </div>
                <div
                  className={cn(
                    'text-base font-medium flex items-center gap-1 text-green-600 dark:text-amber-300 whitespace-nowrap',
                    'text-base',
                  )}
                >
                  +{prData?.improvement.toFixed(1) || 3}%{' '}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
