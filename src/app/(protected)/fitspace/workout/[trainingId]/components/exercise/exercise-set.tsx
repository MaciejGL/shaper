import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { debounce, isNil } from 'lodash'
import { CheckIcon, TrophyIcon } from 'lucide-react'
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
import { SwipeToReveal } from '@/components/ui/swipe-to-reveal'
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

import {
  sharedLayoutAdvancedStyles,
  sharedLayoutSimpleStyles,
} from './shared-styles'
import { ExerciseSetProps } from './types'

export function ExerciseSet({
  set,
  previousSetWeightLog,
  previousSetRepsLog,
  reps,
  weight,
  onRepsChange,
  onWeightChange,
  onDelete,
  isLastSet,
  onSetCompleted,
  onSetUncompleted,
}: ExerciseSetProps) {
  const [dayId] = useQueryState('day')
  const { preferences } = useUserPreferences()
  const isAdvancedView = preferences.trainingView === GQLTrainingView.Advanced
  const hasUserEdited = useRef(false)
  const { toDisplayWeight } = useWeightConversion()
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
    onError: (err, newLog, context) => {
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

        // Force query refetch to ensure UI stays in sync
        queryClient.invalidateQueries({
          queryKey: useFitspaceGetWorkoutDayQuery.getKey({
            dayId: dayId ?? '',
          }),
        })

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
        if (!hasUserEdited.current) return
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
        ? formatDecimalInput(e) // For weight, use the standard function that supports comma/period
        : e.target.value.replace(/[^0-9]/g, '') // For reps, only allow digits

    hasUserEdited.current = true

    if (key === 'reps') {
      onRepsChange(sanitizedValue)
    } else {
      onWeightChange(sanitizedValue)
    }
  }

  // Get data from previous workout for the "PREVIOUS" column (same set order from most recent workout with data)
  const getPreviousSetForColumn = () => {
    if (!previousSetRepsLog && !previousSetWeightLog) return null
    return {
      reps: previousSetRepsLog,
      weight: previousSetWeightLog,
    }
  }

  const thisSet = getPreviousSetForColumn()

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

  const handleDoubleClick = useCallback(() => {
    // Clear single click timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
    }

    handleToggleSetCompletion(true) // Double click - skip timer
  }, [handleToggleSetCompletion])

  return (
    <motion.div
      key={`set-${set.id}`}
      initial={{ height: 0 }}
      animate={{ height: 'auto' }}
      exit={{ height: 0 }}
      transition={{ duration: 0.15, ease: 'linear' }}
      className="relative"
    >
      <SwipeToReveal
        actions={[
          {
            id: 'remove',
            label: 'Remove',
            onClick: onDelete,
          },
        ]}
        isSwipeable={set.isExtra}
        className={cn('bg-card', !isLastSet && 'border-b border-border/50')}
      >
        {isAdvancedView && (
          <div className="flex items-center gap-1 mb-0.5">
            <div
              className={cn(
                isAdvancedView
                  ? sharedLayoutAdvancedStyles
                  : sharedLayoutSimpleStyles,
                'pb-0.5 pt-1 leading-none',
                set.isExtra && !repRange && 'opacity-0 h-0',
              )}
            >
              <div />
              <div />
              <div className="text-[0.75rem] text-muted-foreground text-center">
                {set.isExtra && !repRange ? 'Extra' : repRange}
              </div>
              <div className="text-[0.75rem] text-muted-foreground text-center">
                {set.weight ? toDisplayWeight(set.weight)?.toFixed(1) : ''}
              </div>
              <div />
            </div>
          </div>
        )}

        <div className={cn('flex items-start gap-1 pb-1')}>
          <div
            className={cn(
              isAdvancedView
                ? sharedLayoutAdvancedStyles
                : sharedLayoutSimpleStyles,
              'text-primary relative',
              !isAdvancedView && 'pt-1',
            )}
          >
            <div className="text-sm text-muted-foreground text-center">
              {set.order}
            </div>
            {isAdvancedView && (
              <div className="text-xs text-muted-foreground text-center">
                <div>
                  {!isNil(thisSet?.reps || thisSet?.weight) ? (
                    <p>
                      {typeof thisSet?.reps === 'number'
                        ? thisSet.reps.toString()
                        : ''}
                      {!isNil(thisSet?.weight) &&
                        !isNil(thisSet?.reps) &&
                        ' x '}
                      {typeof thisSet?.weight === 'number'
                        ? toDisplayWeight(thisSet.weight)?.toString() +
                          preferences.weightUnit
                        : ''}
                    </p>
                  ) : (
                    <div className="bg-muted w-6 h-0.5 rounded-md mx-auto" />
                  )}
                </div>
              </div>
            )}
            {isAdvancedView ? (
              <Input
                id={`set-${set.id}-reps`}
                value={reps}
                onChange={(e) => handleInputChange(e, 'reps')}
                inputMode="decimal"
                variant={'secondary'}
                placeholder={previousSetRepsLog?.toString() || ''}
                className="text-center"
                size="sm"
              />
            ) : (
              <div className="text-center text-sm">
                {repRange || (previousSetRepsLog?.toString() ?? '--')}
              </div>
            )}
            {isAdvancedView ? (
              <ExerciseWeightInput
                setId={set.id}
                weightInKg={weight ? parseFloat(weight) : null}
                onWeightChange={(weightInKg) => {
                  hasUserEdited.current = true
                  onWeightChange(weightInKg?.toString() || '')
                }}
                placeholder={
                  previousSetWeightLog
                    ? toDisplayWeight(previousSetWeightLog)?.toString()
                    : ''
                }
                disabled={false}
                showWeightUnit={false}
              />
            ) : (
              <div className="text-center text-sm text-muted-foreground">
                {set.log?.weight
                  ? toDisplayWeight(set.log.weight)?.toFixed(1)
                  : set.weight
                    ? toDisplayWeight(set.weight)?.toFixed(1)
                    : previousSetWeightLog
                      ? toDisplayWeight(previousSetWeightLog)?.toFixed(1)
                      : '--'}
              </div>
            )}
            <div className="flex justify-center">
              <Button
                variant="tertiary"
                size="icon-xs"
                iconOnly={
                  <CheckIcon
                    className={cn(
                      'size-4 transition-colors',
                      set.completedAt
                        ? 'text-green-500'
                        : 'text-muted-foreground/40',
                    )}
                  />
                }
                onClick={handleClick}
                onDoubleClick={handleDoubleClick}
                className={cn(
                  'self-center',
                  set.completedAt &&
                    'bg-green-500/20 dark:bg-green-500/20 hover:bg-green-500/20 dark:hover:bg-green-500/20',
                )}
              />
            </div>
          </div>
        </div>

        {/* PR Celebration Overlay */}
        {isAdvancedView && (
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
                onClick={() => setPRData(null)}
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
                      'flex items-center justify-between h-full',
                      'px-4 gap-4',
                    )}
                  >
                    <div className="flex items-center flex-col justify-center animate-pulse">
                      <TrophyIcon
                        className={cn(
                          'text-yellow-500 dark:text-amber-400 shrink-0',
                          'size-4',
                        )}
                      />
                      <span
                        className={cn(
                          'text-[10px] font-medium whitespace-nowrap',
                          'text-[10px]',
                        )}
                      >
                        New PR!
                      </span>
                    </div>
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
                      className="flex items-baseline justify-center gap-4 overflow-hidden"
                    >
                      <div
                        className={cn(
                          'text-lg font-semibold whitespace-nowrap',
                          'text-lg',
                        )}
                      >
                        {toDisplayWeight(prData?.estimated1RM || 10)?.toFixed(
                          1,
                        )}{' '}
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
        )}
      </SwipeToReveal>
    </motion.div>
  )
}
