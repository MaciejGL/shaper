import { useQueryClient } from '@tanstack/react-query'
import { isToday } from 'date-fns'
import { useRouter } from 'next/navigation'
import { startTransition } from 'react'

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
import { queryInvalidation } from '@/lib/query-invalidation'

export function useFavouriteWorkouts() {
  return useGetFavouriteWorkoutsQuery()
}

export function useCreateFavouriteWorkout() {
  const queryClient = useQueryClient()

  return useCreateFavouriteWorkoutMutation({
    onSuccess: async () => {
      await queryInvalidation.favourites(queryClient)
    },
  })
}

export function useUpdateFavouriteWorkout() {
  const queryClient = useQueryClient()

  return useUpdateFavouriteWorkoutMutation({
    onSuccess: async () => {
      await queryInvalidation.favourites(queryClient)
    },
  })
}

export function useDeleteFavouriteWorkout() {
  const queryClient = useQueryClient()

  return useDeleteFavouriteWorkoutMutation({
    onSuccess: async () => {
      await queryInvalidation.favourites(queryClient)
    },
  })
}

export function useStartWorkoutFromFavourite() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useStartWorkoutFromFavouriteMutation({
    onSuccess: async (data) => {
      if (!data.startWorkoutFromFavourite) return

      const parts = data.startWorkoutFromFavourite.split('|')

      await queryInvalidation.favouriteWorkoutStart(queryClient)

      startTransition(() => {
        if (parts.length === 3) {
          const [, weekId, dayId] = parts
          router.push(
            `/fitspace/workout/quick-workout?week=${weekId}&day=${dayId}`,
          )
        } else {
          router.push(`/fitspace/workout/quick-workout`)
        }

        router.refresh()
      })
    },
  })
}

export type WorkoutStatus =
  | 'can-start'
  | 'has-workout'
  | 'active-plan-workout'
  | 'rest-day'

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

  if (quickWorkoutPlan?.weeks) {
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
    createFavourite: (input: GQLCreateFavouriteWorkoutInput) =>
      createMutation.mutateAsync({ input }),
    isCreating: createMutation.isPending,
    createError: createMutation.error,

    updateFavourite: (input: GQLUpdateFavouriteWorkoutInput) =>
      updateMutation.mutateAsync({ input }),
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,

    deleteFavourite: (id: string) => deleteMutation.mutateAsync({ id }),
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,

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
  name: string
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

    const exercises = selectedExerciseObjects.map((exercise, index) => ({
      name: exercise.name,
      order: index + 1,
      baseId: exercise.id,
      restSeconds: null,
      instructions: null,
      sets: [
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

export function useCreateFavouriteFromAI() {
  const { createFavourite, isCreating, createError } =
    useFavouriteWorkoutOperations()

  const createFromAI = async (
    workoutData: Pick<FavouriteWorkoutWizardData, 'title' | 'description'>,
    aiWorkoutResult: GQLFitspaceGenerateAiWorkoutMutation['generateAiWorkout'],
  ): Promise<string> => {
    if (!aiWorkoutResult?.exercises || aiWorkoutResult.exercises.length === 0) {
      throw new Error('No AI workout result available')
    }

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
            minReps: null,
            maxReps: null,
            rpe: aiSet?.rpe || null,
            weight: null,
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
        name: exercise.name,
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
