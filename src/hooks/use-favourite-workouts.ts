import { useQueryClient } from '@tanstack/react-query'

import {
  GQLCreateFavouriteWorkoutInput,
  GQLStartWorkoutFromFavouriteInput,
  GQLUpdateFavouriteWorkoutInput,
  useCreateFavouriteWorkoutMutation,
  useDeleteFavouriteWorkoutMutation,
  useGetFavouriteWorkoutsQuery,
  useStartWorkoutFromFavouriteMutation,
  useUpdateFavouriteWorkoutMutation,
} from '@/generated/graphql-client'

// Hook to fetch all favourite workouts
export function useFavouriteWorkouts() {
  return useGetFavouriteWorkoutsQuery()
}

// Hook to create a new favourite workout
export function useCreateFavouriteWorkout() {
  const queryClient = useQueryClient()

  return useCreateFavouriteWorkoutMutation({
    onSuccess: () => {
      // Invalidate and refetch favourite workouts
      queryClient.invalidateQueries({ queryKey: ['GetFavouriteWorkouts'] })
    },
  })
}

// Hook to update an existing favourite workout
export function useUpdateFavouriteWorkout() {
  const queryClient = useQueryClient()

  return useUpdateFavouriteWorkoutMutation({
    onSuccess: () => {
      // Invalidate and refetch favourite workouts
      queryClient.invalidateQueries({ queryKey: ['GetFavouriteWorkouts'] })
    },
  })
}

// Hook to delete a favourite workout
export function useDeleteFavouriteWorkout() {
  const queryClient = useQueryClient()

  return useDeleteFavouriteWorkoutMutation({
    onSuccess: () => {
      // Invalidate and refetch favourite workouts
      queryClient.invalidateQueries({ queryKey: ['GetFavouriteWorkouts'] })
    },
  })
}

// Hook to start a workout from a favourite
export function useStartWorkoutFromFavourite() {
  const queryClient = useQueryClient()

  return useStartWorkoutFromFavouriteMutation({
    onSuccess: () => {
      // Invalidate quick workout plan data since it was modified
      queryClient.invalidateQueries({
        queryKey: ['FitspaceGetUserQuickWorkoutPlan'],
      })
      queryClient.invalidateQueries({ queryKey: ['FitspaceMyPlans'] })
    },
  })
}

// Helper hook for favourite workout operations
export function useFavouriteWorkoutOperations() {
  const createFavourite = useCreateFavouriteWorkout()
  const updateFavourite = useUpdateFavouriteWorkout()
  const deleteFavourite = useDeleteFavouriteWorkout()
  const startFromFavourite = useStartWorkoutFromFavourite()

  const handleCreateFavourite = async (
    input: GQLCreateFavouriteWorkoutInput,
  ) => {
    return createFavourite.mutateAsync({ input })
  }

  const handleUpdateFavourite = async (
    input: GQLUpdateFavouriteWorkoutInput,
  ) => {
    return updateFavourite.mutateAsync({ input })
  }

  const handleDeleteFavourite = async (id: string) => {
    return deleteFavourite.mutateAsync({ id })
  }

  const handleStartFromFavourite = async (
    input: GQLStartWorkoutFromFavouriteInput,
  ) => {
    return startFromFavourite.mutateAsync({ input })
  }

  return {
    createFavourite: handleCreateFavourite,
    updateFavourite: handleUpdateFavourite,
    deleteFavourite: handleDeleteFavourite,
    startFromFavourite: handleStartFromFavourite,
    isCreating: createFavourite.isPending,
    isUpdating: updateFavourite.isPending,
    isDeleting: deleteFavourite.isPending,
    isStarting: startFromFavourite.isPending,
  }
}
