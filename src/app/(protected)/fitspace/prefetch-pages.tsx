'use client'

import { useQueryClient } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import { useUser } from '@/context/user-context'
import {
  useAvailableExercisesForProgressQuery,
  useBodyMeasuresQuery,
  useExercisesProgressByUserQuery,
  useFitspaceDashboardGetWorkoutQuery,
  useFitspaceGetCurrentWorkoutIdQuery,
  useFitspaceGetUserQuickWorkoutPlanQuery,
  useFitspaceGetWorkoutQuery,
  useFitspaceMyPlansQuery,
  useProgressUserQuery,
} from '@/generated/graphql-client'

// Smart prefetch configuration based on user behavior patterns
const PREFETCH_CONFIG = {
  // Data freshness requirements by data type
  staleTimes: {
    userProfile: 20 * 60 * 1000, // 20 minutes - rarely changes
    workoutData: 5 * 60 * 1000, // 5 minutes - medium freshness
    dashboardData: 30 * 1000, // 30 seconds - real-time feel
    mealPlanData: 2 * 60 * 1000, // 2 minutes - daily usage
    progressData: 10 * 60 * 1000, // 10 minutes - analytics can be stale
  },
  // Priority levels for progressive loading
  priorities: {
    critical: 0, // Load immediately
    high: 100, // Load after 100ms
    medium: 500, // Load after 500ms
    low: 2000, // Load after 2 seconds
  },
  // Route-specific prefetch strategies
  routes: {
    '/fitspace/dashboard': {
      // Dashboard is entry point - prefetch likely next destinations
      nextRoutes: [
        { path: '/fitspace/workout', priority: 'high' },
        { path: '/fitspace/my-plans', priority: 'medium' },
        { path: '/fitspace/meal-plan', priority: 'medium' },
      ],
      queries: [
        { key: 'myPlans', priority: 'high' },
        { key: 'currentWorkout', priority: 'high' },
      ],
    },
    '/fitspace/my-plans': {
      // My Plans - users often navigate to workout
      nextRoutes: [
        { path: '/fitspace/workout', priority: 'high' },
        { path: '/fitspace/dashboard', priority: 'medium' },
      ],
      queries: [
        { key: 'currentWorkout', priority: 'high' },
        { key: 'dashboard', priority: 'medium' },
      ],
    },
    '/fitspace/workout': {
      // Workout - users often check meal plan or go back to dashboard
      nextRoutes: [
        { path: '/fitspace/meal-plan', priority: 'medium' },
        { path: '/fitspace/dashboard', priority: 'medium' },
      ],
      queries: [
        { key: 'mealPlan', priority: 'medium' },
        { key: 'dashboard', priority: 'low' },
      ],
    },
    '/fitspace/meal-plan': {
      // Meal Plan - standalone usage, less predictable navigation
      nextRoutes: [
        { path: '/fitspace/dashboard', priority: 'medium' },
        { path: '/fitspace/workout', priority: 'low' },
      ],
      queries: [{ key: 'dashboard', priority: 'low' }],
    },
    '/fitspace/progress': {
      // Progress - analytical page, less critical performance
      nextRoutes: [{ path: '/fitspace/dashboard', priority: 'medium' }],
      queries: [{ key: 'dashboard', priority: 'low' }],
    },
  },
} as const

export function PrefetchFitspacePages() {
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const { user } = useUser()
  const { data: currentWorkoutData } = useFitspaceGetCurrentWorkoutIdQuery()

  // Track if we've already prefetched for this route to avoid duplicates
  const prefetchedRoutes = useRef<Set<string>>(new Set())

  // Smart query prefetch function with proper error handling
  const prefetchQuery = useCallback(
    async (
      queryKey: string,
      priority: keyof typeof PREFETCH_CONFIG.priorities,
    ) => {
      if (!user?.id) return

      const delay = PREFETCH_CONFIG.priorities[priority]

      const prefetchPromise = new Promise<void>((resolve) => {
        setTimeout(async () => {
          try {
            switch (queryKey) {
              case 'dashboard':
                await queryClient.prefetchQuery({
                  queryKey: useFitspaceDashboardGetWorkoutQuery.getKey(),
                  queryFn: useFitspaceDashboardGetWorkoutQuery.fetcher(),
                  staleTime: PREFETCH_CONFIG.staleTimes.dashboardData,
                })
                break
              case 'myPlans':
                await queryClient.prefetchQuery({
                  queryKey: useFitspaceMyPlansQuery.getKey(),
                  queryFn: useFitspaceMyPlansQuery.fetcher(),
                  staleTime: PREFETCH_CONFIG.staleTimes.workoutData,
                })
                break
              case 'currentWorkout':
                if (currentWorkoutData?.getMyPlansOverview.activePlan?.id) {
                  await queryClient.prefetchQuery({
                    queryKey: useFitspaceGetWorkoutQuery.getKey({
                      trainingId:
                        currentWorkoutData.getMyPlansOverview.activePlan.id,
                    }),
                    queryFn: useFitspaceGetWorkoutQuery.fetcher({
                      trainingId:
                        currentWorkoutData.getMyPlansOverview.activePlan.id,
                    }),
                    staleTime: PREFETCH_CONFIG.staleTimes.workoutData,
                  })
                } else {
                  await queryClient.prefetchQuery({
                    queryKey: useFitspaceGetUserQuickWorkoutPlanQuery.getKey(),
                    queryFn: useFitspaceGetUserQuickWorkoutPlanQuery.fetcher(),
                    staleTime: PREFETCH_CONFIG.staleTimes.workoutData,
                  })
                }
                break
              case 'progress':
                await Promise.all([
                  queryClient.prefetchQuery({
                    queryKey: useProgressUserQuery.getKey(),
                    queryFn: useProgressUserQuery.fetcher(),
                    staleTime: PREFETCH_CONFIG.staleTimes.userProfile,
                  }),
                  queryClient.prefetchQuery({
                    queryKey: useBodyMeasuresQuery.getKey(),
                    queryFn: useBodyMeasuresQuery.fetcher(),
                    staleTime: PREFETCH_CONFIG.staleTimes.progressData,
                  }),
                ])
                break
            }
          } catch (error) {
            // Silent fail - prefetch errors shouldn't impact user experience
            console.error(`Prefetch failed for ${queryKey}:`, error)
          }
          resolve()
        }, delay)
      })

      return prefetchPromise
    },
    [queryClient, user?.id, currentWorkoutData],
  )

  // Smart route prefetch with Next.js router
  const prefetchRoute = useCallback(
    (path: string, priority: keyof typeof PREFETCH_CONFIG.priorities) => {
      const delay = PREFETCH_CONFIG.priorities[priority]

      setTimeout(() => {
        try {
          // Handle dynamic workout routes
          if (
            path === '/fitspace/workout' &&
            currentWorkoutData?.getMyPlansOverview?.activePlan?.id
          ) {
            router.prefetch(
              `/fitspace/workout/${currentWorkoutData.getMyPlansOverview.activePlan.id}`,
            )
          } else if (path === '/fitspace/workout') {
            router.prefetch('/fitspace/workout/quick-workout')
          } else {
            router.prefetch(path)
          }
        } catch (error) {
          console.error(`Route prefetch failed for ${path}:`, error)
        }
      }, delay)
    },
    [router, currentWorkoutData],
  )

  // Get prefetch strategy for current route
  const currentRouteConfig = useMemo(() => {
    // Match exact route or closest parent route
    const exactMatch =
      PREFETCH_CONFIG.routes[pathname as keyof typeof PREFETCH_CONFIG.routes]
    if (exactMatch) return exactMatch

    // Handle dynamic routes
    if (pathname.startsWith('/fitspace/workout/')) {
      return PREFETCH_CONFIG.routes['/fitspace/workout']
    }

    // Default fallback - minimal prefetching
    return {
      nextRoutes: [
        { path: '/fitspace/dashboard', priority: 'medium' as const },
      ],
      queries: [{ key: 'dashboard', priority: 'medium' as const }],
    }
  }, [pathname])

  // Execute smart prefetching based on current route
  useEffect(() => {
    if (!user?.id) return

    const routeKey = `${pathname}-${user.id}`
    if (prefetchedRoutes.current.has(routeKey)) return

    prefetchedRoutes.current.add(routeKey)

    // Prefetch next likely routes
    currentRouteConfig.nextRoutes.forEach(({ path, priority }) => {
      prefetchRoute(path, priority)
    })

    // Prefetch relevant queries
    currentRouteConfig.queries.forEach(({ key, priority }) => {
      prefetchQuery(key, priority)
    })

    // Capture ref value for cleanup
    const currentPrefetchedRoutes = prefetchedRoutes.current

    // Cleanup function to clear prefetch cache after route change
    return () => {
      // Keep recent prefetches but clear old ones
      if (currentPrefetchedRoutes.size > 10) {
        currentPrefetchedRoutes.clear()
      }
    }
  }, [pathname, user?.id, currentRouteConfig, prefetchRoute, prefetchQuery])

  // Progressive prefetch for less critical data
  useEffect(() => {
    if (!user?.id) return

    const progressiveTimeout = setTimeout(() => {
      // Only prefetch progress data if user hasn't navigated away
      if (pathname.startsWith('/fitspace/')) {
        Promise.all([
          queryClient.prefetchQuery({
            queryKey: useExercisesProgressByUserQuery.getKey({
              userId: user.id,
            }),
            queryFn: useExercisesProgressByUserQuery.fetcher({
              userId: user.id,
            }),
            staleTime: PREFETCH_CONFIG.staleTimes.progressData,
          }),
          queryClient.prefetchQuery({
            queryKey: useAvailableExercisesForProgressQuery.getKey({
              userId: user.id,
            }),
            queryFn: useAvailableExercisesForProgressQuery.fetcher({
              userId: user.id,
            }),
            staleTime: PREFETCH_CONFIG.staleTimes.progressData,
          }),
        ]).catch((error) => {
          console.error('Progressive prefetch failed:', error)
        })
      }
    }, PREFETCH_CONFIG.priorities.low)

    return () => clearTimeout(progressiveTimeout)
  }, [queryClient, user?.id, pathname])

  return null
}
