import { useQueryClient } from '@tanstack/react-query'
import { isToday } from 'date-fns'
import { useRouter } from 'next/navigation'

import {
  GQLCreateFavouriteWorkoutInput,
  GQLFitspaceGenerateAiWorkoutMutation,
  GQLFitspaceMyPlansQuery,
  GQLStartWorkoutFromFavouriteInput,
  GQLUpdateFavouriteWorkoutInput,
  useCreateFavouriteWorkoutMutation,
  useDeleteFavouriteWorkoutMutation,
  useFitspaceMyPlansQuery,
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
  const queryClient = useQueryClient()
  const router = useRouter()

  return useStartWorkoutFromFavouriteMutation({
    onSuccess: async (data) => {
      if (!data.startWorkoutFromFavourite) return

      // Parse the return format: planId|weekId|dayId
      const parts = data.startWorkoutFromFavourite.split('|')
      let planId: string

      if (parts.length === 3) {
        planId = parts[0]
      } else {
        // Fallback to old format (just plan ID)
        planId = data.startWorkoutFromFavourite
      }

      // Invalidate and wait for the specific workout query to refetch
      await queryClient.invalidateQueries({
        queryKey: ['FitspaceGetWorkout', { trainingId: planId }],
      })
      await queryClient.refetchQueries({
        queryKey: ['FitspaceGetWorkout', { trainingId: planId }],
      })

      // Also invalidate other queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['FitspaceMyPlans'] }),
        queryClient.invalidateQueries({ queryKey: ['GetQuickWorkoutPlan'] }),
      ])

      // Now navigate with fresh data guaranteed
      if (parts.length === 3) {
        const [, weekId, dayId] = parts
        router.push(
          `/fitspace/workout/quick-workout?week=${weekId}&day=${dayId}`,
        )
      } else {
        router.push(`/fitspace/workout/quick-workout`)
      }
    },
  })
}

// Types for workout status analysis
export type WorkoutStatus =
  | 'can-start' // No active plan or rest day - can start favourite workout
  | 'has-workout' // Has existing workout today - needs confirmation
  | 'active-plan-workout' // Active plan with workout today - should disable
  | 'rest-day' // Rest day in active plan - can start with confirmation

export interface WorkoutStatusAnalysis {
  status: WorkoutStatus
  canStart: boolean
  needsConfirmation: boolean
  message: string
  activePlan?: NonNullable<
    GQLFitspaceMyPlansQuery['getMyPlansOverviewFull']
  >['activePlan']
  todaysWorkout?: NonNullable<
    NonNullable<
      NonNullable<GQLFitspaceMyPlansQuery>['getMyPlansOverviewFull']
    >['quickWorkoutPlan']
  >['weeks'][number]['days'][number]
}

/**
 * Hook to analyze user's current workout status for starting favourite workouts
 */
export function useFavouriteWorkoutStatus(): WorkoutStatusAnalysis {
  const { data: plansData } = useFitspaceMyPlansQuery()

  const activePlan = plansData?.getMyPlansOverviewFull?.activePlan
  const quickWorkoutPlan = plansData?.getMyPlansOverviewFull?.quickWorkoutPlan

  // If user has an active assigned plan (from trainer/premade), always disable favourite workouts
  if (activePlan) {
    return {
      status: 'active-plan-workout',
      canStart: false,
      needsConfirmation: false,
      message:
        'You have an active training plan. Complete your plan first, then use quick workouts for extra training.',
      activePlan,
    }
  }

  // No active assigned plan - check quick workout plan for today's schedule
  if (quickWorkoutPlan?.weeks) {
    // Check if today has exercises in quick workout plan
    const todaysDay = quickWorkoutPlan.weeks
      .flatMap((week) => week.days)
      .find((day) => day.scheduledAt && isToday(new Date(day.scheduledAt)))

    if (todaysDay?.exercises && todaysDay.exercises.length > 0) {
      return {
        status: 'has-workout',
        canStart: true,
        needsConfirmation: true,
        message:
          'You have a workout planned for today. Starting a favourite will replace it.',
        todaysWorkout: todaysDay,
      }
    }
  }

  // No active plan and no quick workout scheduled for today - ready to start
  return {
    status: 'can-start',
    canStart: true,
    needsConfirmation: false,
    message: 'Ready to start your favourite workout!',
  }
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
  name: string // Required field - should always be provided
  baseId?: string
  restSeconds?: number
  description?: string
  instructions?: string[]
  tips?: string[]
  difficulty?: string
  additionalInstructions?: string
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
    selectedExerciseObjects: { id: string; name: string }[],
  ): Promise<string> => {
    if (selectedExerciseObjects.length === 0) {
      throw new Error('No exercises selected')
    }

    // Transform manual selection to favourite workout format
    const exercises = selectedExerciseObjects.map((exercise, index) => ({
      name: exercise.name, // Use actual exercise name
      order: index + 1,
      baseId: exercise.id,
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
        name: exercise.name, // Exercise name should always be provided from the wizard now
        order: exercise.order,
        baseId: exercise.baseId || null,
        restSeconds: exercise.restSeconds || null,
        description: exercise.description || null,
        instructions: exercise.instructions || [],
        tips: exercise.tips || [],
        difficulty: exercise.difficulty || null,
        additionalInstructions: undefined,
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
