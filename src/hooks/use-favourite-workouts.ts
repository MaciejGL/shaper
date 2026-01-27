import { useQueryClient } from '@tanstack/react-query'
import { isToday } from 'date-fns'
import { useRouter } from 'next/navigation'

import { revalidatePlanPages } from '@/app/actions/revalidate'
import {
  GQLCreateFavouriteWorkoutFolderInput,
  GQLCreateFavouriteWorkoutInput,
  GQLFitspaceMyPlansQuery,
  GQLStartWorkoutFromFavouriteInput,
  GQLUpdateFavouriteWorkoutFolderInput,
  GQLUpdateFavouriteWorkoutInput,
  useCreateFavouriteWorkoutFolderMutation,
  useCreateFavouriteWorkoutMutation,
  useDeleteFavouriteWorkoutFolderMutation,
  useDeleteFavouriteWorkoutMutation,
  useFitspaceMyPlansQuery,
  useGetFavouriteWorkoutFoldersQuery,
  useGetFavouriteWorkoutsQuery,
  useStartWorkoutFromFavouriteMutation,
  useUpdateFavouriteWorkoutFolderMutation,
  useUpdateFavouriteWorkoutMutation,
} from '@/generated/graphql-client'
import { queryInvalidation } from '@/lib/query-invalidation'

export function useFavouriteWorkouts() {
  return useGetFavouriteWorkoutsQuery()
}

export function useFavouriteWorkoutFolders() {
  return useGetFavouriteWorkoutFoldersQuery()
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
    onError: async () => {
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

export function useCreateFavouriteWorkoutFolder() {
  const queryClient = useQueryClient()

  return useCreateFavouriteWorkoutFolderMutation({
    onSuccess: async () => {
      await queryInvalidation.favourites(queryClient)
    },
  })
}

export function useUpdateFavouriteWorkoutFolder() {
  const queryClient = useQueryClient()

  return useUpdateFavouriteWorkoutFolderMutation({
    onSuccess: async () => {
      await queryInvalidation.favourites(queryClient)
    },
    onError: async () => {
      await queryInvalidation.favourites(queryClient)
    },
  })
}

export function useDeleteFavouriteWorkoutFolder() {
  const queryClient = useQueryClient()

  return useDeleteFavouriteWorkoutFolderMutation({
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
      const parts = data.startWorkoutFromFavourite?.split('|') ?? []

      await revalidatePlanPages()
      await queryInvalidation.favouriteWorkoutStart(queryClient)
      if (parts.length === 3) {
        const [, weekId, dayId] = parts
        router.push(`/fitspace/workout?week=${weekId}&day=${dayId}`)
      } else {
        router.push('/fitspace/workout')
      }
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

export function useFavouriteWorkoutFolderOperations() {
  const createFolderMutation = useCreateFavouriteWorkoutFolder()
  const updateFolderMutation = useUpdateFavouriteWorkoutFolder()
  const deleteFolderMutation = useDeleteFavouriteWorkoutFolder()

  return {
    createFolder: (input: GQLCreateFavouriteWorkoutFolderInput) =>
      createFolderMutation.mutateAsync({ input }),
    isCreatingFolder: createFolderMutation.isPending,
    createFolderError: createFolderMutation.error,

    updateFolder: (input: GQLUpdateFavouriteWorkoutFolderInput) =>
      updateFolderMutation.mutateAsync({ input }),
    isUpdatingFolder: updateFolderMutation.isPending,
    updateFolderError: updateFolderMutation.error,

    deleteFolder: (id: string) => deleteFolderMutation.mutateAsync({ id }),
    isDeletingFolder: deleteFolderMutation.isPending,
    deleteFolderError: deleteFolderMutation.error,
  }
}
