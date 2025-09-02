import { useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import React from 'react'

import { Card } from '@/components/ui/card'
import { useWorkout } from '@/context/workout-context/workout-context'
import {
  GQLFitspaceGetWorkoutQuery,
  useFitspaceGetWorkoutQuery,
  useFitspaceMarkExerciseAsCompletedMutation,
  useFitspaceRemoveExerciseFromWorkoutMutation,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'

import { ExerciseMetadata } from './exercise/exercise-metadata'
import { ExerciseSets } from './exercise/exercise-sets'
import { ExerciseProps } from './exercise/types'
import { createOptimisticExerciseUpdate } from './optimistic-updates'

export function Exercise({ exercise }: ExerciseProps) {
  const { getPastLogs } = useWorkout()
  const previousLogs = getPastLogs(exercise)
  const invalidateQuery = useInvalidateQuery()
  const queryClient = useQueryClient()
  const { trainingId } = useParams<{ trainingId: string }>()

  const { mutateAsync: markExerciseAsCompleted } =
    useFitspaceMarkExerciseAsCompletedMutation({
      onMutate: async ({ exerciseId, completed }) => {
        // Cancel outgoing queries to prevent race conditions
        const queryKey = useFitspaceGetWorkoutQuery.getKey({ trainingId })
        await queryClient.cancelQueries({ queryKey })

        // Get current data for rollback
        const previousData =
          queryClient.getQueryData<GQLFitspaceGetWorkoutQuery>(queryKey)

        // Optimistically update the cache
        queryClient.setQueryData(
          queryKey,
          createOptimisticExerciseUpdate(exerciseId, completed),
        )

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
        // Only invalidate on success to prevent race conditions with optimistic updates
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
      await markExerciseAsCompleted({
        exerciseId: exercise.substitutedBy?.id || exercise.id,
        completed: checked,
      })
    } catch (error) {
      console.error('Failed to toggle exercise completion:', error)
      // Error handling is done in the mutation onError callback
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
