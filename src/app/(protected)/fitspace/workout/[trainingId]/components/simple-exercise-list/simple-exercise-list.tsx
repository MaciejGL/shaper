import { useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { useState } from 'react'

import { useWorkout } from '@/context/workout-context/workout-context'
import {
  type GQLFitspaceGetWorkoutQuery,
  useFitspaceGetWorkoutQuery,
  useFitspaceMarkExerciseAsCompletedMutation,
  useFitspaceMarkSetAsCompletedMutation,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'

import { Summary } from '../summary'

import {
  createOptimisticExerciseUpdate,
  createOptimisticSetUpdate,
} from './optimistic-updates'
import { SimpleExercise } from './simple-exercise'

export function SimpleExerciseList() {
  const { activeDay } = useWorkout()
  const { trainingId } = useParams<{ trainingId: string }>()
  const invalidateQuery = useInvalidateQuery()
  const queryClient = useQueryClient()

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
        invalidateQuery({
          queryKey: useFitspaceGetWorkoutQuery.getKey({
            trainingId: trainingId,
          }),
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
      },
      onSuccess: () => {
        invalidateQuery({
          queryKey: useFitspaceGetWorkoutQuery.getKey({ trainingId }),
        })
      },
    })

  const [completingSets, setCompletingSets] = useState<Set<string>>(new Set())
  const [completingExercises, setCompletingExercises] = useState<Set<string>>(
    new Set(),
  )

  if (!activeDay) return null

  const completedExercises = activeDay.exercises.filter(
    (exercise) => exercise.completedAt,
  ).length

  const totalExercises = activeDay.exercises.length
  const allCompleted = completedExercises === totalExercises

  const handleToggleExercise = async (
    exerciseId: string,
    completed: boolean,
  ) => {
    if (completingExercises.has(exerciseId)) return

    setCompletingExercises((prev) => new Set(prev).add(exerciseId))

    try {
      await markExerciseAsCompleted({
        exerciseId,
        completed,
      })
    } catch (error) {
      console.error('Failed to toggle exercise:', error)
    } finally {
      setCompletingExercises((prev) => {
        const next = new Set(prev)
        next.delete(exerciseId)
        return next
      })
    }
  }

  const handleToggleSet = async (setId: string, completed: boolean) => {
    if (completingSets.has(setId)) return

    setCompletingSets((prev) => new Set(prev).add(setId))

    try {
      await markSetAsCompleted({
        setId,
        completed,
      })
    } catch (error) {
      console.error('Failed to toggle set:', error)
    } finally {
      setCompletingSets((prev) => {
        const next = new Set(prev)
        next.delete(setId)
        return next
      })
    }
  }

  return (
    <div className="space-y-4 pb-24">
      <div className="space-y-6">
        {activeDay.exercises.map((exercise) => (
          <SimpleExercise
            key={exercise.id}
            exercise={exercise}
            handleToggleExercise={handleToggleExercise}
            completingExercises={completingExercises}
            handleToggleSet={handleToggleSet}
            completingSets={completingSets}
          />
        ))}
      </div>

      {!activeDay.isRestDay && <Summary open={allCompleted} />}
    </div>
  )
}
