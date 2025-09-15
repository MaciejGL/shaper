import { useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { debounce, isNil } from 'lodash'
import { CheckIcon } from 'lucide-react'
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
        // Timer logic
        if (variables.completed && !skipTimer) {
          onSetCompleted(false)
        }
        setSkipTimer(false)
      },
      onError: () => {
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
    if (!previousSetRepsLog || !previousSetWeightLog) return null
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
          reps: reps ? +reps : previousSetRepsLog || null,
          weight: weight ? +weight : previousSetWeightLog || null,
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
                set.isExtra && 'opacity-0',
              )}
            >
              <div />
              <div />
              <div className="text-[0.75rem] text-muted-foreground text-center">
                {set.isExtra ? 'Extra' : repRange}
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
                className="self-center"
              />
            </div>
          </div>
        </div>
      </SwipeToReveal>
    </motion.div>
  )
}
