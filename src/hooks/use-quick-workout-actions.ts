import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import {
  useAddExercisesToQuickWorkoutMutation,
  useFitspaceGetUserQuickWorkoutPlanQuery,
  useFitspaceRemoveExerciseFromWorkoutMutation,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'

/**
 * Custom hook for managing quick workout actions
 * Handles mutations, navigation, and related side effects
 */
export function useQuickWorkoutActions() {
  const router = useRouter()
  const invalidateQuery = useInvalidateQuery()

  // Mutations
  const { mutateAsync: addExercises, isPending: isAddingExercises } =
    useAddExercisesToQuickWorkoutMutation({
      onSuccess: () => {
        invalidateQuery({
          queryKey: useFitspaceGetUserQuickWorkoutPlanQuery.getKey(),
        })
        invalidateQuery({
          queryKey: ['FitspaceGetWorkout'],
        })
      },
    })

  const { mutateAsync: removeExercise, isPending: isRemovingExercise } =
    useFitspaceRemoveExerciseFromWorkoutMutation({
      onSuccess: () => {
        invalidateQuery({
          queryKey: useFitspaceGetUserQuickWorkoutPlanQuery.getKey(),
        })
      },
    })

  // Add exercises to workout and navigate
  const handleAddExercises = async (
    exercisesToAdd: { exerciseId: string; order: number }[],
    quickWorkoutPlanId?: string,
  ) => {
    try {
      await addExercises({
        exercises: exercisesToAdd,
      })

      if (quickWorkoutPlanId) {
        router.push(`/fitspace/workout/${quickWorkoutPlanId}`)
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to add exercises')
    }
  }

  // Remove exercise from workout
  const handleRemoveExercise = async (exerciseId: string) => {
    try {
      await removeExercise({ exerciseId })
    } catch (error) {
      console.error(error)
      toast.error('Failed to remove exercise')
    }
  }

  // Navigation actions
  const navigateToWorkout = (planId: string) => {
    router.push(`/fitspace/workout/${planId}`)
  }

  return {
    // State
    isAddingExercises,
    isRemovingExercise,
    isLoading: isAddingExercises || isRemovingExercise,

    // Actions
    handleAddExercises,
    handleRemoveExercise,
    navigateToWorkout,
  }
}
