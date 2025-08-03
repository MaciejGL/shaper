import { useQueryClient } from '@tanstack/react-query'

import {
  GQLCreateFavouriteWorkoutInput,
  GQLFitspaceGenerateAiWorkoutMutation,
  GQLStartWorkoutFromFavouriteInput,
  GQLUpdateFavouriteWorkoutInput,
  useCreateFavouriteWorkoutMutation,
  useDeleteFavouriteWorkoutMutation,
  useGetFavouriteWorkoutsQuery,
  useStartWorkoutFromFavouriteMutation,
  useUpdateFavouriteWorkoutMutation,
} from '@/generated/graphql-client'

export function useFavouriteWorkouts() {
  return useGetFavouriteWorkoutsQuery()
}

export function useCreateFavouriteWorkout() {
  const queryClient = useQueryClient()

  return useCreateFavouriteWorkoutMutation({
    onSuccess: () => {
      // Invalidate and refetch favourites list
      queryClient.invalidateQueries({ queryKey: ['GetFavouriteWorkouts'] })
    },
  })
}

export function useUpdateFavouriteWorkout() {
  const queryClient = useQueryClient()

  return useUpdateFavouriteWorkoutMutation({
    onSuccess: () => {
      // Invalidate and refetch favourites list
      queryClient.invalidateQueries({ queryKey: ['GetFavouriteWorkouts'] })
    },
  })
}

export function useDeleteFavouriteWorkout() {
  const queryClient = useQueryClient()

  return useDeleteFavouriteWorkoutMutation({
    onSuccess: () => {
      // Invalidate and refetch favourites list
      queryClient.invalidateQueries({ queryKey: ['GetFavouriteWorkouts'] })
    },
  })
}

export function useStartWorkoutFromFavourite() {
  return useStartWorkoutFromFavouriteMutation()
}

// Consolidated hook for all favourite workout operations
export function useFavouriteWorkoutOperations() {
  const createMutation = useCreateFavouriteWorkout()
  const updateMutation = useUpdateFavouriteWorkout()
  const deleteMutation = useDeleteFavouriteWorkout()
  const startFromFavouriteMutation = useStartWorkoutFromFavourite()

  return {
    // Create operation
    createFavourite: (input: GQLCreateFavouriteWorkoutInput) =>
      createMutation.mutateAsync({ input }),
    isCreating: createMutation.isPending,
    createError: createMutation.error,

    // Update operation
    updateFavourite: (input: GQLUpdateFavouriteWorkoutInput) =>
      updateMutation.mutateAsync({ input }),
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,

    // Delete operation
    deleteFavourite: (id: string) => deleteMutation.mutateAsync({ id }),
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,

    // Start from favourite operation
    startFromFavourite: (input: GQLStartWorkoutFromFavouriteInput) =>
      startFromFavouriteMutation.mutateAsync({ input }),
    isStarting: startFromFavouriteMutation.isPending,
    startError: startFromFavouriteMutation.error,
  }
}

// Types for wizard integration
export interface FavouriteWorkoutExerciseData {
  exerciseId: string
  order: number
  name?: string
  baseId?: string
  restSeconds?: number
  instructions?: string
  sets: {
    order: number
    reps?: number
    minReps?: number
    maxReps?: number
    weight?: number
    rpe?: number
  }[]
}

export interface FavouriteWorkoutWizardData {
  title: string
  description?: string
  exercises: FavouriteWorkoutExerciseData[]
}

// Hook for creating favourite workout from wizard data (manual flow)
export function useCreateFavouriteFromManual() {
  const { createFavourite, isCreating, createError } =
    useFavouriteWorkoutOperations()

  const createFromManual = async (
    workoutData: Pick<FavouriteWorkoutWizardData, 'title' | 'description'>,
    selectedExercises: string[],
  ): Promise<string> => {
    if (selectedExercises.length === 0) {
      throw new Error('No exercises selected')
    }

    // Transform manual selection to favourite workout format
    const exercises = selectedExercises.map((exerciseId, index) => ({
      name: `Exercise ${index + 1}`, // Will be resolved by baseId on server
      order: index + 1,
      baseId: exerciseId,
      restSeconds: null,
      instructions: null,
      sets: [
        // Create default sets for manual selection
        {
          order: 1,
          reps: null,
          minReps: null,
          maxReps: null,
          weight: null,
          rpe: null,
        },
        {
          order: 2,
          reps: null,
          minReps: null,
          maxReps: null,
          weight: null,
          rpe: null,
        },
        {
          order: 3,
          reps: null,
          minReps: null,
          maxReps: null,
          weight: null,
          rpe: null,
        },
      ],
    }))

    const input: GQLCreateFavouriteWorkoutInput = {
      title: workoutData.title,
      description: workoutData.description || null,
      exercises,
    }

    const result = await createFavourite(input)
    return result.createFavouriteWorkout.id
  }

  return {
    createFromManual,
    isCreating,
    createError,
  }
}

// Hook for creating favourite workout from AI data
export function useCreateFavouriteFromAI() {
  const { createFavourite, isCreating, createError } =
    useFavouriteWorkoutOperations()

  const createFromAI = async (
    workoutData: Pick<FavouriteWorkoutWizardData, 'title' | 'description'>,
    aiWorkoutResult: GQLFitspaceGenerateAiWorkoutMutation['generateAiWorkout'], // AI workout result type from existing system
  ): Promise<string> => {
    if (!aiWorkoutResult?.exercises || aiWorkoutResult.exercises.length === 0) {
      throw new Error('No AI workout result available')
    }

    // Transform AI workout data to favourite workout format
    const exercises = aiWorkoutResult.exercises.map(
      (aiExercise, index: number) => ({
        name: aiExercise.exercise.name,
        order: index + 1,
        baseId: aiExercise.exercise.id,
        restSeconds: null,
        instructions: null,
        sets:
          aiExercise.sets?.map((aiSet, setIndex: number) => ({
            order: setIndex + 1,
            reps: aiSet?.reps || null,
            minReps: null, // AI doesn't provide min/max, just target reps
            maxReps: null,
            rpe: aiSet?.rpe || null,
            weight: null, // User will set this later
          })) || [],
      }),
    )

    const input: GQLCreateFavouriteWorkoutInput = {
      title: workoutData.title,
      description: workoutData.description || null,
      exercises,
    }

    const result = await createFavourite(input)
    return result.createFavouriteWorkout.id
  }

  return {
    createFromAI,
    isCreating,
    createError,
  }
}

// Hook for updating favourite workout (for edit functionality)
export function useUpdateFavouriteFromWizard() {
  const { updateFavourite, isUpdating, updateError } =
    useFavouriteWorkoutOperations()

  const updateFromWizard = async (
    favouriteId: string,
    workoutData: FavouriteWorkoutWizardData,
  ): Promise<string> => {
    const input: GQLUpdateFavouriteWorkoutInput = {
      id: favouriteId,
      title: workoutData.title,
      description: workoutData.description || null,
      exercises: workoutData.exercises.map((exercise) => ({
        name: exercise.name || `Exercise ${exercise.order}`,
        order: exercise.order,
        baseId: exercise.baseId || null,
        restSeconds: exercise.restSeconds || null,
        instructions: exercise.instructions || null,
        sets: exercise.sets.map((set) => ({
          order: set.order,
          reps: set.reps || null,
          minReps: set.minReps || null,
          maxReps: set.maxReps || null,
          weight: set.weight || null,
          rpe: set.rpe || null,
        })),
      })),
    }

    const result = await updateFavourite(input)
    return result.updateFavouriteWorkout.id
  }

  return {
    updateFromWizard,
    isUpdating,
    updateError,
  }
}
