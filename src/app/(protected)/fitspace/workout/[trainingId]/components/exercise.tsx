import { useParams } from 'next/navigation'
import React from 'react'

import { Card } from '@/components/ui/card'
import { useWorkout } from '@/context/workout-context/workout-context'
import {
  GQLFitspaceGetWorkoutQuery,
  GQLFitspaceMarkExerciseAsCompletedMutation,
  useFitspaceGetWorkoutQuery,
  useFitspaceMarkExerciseAsCompletedMutation,
  useFitspaceRemoveExerciseFromWorkoutMutation,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'
import { useOptimisticMutation } from '@/lib/optimistic-mutations'

import { ExerciseMetadata } from './exercise/exercise-metadata'
import { ExerciseSets } from './exercise/exercise-sets'
import { ExerciseProps } from './exercise/types'
import { createOptimisticExerciseUpdate } from './optimistic-updates'

export function Exercise({ exercise }: ExerciseProps) {
  const { getPastLogs } = useWorkout()
  const previousLogs = getPastLogs(exercise)
  const invalidateQuery = useInvalidateQuery()
  const { trainingId } = useParams<{ trainingId: string }>()

  const { optimisticMutate: markExerciseAsCompletedOptimistic } =
    useOptimisticMutation<
      GQLFitspaceGetWorkoutQuery,
      GQLFitspaceMarkExerciseAsCompletedMutation,
      { exerciseId: string; completed: boolean }
    >({
      queryKey: useFitspaceGetWorkoutQuery.getKey({ trainingId }),
      mutationFn: useFitspaceMarkExerciseAsCompletedMutation().mutateAsync,
      updateFn: (oldData, { exerciseId, completed }) => {
        const updateFn = createOptimisticExerciseUpdate(exerciseId, completed)
        return updateFn(oldData)
      },
      onSuccess: () => {
        invalidateQuery({
          queryKey: useFitspaceGetWorkoutQuery.getKey({ trainingId }),
        })
      },
    })

  const { mutateAsync: removeExercise, isPending: isRemoving } =
    useFitspaceRemoveExerciseFromWorkoutMutation({
      onSuccess: () => {
        invalidateQuery({
          queryKey: useFitspaceGetWorkoutQuery.getKey({
            trainingId: trainingId,
          }),
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
      <ExerciseSets exercise={exercise} previousLogs={previousLogs} />
    </Card>
  )
}
