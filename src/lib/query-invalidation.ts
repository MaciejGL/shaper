import { QueryClient } from '@tanstack/react-query'

/**
 * Centralized query invalidation utilities
 * Single source of truth for all query invalidation patterns
 *
 * @example
 * ```typescript
 * import { queryInvalidation } from '@/lib/query-invalidation'
 *
 * // In a mutation's onSuccess callback:
 * const mutation = useSomeMutation({
 *   onSuccess: async () => {
 *     // Invalidate all workout-related queries
 *     await queryInvalidation.workout(queryClient)
 *
 *     // Or invalidate both workouts and plans
 *     await queryInvalidation.workoutAndPlans(queryClient)
 *
 *     // Or invalidate just favourites
 *     await queryInvalidation.favourites(queryClient)
 *   }
 * })
 * ```
 */

export const queryInvalidation = {
  /**
   * Invalidate all workout-related queries
   * @param refetchType - 'active' only refetches currently observed queries (default, avoids errors from paused plans),
   *                      'all' refetches everything including background queries
   */
  workout: async (
    queryClient: QueryClient,
    refetchType: 'active' | 'all' = 'active',
  ) => {
    await Promise.all([
      // Invalidate all workout day queries (prefix match)
      queryClient.invalidateQueries({
        queryKey: ['FitspaceGetWorkoutDay'],
        refetchType,
      }),
      queryClient.invalidateQueries({
        queryKey: ['FitspaceGetWorkout'],
        refetchType,
      }),
      queryClient.invalidateQueries({
        queryKey: ['navigation'],
        refetchType,
      }),
      queryClient.invalidateQueries({
        queryKey: ['FitspaceGetQuickWorkoutNavigation'],
        refetchType,
      }),
    ])
  },

  /**
   * Invalidate workout navigation queries only
   */
  workoutNavigation: async (queryClient: QueryClient) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['navigation'] }),
      queryClient.invalidateQueries({
        queryKey: ['FitspaceGetQuickWorkoutNavigation'],
      }),
    ])
  },

  /**
   * Invalidate all workout day queries
   */
  workoutDays: async (queryClient: QueryClient) => {
    await queryClient.invalidateQueries({
      queryKey: ['FitspaceGetWorkoutDay'],
    })
  },

  /**
   * Invalidate specific workout day by ID
   */
  workoutDay: async (queryClient: QueryClient, dayId: string) => {
    await queryClient.invalidateQueries({
      queryKey: ['FitspaceGetWorkoutDay', { dayId }],
    })
  },

  /**
   * Invalidate all plans-related queries
   */
  plans: async (queryClient: QueryClient) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['FitspaceMyPlans'] }),
      queryClient.invalidateQueries({ queryKey: ['GetQuickWorkoutPlan'] }),
    ])
  },

  /**
   * Invalidate favourite workouts
   */
  favourites: async (queryClient: QueryClient) => {
    await queryClient.invalidateQueries({ queryKey: ['GetFavouriteWorkouts'] })
  },

  /**
   * Invalidate all workout and plan-related queries
   * Use when changes affect both workouts and plans
   */
  workoutAndPlans: async (queryClient: QueryClient) => {
    await Promise.all([
      queryInvalidation.workout(queryClient),
      queryInvalidation.plans(queryClient),
    ])
  },

  /**
   * Handle plan state changes (activate/pause/close/delete)
   * Removes old trainer plan queries to avoid "Plan is not active" errors
   * Only invalidates plans and navigation - does NOT touch quick workout day queries
   */
  planStateChange: async (queryClient: QueryClient) => {
    // Remove ALL workout day queries (both trainer plan and quick workout)
    // This prevents "Plan is not active" errors when trying to refetch paused plan queries
    queryClient.removeQueries({
      queryKey: ['FitspaceGetWorkoutDay'],
      exact: false,
    })

    // Invalidate only plans and navigation - let quick workout pages refetch their own data when mounted
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['navigation'],
        refetchType: 'all',
      }),
      queryClient.invalidateQueries({
        queryKey: ['FitspaceMyPlans'],
        refetchType: 'all',
      }),
    ])
  },

  /**
   * Invalidate everything related to favourites and workouts
   * Use when starting a workout from favourite
   * Removes old trainer plan queries and aggressively refetches quick workout data
   */
  favouriteWorkoutStart: async (queryClient: QueryClient) => {
    // Remove old trainer plan workout day queries to avoid "Plan is not active" errors
    // when they try to refetch
    queryClient.removeQueries({
      queryKey: ['FitspaceGetWorkoutDay'],
      exact: false,
    })

    // Aggressively refetch all navigation and quick workout queries
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['navigation'],
        refetchType: 'all',
      }),
      queryClient.invalidateQueries({
        queryKey: ['FitspaceGetQuickWorkoutNavigation'],
        refetchType: 'all',
      }),
      queryClient.invalidateQueries({
        queryKey: ['FitspaceGetQuickWorkoutDay'],
        refetchType: 'all',
      }),
      queryInvalidation.plans(queryClient),
      queryInvalidation.favourites(queryClient),
    ])
  },
}
