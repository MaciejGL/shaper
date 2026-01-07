import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { debounce } from 'lodash'
import { CheckIcon } from 'lucide-react'
import { useQueryState } from 'nuqs'
import {
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
import { useOptimisticMutation } from '@/lib/optimistic-mutations'
import { cn } from '@/lib/utils'
import { calculateEstimated1RM } from '@/utils/one-rm-calculator'

import { ExerciseWeightInput } from '../exercise-weight-input'
import { createOptimisticSetUpdate } from '../optimistic-updates'

import { sharedLayoutAdvancedStyles } from './shared-styles'
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
      onSuccess: async (data, variables) => {
        await queryClient.invalidateQueries({ queryKey: ['navigation'] })

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

        if (variables.completed) {
          onSetCompleted(false)
        }
      },
      onError: async (error, variables) => {
        console.error('Failed to mark set as completed:', error, variables)

        await queryClient.invalidateQueries({ queryKey: ['navigation'] })

        queryClient.invalidateQueries({
          queryKey: useFitspaceGetWorkoutDayQuery.getKey({
            dayId: dayId ?? '',
          }),
        })
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

  const handleToggleSetCompletion = useCallback(async () => {
    const willBeCompleted = !set.completedAt
    const repsValue = reps ? +reps : previousSetRepsLog || null
    const weightValue = weight ? +weight : previousSetWeightLog || null

    startTransition(() => {
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
    }
  }, [
    markSetAsCompletedOptimistic,
    set.completedAt,
    set.id,
    reps,
    weight,
    previousSetRepsLog,
    previousSetWeightLog,
    onSetUncompleted,
  ])

  const isCompleted = !!set.completedAt
  const { toDisplayWeight } = useWeightConversion()

  const previousDisplayWeight = previousSetWeightLog
    ? toDisplayWeight(previousSetWeightLog)?.toString()
    : null

  const targetDisplayWeight = set.weight
    ? toDisplayWeight(set.weight)?.toString()
    : null

  const displayWeight = isAdvancedView
    ? null
    : weight
      ? weight
      : (targetDisplayWeight ?? '-')

  const displayReps = set.reps
    ? `${set.reps}`
    : set.minReps
      ? set.minReps === set.maxReps
        ? `${set.minReps}`
        : `${set.minReps}-${set.maxReps}`
      : null

  return (
    <motion.div
      key={`set-${set.id}`}
      layout
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'linear' }}
    >
      {isAdvancedView && (
        <div
          className={cn(
            'relative grid grid-cols-[1.5rem_minmax(3rem,1fr)_minmax(5rem,1fr)_minmax(5rem,1fr)_2rem] gap-2 px-4 pb-[2px] items-center',
          )}
        >
          <div />
          <div />
          <div>
            <p className="text-xs text-muted-foreground text-center truncate self-center leading-none">
              {displayReps}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground text-center truncate self-center">
              {displayWeight}
            </p>
          </div>
          <div />
        </div>
      )}
      <div
        className={cn(
          'relative grid grid-cols-[1.5rem_minmax(3rem,1fr)_minmax(5rem,1fr)_minmax(5rem,1fr)_2rem] gap-2 px-2 items-center pb-2',
          'border-b border-border',
        )}
      >
        {/* Set Number */}
        <div
          className={cn(
            'text-xs font-medium text-center rounded-full size-6 flex items-center justify-center mx-auto',
            'bg-muted text-muted-foreground ',
          )}
        >
          {set.order}
        </div>

        {/* Previous Log */}
        <div className="text-xs text-muted-foreground text-center truncate ">
          {previousSetRepsLog ? `${previousSetRepsLog} × ` : ''}
          {previousDisplayWeight
            ? `${previousDisplayWeight}${preferences.weightUnit}`
            : '-'}
        </div>

        {/* Reps Input / Text */}
        {isAdvancedView ? (
          <Input
            id={`set-${set.id}-reps`}
            value={reps}
            onChange={(e) => {
              hasUserEditedRef.current = true
              const val = e.target.value.replace(/[^0-9]/g, '')
              onRepsChange(val)
            }}
            onFocus={(e) => {
              if (e.target.value) {
                requestAnimationFrame(() => e.target.select())
              }
            }}
            inputMode="numeric"
            variant="secondary"
            placeholder={set.minReps ? `${set.minReps}` : ''}
            className="text-center h-8 focus-visible:ring-0 text-sm w-full"
          />
        ) : (
          <div className="text-center text-sm font-medium">{displayReps}</div>
        )}

        {/* Weight Input / Text */}
        {isAdvancedView ? (
          <ExerciseWeightInput
            setId={set.id}
            weightInKg={weight ? parseFloat(weight) : null}
            onWeightChange={(weightInKg) => {
              hasUserEditedRef.current = true
              onWeightChange(weightInKg?.toString() || '')
            }}
            showWeightUnit={false}
          />
        ) : (
          <div className="text-center text-sm font-medium">
            {displayWeight}
            {displayWeight !== '-' && (
              <span className="text-xs text-muted-foreground ml-0.5">
                {preferences.weightUnit}
              </span>
            )}
          </div>
        )}

        {/* Check Button */}
        <div className="flex justify-center">
          <Button
            variant={isCompleted ? 'default' : 'secondary'}
            size="icon-sm"
            iconOnly={
              <CheckIcon className={cn(isCompleted && 'text-green-600')} />
            }
            onClick={handleToggleSetCompletion}
            className={cn(
              'rounded-lg',
              isCompleted &&
                'bg-green-500/20 dark:bg-green-500/20 hover:bg-green-500/20 dark:hover:bg-green-500/20',
            )}
          />
        </div>

        <PROverlay
          isAdvancedView={isAdvancedView}
          prData={prData}
          onClose={() => setPRData(null)}
        />
      </div>
    </motion.div>
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
              'bg-linear-to-r from-yellow-200/10 to-yellow-300/80 dark:from-amber-400/2 dark:to-amber-600/60 backdrop-blur-[5px] rounded-r-lg h-full overflow-hidden',
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
                <div className={cn('font-semibold whitespace-nowrap')}>
                  <p
                    className={cn(
                      'text-[10px] leading-none font-medium whitespace-nowrap',
                    )}
                  >
                    New PR!
                  </p>
                  <p className="leading-tight">
                    {toDisplayWeight(prData?.estimated1RM || 10)?.toFixed(1)}{' '}
                    {preferences.weightUnit}
                  </p>
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
