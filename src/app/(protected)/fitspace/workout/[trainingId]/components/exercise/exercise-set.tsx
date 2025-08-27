import { useQueryClient } from '@tanstack/react-query'
import { debounce, isNil } from 'lodash'
import { CheckIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import { AnimateChangeInHeight } from '@/components/animations/animated-height-change'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUserPreferences } from '@/context/user-preferences-context'
import {
  GQLFitspaceGetWorkoutQuery,
  useFitspaceGetWorkoutQuery,
  useFitspaceMarkSetAsCompletedMutation,
  useFitspaceUpdateSetLogMutation,
} from '@/generated/graphql-client'
import { useWeightConversion } from '@/hooks/use-weight-conversion'
import { useInvalidateQuery } from '@/lib/invalidate-query'
import { cn } from '@/lib/utils'

import { ExerciseWeightInput } from '../exercise-weight-input'
import { createOptimisticSetUpdate } from '../simple-exercise-list/optimistic-updates'

import { sharedLayoutStyles } from './shared-styles'
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
}: ExerciseSetProps) {
  const { trainingId } = useParams<{ trainingId: string }>()
  const { preferences } = useUserPreferences()

  const [isCompletingSet, setIsCompletingSet] = useState(false)
  const hasUserEdited = useRef(false)
  const { toDisplayWeight } = useWeightConversion()
  const invalidateQuery = useInvalidateQuery()
  const queryClient = useQueryClient()

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

  const { mutateAsync: markSetAsCompleted } =
    useFitspaceMarkSetAsCompletedMutation({
      onMutate: async ({ setId, completed, reps, weight }) => {
        // Cancel outgoing queries to prevent race conditions
        const queryKey = useFitspaceGetWorkoutQuery.getKey({ trainingId })
        await queryClient.cancelQueries({ queryKey })

        // Get current data for rollback
        const previousData =
          queryClient.getQueryData<GQLFitspaceGetWorkoutQuery>(queryKey)

        // Optimistically update the cache with both completion status and log values
        queryClient.setQueryData(
          queryKey,
          createOptimisticSetUpdate(setId, completed, { reps, weight }),
        )

        return { previousData }
      },
      onError: (err, variables, context) => {
        // Rollback on error
        if (context?.previousData) {
          const queryKey = useFitspaceGetWorkoutQuery.getKey({ trainingId })
          queryClient.setQueryData(queryKey, context.previousData)
        }
        setIsCompletingSet(false)
      },
      onSuccess: () => {
        invalidateQuery({
          queryKey: useFitspaceGetWorkoutQuery.getKey({ trainingId }),
        })
        setIsCompletingSet(false)
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

  const showLabel =
    !set.isExtra &&
    (set.reps || set.minReps || set.maxReps || set.weight || set.rpe)

  // Get data from previous workout for the "PREVIOUS" column (same set order from last workout)
  const lastLog = previousLogs[previousLogs.length - 1]
  const thisSet = lastLog?.sets[set.order - 1] // Same set order from previous workout

  const handleToggleSetCompletion = async () => {
    setIsCompletingSet(true)
    try {
      await markSetAsCompleted({
        setId: set.id,
        completed: !set.completedAt,
        reps: reps ? +reps : previousSetRepsLog || null,
        weight: weight ? +weight : previousSetWeightLog || null,
      })
    } catch (error) {
      console.error('Failed to toggle set completion:', error)
      setIsCompletingSet(false)
    }
  }

  return (
    <AnimateChangeInHeight>
      {showLabel && (
        <div className="flex items-center gap-1">
          <div className={cn(sharedLayoutStyles, 'pb-0.5 pt-1 leading-none')}>
            <div />
            <div />
            <div className="text-[0.625rem] text-muted-foreground text-center">
              {repRange}
            </div>
            <div className="text-[0.625rem] text-muted-foreground text-center">
              {set.weight ? toDisplayWeight(set.weight)?.toFixed(1) : ''}
            </div>
            <div />
          </div>
        </div>
      )}

      <div className={cn('flex items-start gap-1', set.isExtra && 'pt-4')}>
        <div>
          <div className={cn(sharedLayoutStyles, 'text-primary relative')}>
            <div className="text-sm text-muted-foreground">{set.order}</div>
            <div className="text-xs text-muted-foreground text-center space-y-0.5">
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
            <Input
              id={`set-${set.id}-reps`}
              value={reps}
              onChange={(e) => handleInputChange(e, 'reps')}
              inputMode="decimal"
              variant={'secondary'}
              placeholder={previousSetRepsLog?.toString() || ''}
              className="text-center bg-white"
              size="sm"
            />
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
                loading={isCompletingSet}
                onClick={handleToggleSetCompletion}
                className="self-center"
              />
            </div>
          </div>
        </div>
      </div>
    </AnimateChangeInHeight>
  )
}
