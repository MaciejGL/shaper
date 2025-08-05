import { useQueryClient } from '@tanstack/react-query'
import { debounce } from 'lodash'
import { CheckIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import { AnimateChangeInHeight } from '@/components/animations/animated-height-change'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

export function ExerciseSet({ set, previousLogs }: ExerciseSetProps) {
  const { trainingId } = useParams<{ trainingId: string }>()
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
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
      onMutate: async ({ setId, completed }) => {
        // Cancel outgoing queries to prevent race conditions
        const queryKey = useFitspaceGetWorkoutQuery.getKey({ trainingId })
        await queryClient.cancelQueries({ queryKey })

        // Get current data for rollback
        const previousData =
          queryClient.getQueryData<GQLFitspaceGetWorkoutQuery>(queryKey)

        // Optimistically update the cache
        queryClient.setQueryData(
          queryKey,
          createOptimisticSetUpdate(setId, completed),
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

  const handleToggleSetCompletion = async () => {
    setIsCompletingSet(true)
    try {
      await markSetAsCompleted({
        setId: set.id,
        completed: !set.completedAt,
      })
    } catch (error) {
      console.error('Failed to toggle set completion:', error)
      setIsCompletingSet(false)
    }
  }

  useEffect(() => {
    if (set.log && !hasUserEdited.current) {
      setReps(set.log.reps?.toString() ?? '')
      setWeight(set.log.weight?.toString() ?? '')
    }
  }, [set.log])

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

  const repRange =
    set.minReps && set.maxReps
      ? `${set.minReps}-${set.maxReps}`
      : (set.minReps ?? set.maxReps ?? set.reps)

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
      setReps(sanitizedValue)
    } else {
      setWeight(sanitizedValue)
    }
  }

  const showLabel =
    !set.isExtra &&
    (set.reps || set.minReps || set.maxReps || set.weight || set.rpe)

  const lastLog = previousLogs[previousLogs.length - 1]
  const thisSet = lastLog?.sets[set.order - 1]

  return (
    <AnimateChangeInHeight>
      {showLabel && (
        <div className="flex items-center gap-1">
          <div
            className={cn(
              sharedLayoutStyles,
              'bg-secondary/50 dark:bg-card/50 pb-2 -mb-2 dark:border-none',
            )}
          >
            <div className="min-w-2.5"></div>
            <div className="text-xs text-muted-foreground text-center min-w-[96px]">
              {repRange}
            </div>
            <div className="text-xs text-muted-foreground text-center min-w-[96px]">
              {set.weight ? toDisplayWeight(set.weight)?.toFixed(1) : ''}
            </div>
            <div className="" />
            <div className="min-w-[40px]" />
          </div>
        </div>
      )}

      <div className={cn('flex items-start gap-1', set.isExtra && 'pt-2')}>
        <div>
          <div
            className={cn(
              sharedLayoutStyles,
              'rounded-md bg-muted dark:bg-secondary text-primary relative',
            )}
          >
            <div className="min-w-2.5 text-sm text-muted-foreground">
              {set.order}.
            </div>
            <Input
              id={`set-${set.id}-reps`}
              value={reps}
              onChange={(e) => handleInputChange(e, 'reps')}
              inputMode="decimal"
              variant={'secondary'}
              placeholder={thisSet?.log?.reps?.toString() || ''}
              className="min-w-[96px] text-center bg-white"
            />
            <ExerciseWeightInput
              setId={set.id}
              weightInKg={weight ? parseFloat(weight) : null}
              onWeightChange={(weightInKg) => {
                hasUserEdited.current = true
                setWeight(weightInKg?.toString() || '')
              }}
              placeholder={
                thisSet?.log?.weight
                  ? toDisplayWeight(thisSet.log.weight)?.toString()
                  : ''
              }
              disabled={false}
            />
            <div className="text-sm text-center">{set.rpe}</div>
            <div className="flex justify-center">
              <Button
                variant="tertiary"
                size="icon-sm"
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
