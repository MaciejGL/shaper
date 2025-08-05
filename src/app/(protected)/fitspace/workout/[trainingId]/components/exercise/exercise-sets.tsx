import { useQueryClient } from '@tanstack/react-query'
import { InfoIcon, PlusIcon, XIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import React from 'react'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  GQLFitspaceGetWorkoutQuery,
  useFitspaceAddSetMutation,
  useFitspaceGetWorkoutQuery,
  useFitspaceRemoveSetMutation,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'
import { cn } from '@/lib/utils'

import { ExerciseSet } from './exercise-set'
import { sharedLayoutStyles } from './shared-styles'
import { ExerciseSetsProps } from './types'

export function ExerciseSets({
  exercise,
  previousLogs,
  isExerciseCompleted,
}: ExerciseSetsProps) {
  const { trainingId } = useParams<{ trainingId: string }>()
  const invalidateQuery = useInvalidateQuery()
  const queryClient = useQueryClient()

  const { mutateAsync: addSet, isPending: isAddingSet } =
    useFitspaceAddSetMutation({
      onSuccess: (data) => {
        // Manually update the cache with the new set
        queryClient.setQueryData(
          useFitspaceGetWorkoutQuery.getKey({ trainingId }),
          (old: GQLFitspaceGetWorkoutQuery) => {
            if (!old?.getWorkout?.plan || !data?.addSet) return old

            const newWorkout = JSON.parse(
              JSON.stringify(old),
            ) as NonNullable<GQLFitspaceGetWorkoutQuery>
            if (!newWorkout.getWorkout?.plan) return newWorkout

            // Find the exercise and add the new set
            newWorkout.getWorkout.plan.weeks.forEach((week) => {
              week.days.forEach((day) => {
                day.exercises.forEach((exerciseItem) => {
                  const targetExerciseId =
                    exercise.substitutedBy?.id || exercise.id
                  const currentExerciseId =
                    exerciseItem.substitutedBy?.id || exerciseItem.id

                  if (currentExerciseId === targetExerciseId) {
                    const setsToUpdate =
                      exerciseItem.substitutedBy?.sets || exerciseItem.sets

                    // Get the last set to inherit target values from
                    const lastSet = setsToUpdate[setsToUpdate.length - 1]

                    // Create a properly structured set with correct order and isExtra = true
                    const newSet = {
                      ...data.addSet,
                      order: setsToUpdate.length + 1,
                      isExtra: true,
                      // Inherit target values from the last set
                      reps: lastSet?.reps || null,
                      minReps: lastSet?.minReps || null,
                      maxReps: lastSet?.maxReps || null,
                      weight: lastSet?.weight || null,
                      rpe: lastSet?.rpe || null,
                      // Always null for new sets
                      log: null,
                      completedAt: null,
                    }

                    setsToUpdate.push(newSet)
                  }
                })
              })
            })

            return newWorkout
          },
        )
      },
      onSettled: () => {
        invalidateQuery({
          queryKey: useFitspaceGetWorkoutQuery.getKey({ trainingId }),
        })
      },
    })

  const { mutateAsync: removeSet } = useFitspaceRemoveSetMutation({
    onMutate: async (variables) => {
      // Cancel outgoing queries to prevent race conditions
      const queryKey = useFitspaceGetWorkoutQuery.getKey({ trainingId })
      await queryClient.cancelQueries({ queryKey })

      // Get current data for rollback
      const previousData =
        queryClient.getQueryData<GQLFitspaceGetWorkoutQuery>(queryKey)

      // Optimistically update cache to remove the set
      queryClient.setQueryData(queryKey, (old: GQLFitspaceGetWorkoutQuery) => {
        if (!old?.getWorkout?.plan) return old

        const newWorkout = JSON.parse(
          JSON.stringify(old),
        ) as NonNullable<GQLFitspaceGetWorkoutQuery>
        if (!newWorkout.getWorkout?.plan) return newWorkout

        // Find and remove the set from the workout data
        newWorkout.getWorkout.plan.weeks.forEach((week) => {
          week.days.forEach((day) => {
            day.exercises.forEach((exercise) => {
              const setsToUpdate = exercise.substitutedBy?.sets || exercise.sets
              const setIndex = setsToUpdate.findIndex(
                (s) => s.id === variables.setId,
              )
              if (setIndex !== -1) {
                setsToUpdate.splice(setIndex, 1)
                // Reorder remaining sets
                setsToUpdate.forEach((remainingSet, index) => {
                  remainingSet.order = index + 1
                })
              }
            })
          })
        })

        return newWorkout
      })

      return { previousData }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        const queryKey = useFitspaceGetWorkoutQuery.getKey({ trainingId })
        queryClient.setQueryData(queryKey, context.previousData)
      }
    },
    onSuccess: () => {
      invalidateQuery({
        queryKey: useFitspaceGetWorkoutQuery.getKey({ trainingId }),
      })
    },
  })

  const hasRpe = exercise.sets.some((set) => set.rpe)

  const handleAddSet = async () => {
    await addSet({
      exerciseId: exercise.substitutedBy?.id || exercise.id,
    })
  }

  const removeExtraSet = async () => {
    const exerciseSets = exercise.substitutedBy?.sets || exercise.sets
    // Find the last extra set (highest order among extra sets)
    const extraSets = exerciseSets.filter((set) => set.isExtra)
    const lastExtraSet = extraSets.reduce(
      (latest, current) => (current.order > latest.order ? current : latest),
      extraSets[0],
    )

    if (lastExtraSet) {
      await removeSet({
        setId: lastExtraSet.id,
      })
    }
  }

  const hasExtraSets = (exercise.substitutedBy?.sets || exercise.sets).some(
    (set) => set.isExtra,
  )

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1">
        <div
          className={cn(sharedLayoutStyles, 'text-xs text-muted-foreground')}
        >
          <div className="min-w-2.5"></div>
          <div className="text-center min-w-[96px]">Reps</div>
          <div className="text-center min-w-[96px]">Weight</div>
          <div className={cn('text-center', !hasRpe && 'opacity-0')}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-center gap-1">
                  RPE <InfoIcon className="size-2.5 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                Suggested effort level for the set.
                <br />
                <br />
                <strong>RPE (Rate of Perceived Exertion)</strong>: A subjective
                measure of how hard an exercise feels, typically on a scale from
                1 (very easy) to 10 (maximum effort).
                <br />
                <br />
                For example, if you can do maximum 10 reps of a weight, your RPE
                is 10.
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="text-center min-w-[40px]"></div>
        </div>

        {hasExtraSets && <div className="w-8 shrink-0" />}
      </div>

      <div className="flex flex-col">
        {(exercise.substitutedBy?.sets || exercise.sets).map((set) => {
          return (
            <ExerciseSet
              key={set.id}
              set={set}
              previousLogs={previousLogs}
              isExerciseCompleted={isExerciseCompleted}
            />
          )
        })}

        <div
          className={cn(
            'grid grid-cols-1 items-center gap-2 mt-2',
            hasExtraSets && 'grid-cols-2',
          )}
        >
          {hasExtraSets && (
            <Button
              variant="tertiary"
              size="sm"
              className="w-full"
              iconStart={<XIcon />}
              onClick={removeExtraSet}
            >
              Remove last set
            </Button>
          )}
          <Button
            variant="tertiary"
            size="sm"
            className={cn('w-full')}
            iconStart={<PlusIcon />}
            loading={isAddingSet}
            onClick={handleAddSet}
          >
            Add set
          </Button>
        </div>
      </div>
    </div>
  )
}
