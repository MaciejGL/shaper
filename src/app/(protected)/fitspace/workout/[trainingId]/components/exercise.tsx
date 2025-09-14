import { useParams } from 'next/navigation'
import { useQueryState } from 'nuqs'
import React from 'react'

import { Card } from '@/components/ui/card'
import {
  GQLFitspaceGetWorkoutDayQuery,
  GQLFitspaceMarkExerciseAsCompletedMutation,
  useFitspaceGetWorkoutDayQuery,
  useFitspaceGetWorkoutNavigationQuery,
  useFitspaceMarkExerciseAsCompletedMutation,
  useFitspaceRemoveExerciseFromWorkoutMutation,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'
import { useOptimisticMutation } from '@/lib/optimistic-mutations'

import { ExerciseMetadata } from './exercise/exercise-metadata'
import { ExerciseSets } from './exercise/exercise-sets'
import { ExerciseProps } from './exercise/types'
import { createOptimisticExerciseUpdate } from './optimistic-updates'

export function Exercise({ exercise, previousDayLogs }: ExerciseProps) {
  const invalidateQuery = useInvalidateQuery()
  const { trainingId } = useParams<{ trainingId: string }>()
  const [dayId] = useQueryState('day')

  const { optimisticMutate: markExerciseAsCompletedOptimistic } =
    useOptimisticMutation<
      GQLFitspaceGetWorkoutDayQuery,
      GQLFitspaceMarkExerciseAsCompletedMutation,
      { exerciseId: string; completed: boolean }
    >({
      queryKey: useFitspaceGetWorkoutDayQuery.getKey({ dayId: dayId ?? '' }),
      mutationFn: useFitspaceMarkExerciseAsCompletedMutation().mutateAsync,
      updateFn: (oldData, { exerciseId, completed }) => {
        const updateFn = createOptimisticExerciseUpdate(exerciseId, completed)
        return updateFn(oldData)
      },
      onSuccess: () => {
        invalidateQuery({
          queryKey: useFitspaceGetWorkoutNavigationQuery.getKey({ trainingId }),
        })
      },
      onError: () => {
        invalidateQuery({
          queryKey: useFitspaceGetWorkoutDayQuery.getKey({
            dayId: dayId ?? '',
          }),
        })
      },
    })

  const { mutateAsync: removeExercise, isPending: isRemoving } =
    useFitspaceRemoveExerciseFromWorkoutMutation({
      onSuccess: () => {
        invalidateQuery({
          queryKey: useFitspaceGetWorkoutDayQuery.getKey({
            dayId: dayId ?? '',
          }),
        })
        invalidateQuery({
          queryKey: useFitspaceGetWorkoutNavigationQuery.getKey({ trainingId }),
        })
      },
    })

  const handleMarkAsCompleted = async (checked: boolean) => {
    try {
      await markExerciseAsCompletedOptimistic({
        exerciseId: exercise.substitutedBy?.id || exercise.id,
        completed: checked,
      })
    } catch (error) {
      console.error('Failed to toggle exercise completion:', error)
      // Error handling is done in useOptimisticMutation
    }
  }

  const handleRemoveExercise = async () => {
    await removeExercise({
      exerciseId: exercise.id,
    })
  }

  // Get the completion state from the exercise data (cache will update optimistically)
  const currentExercise = exercise.substitutedBy || exercise
  const isExerciseCompleted = Boolean(currentExercise.completedAt)

  const exercisePreviousLogs = previousDayLogs?.find(
    (log) => log.exerciseName === exercise.name,
  )

  return (
    <Card borderless className="p-0 gap-2">
      <div className="px-2 pt-2">
        <ExerciseMetadata
          exercise={exercise}
          handleMarkAsCompleted={handleMarkAsCompleted}
          isCompleted={isExerciseCompleted}
          handleRemoveExercise={handleRemoveExercise}
          isRemoving={isRemoving}
        />
      </div>
      <ExerciseSets
        exercise={exercise}
        previousLogs={exercisePreviousLogs?.sets}
      />
    </Card>
  )
}
