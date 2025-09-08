import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { debounce, isNil } from 'lodash'
import { CheckIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import React, {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { Button } from '@/components/ui/button'
import { CountdownTimer } from '@/components/ui/countdown-timer'
import { Input } from '@/components/ui/input'
import { SwipeToReveal } from '@/components/ui/swipe-to-reveal'
import { useUserPreferences } from '@/context/user-preferences-context'
import {
  GQLFitspaceGetWorkoutQuery,
  GQLFitspaceMarkSetAsCompletedMutation,
  GQLTrainingView,
  useFitspaceGetWorkoutQuery,
  useFitspaceMarkSetAsCompletedMutation,
  useFitspaceUpdateSetLogMutation,
} from '@/generated/graphql-client'
import { useWeightConversion } from '@/hooks/use-weight-conversion'
import { useInvalidateQuery } from '@/lib/invalidate-query'
import { useOptimisticMutation } from '@/lib/optimistic-mutations'
import { cn } from '@/lib/utils'

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
  previousLogs,
  reps,
  weight,
  onRepsChange,
  onWeightChange,
  onDelete,
  isLastSet,
  restDuration,
}: ExerciseSetProps) {
  const { trainingId } = useParams<{ trainingId: string }>()
  const { preferences } = useUserPreferences()
  const isAdvancedView = preferences.trainingView === GQLTrainingView.Advanced
  const hasUserEdited = useRef(false)
  const { toDisplayWeight } = useWeightConversion()
  const invalidateQuery = useInvalidateQuery()
  const queryClient = useQueryClient()
  const [isTimerOperations, setIsTimerOperations] = useState(false)
  const [skipTimer, setSkipTimer] = useState(false)
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { mutateAsync: updateSetLog } = useFitspaceUpdateSetLogMutation({
    onMutate: async (newLog) => {
      await queryClient.cancelQueries({
        queryKey: useFitspaceGetWorkoutQuery.getKey({ trainingId }),
      })

      const previousWorkout = queryClient.getQueryData(
        useFitspaceGetWorkoutQuery.getKey({ trainingId }),
      )

      queryClient.setQueryData(
        useFitspaceGetWorkoutQuery.getKey({ trainingId }),
        (old: GQLFitspaceGetWorkoutQuery) => {
          if (!old?.getWorkout?.plan) return old

          const newWorkout = JSON.parse(
            JSON.stringify(old),
          ) as NonNullable<GQLFitspaceGetWorkoutQuery>
          if (!newWorkout.getWorkout?.plan) return newWorkout

          const updatedSet = newWorkout.getWorkout.plan.weeks
            .flatMap((week) => week.days)
            .flatMap((day) => day.exercises)
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

          return newWorkout
        },
      )

      return { previousWorkout }
    },
    onError: (err, newLog, context) => {
      if (context?.previousWorkout) {
        queryClient.setQueryData(
          useFitspaceGetWorkoutQuery.getKey({ trainingId }),
          context.previousWorkout,
        )
      }
    },
    onSettled: () => {
      invalidateQuery({
        queryKey: useFitspaceGetWorkoutQuery.getKey({ trainingId }),
      })
    },
  })

  // ✅ Simplified using existing useOptimisticMutation pattern
  const { optimisticMutate: markSetAsCompletedOptimistic } =
    useOptimisticMutation<
      GQLFitspaceGetWorkoutQuery,
      GQLFitspaceMarkSetAsCompletedMutation,
      {
        setId: string
        completed: boolean
        reps?: number | null
        weight?: number | null
      }
    >({
      queryKey: useFitspaceGetWorkoutQuery.getKey({ trainingId }),
      mutationFn: useFitspaceMarkSetAsCompletedMutation().mutateAsync,
      updateFn: (oldData, { setId, completed, reps, weight }) => {
        const updateFn = createOptimisticSetUpdate(setId, completed, {
          reps,
          weight,
        })
        return updateFn(oldData)
      },
      onSuccess: (data, variables) => {
        // Timer logic
        if (variables.completed && !skipTimer) {
          setIsTimerOperations(true)
        }
        setSkipTimer(false)
      },
      onError: () => {
        // Reset timer states on error
        setIsTimerOperations(false)
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
      }, 500),
    [set.id, updateSetLog],
  )

  useEffect(() => {
    debouncedUpdate(reps, weight)
    return () => debouncedUpdate.cancel()
  }, [reps, weight, debouncedUpdate])

  const repRange = useMemo(() => {
    switch (true) {
      case typeof set.minReps === 'number' &&
        typeof set.maxReps === 'number' &&
        set.minReps === set.maxReps:
        return `${set.minReps}`
      case typeof set.minReps === 'number' && typeof set.maxReps === 'number':
        return `${set.minReps}-${set.maxReps}`
      case typeof set.minReps === 'number':
        return `${set.minReps}`
      case typeof set.maxReps === 'number':
        return `${set.maxReps}`
      default:
        return set.reps
    }
  }, [set.minReps, set.maxReps, set.reps])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: 'reps' | 'weight',
  ) => {
    const sanitizedValue = e.target.value
      .replace(',', '.') // Replace comma with dot
      .replace(/[^0-9.]/g, '') // Remove anything not digit or dot
      .replace(/(\..*)\./g, '$1') // Prevent more than one dot

    hasUserEdited.current = true

    if (key === 'reps') {
      onRepsChange(sanitizedValue)
    } else {
      onWeightChange(sanitizedValue)
    }
  }

  // Get data from previous workout for the "PREVIOUS" column (same set order from most recent workout with data)
  const getPreviousSetForColumn = () => {
    // Look through previous workouts from most recent to oldest to find logged data
    for (let i = previousLogs.length - 1; i >= 0; i--) {
      const workoutLog = previousLogs[i]
      const correspondingSet = workoutLog.sets.find(
        (s) => s.order === set.order,
      )
      if (correspondingSet?.log) {
        return correspondingSet
      }
    }
    return null
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

      // Set skip timer flag for double clicks
      if (isDoubleClick) {
        setSkipTimer(true)
      }

      startTransition(() => {
        // Close timer immediately for uncompleting
        if (!willBeCompleted) {
          setIsTimerOperations(false)
        }
      })

      try {
        await markSetAsCompletedOptimistic({
          setId: set.id,
          completed: willBeCompleted,
          reps: reps ? +reps : previousSetRepsLog || null,
          weight: weight ? +weight : previousSetWeightLog || null,
        })
      } catch (error) {
        console.error('Failed to toggle set completion:', error)
        // Reset timer states on error (error handling is also done in the mutation onError)
        setIsTimerOperations(false)
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
          <div className="flex items-center gap-1">
            <div
              className={cn(
                isAdvancedView
                  ? sharedLayoutAdvancedStyles
                  : sharedLayoutSimpleStyles,
                'pb-0.5 pt-1 leading-none',
                set.isExtra && 'opacity-0',
              )}
            >
              <div />
              <div />
              <div className="text-[0.625rem] text-muted-foreground text-center">
                {set.isExtra ? 'Extra' : repRange}
              </div>
              <div className="text-[0.625rem] text-muted-foreground text-center">
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
                  {!isNil(thisSet?.log?.reps || thisSet?.log?.weight) ? (
                    <p>
                      {typeof thisSet?.log?.reps === 'number'
                        ? thisSet.log.reps.toString()
                        : ''}
                      {!isNil(thisSet?.log?.weight) &&
                        !isNil(thisSet?.log?.reps) &&
                        ' x '}
                      {typeof thisSet?.log?.weight === 'number'
                        ? toDisplayWeight(thisSet.log.weight)?.toString() +
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
                {set.log?.reps
                  ? set.log.reps.toString()
                  : repRange || (previousSetRepsLog?.toString() ?? '--')}
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
                className="self-center"
              />
            </div>
          </div>
        </div>
        <AnimatePresence mode="wait">
          {isAdvancedView && isTimerOperations && restDuration && (
            <motion.div
              key={`timer-${set.id}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: 'auto',
                opacity: 1,
              }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15, ease: 'linear' }}
              style={{ overflow: 'hidden' }}
            >
              <div className="py-1 px-2">
                <CountdownTimer
                  restDuration={restDuration || 60}
                  autoStart={isTimerOperations}
                  onComplete={() => setIsTimerOperations(false)}
                  onPause={() => setIsTimerOperations(false)}
                  size="xs"
                  className="w-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SwipeToReveal>
    </motion.div>
  )
}
