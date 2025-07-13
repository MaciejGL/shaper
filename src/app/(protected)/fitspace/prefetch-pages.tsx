'use client'

import { useQueryClient } from '@tanstack/react-query'
import { PrefetchKind } from 'next/dist/client/components/router-reducer/router-reducer-types'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

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

const prefetchOptions = {
  kind: PrefetchKind.FULL,
}

const STALE_TIME = 1000 * 60 * 30 // 30 minutes

export function PrefetchFitspacePages() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: currentWorkoutData } = useFitspaceGetCurrentWorkoutIdQuery()
  const { user } = useUser()

  useEffect(() => {
    // Prefetch Next.js page routes (for page components)
    router.prefetch('/fitspace/dashboard', prefetchOptions)
    router.prefetch('/fitspace/marketplace', prefetchOptions)
    router.prefetch('/fitspace/my-plans', prefetchOptions)
    router.prefetch('/fitspace/meal-plan', prefetchOptions)
    router.prefetch('/fitspace/profile', prefetchOptions)
    router.prefetch('/fitspace/progress', prefetchOptions)
    router.prefetch('/fitspace/workout/quick-workout', prefetchOptions)
  }, [router])

  useEffect(() => {
    // Prefetch GraphQL queries in background
    const prefetchQueries = async () => {
      if (!user?.id) {
        return
      }

      try {
        // Dashboard queries
        await queryClient.prefetchQuery({
          queryKey: useFitspaceDashboardGetWorkoutQuery.getKey(),
          queryFn: useFitspaceDashboardGetWorkoutQuery.fetcher(),
          staleTime: STALE_TIME,
        })

        // My Plans queries
        await queryClient.prefetchQuery({
          queryKey: useFitspaceMyPlansQuery.getKey(),
          queryFn: useFitspaceMyPlansQuery.fetcher(),
          staleTime: STALE_TIME,
        })

        // Progress page queries
        await queryClient.prefetchQuery({
          queryKey: useProgressUserQuery.getKey(),
          queryFn: useProgressUserQuery.fetcher(),
          staleTime: 300000, // 5 minutes (user data doesn't change often)
        })

        await queryClient.prefetchQuery({
          queryKey: useBodyMeasuresQuery.getKey(),
          queryFn: useBodyMeasuresQuery.fetcher(),
          staleTime: STALE_TIME,
        })
      } catch (error) {
        // Silently handle prefetch errors - they shouldn't break the app
        console.warn('Prefetch error:', error)
      }
    }

    // Start prefetching queries after a short delay to not block initial render
    const timeoutId = setTimeout(prefetchQueries, 1000)

    return () => clearTimeout(timeoutId)
  }, [queryClient, user?.id])

  useEffect(() => {
    // Prefetch GraphQL queries in background
    const prefetchQueries = async () => {
      if (!user?.id) {
        return
      }

      try {
        if (currentWorkoutData?.getMyPlansOverview.activePlan?.id) {
          // Get workout query
          await queryClient.prefetchQuery({
            queryKey: useFitspaceGetWorkoutQuery.getKey({
              trainingId: currentWorkoutData?.getMyPlansOverview.activePlan?.id,
            }),
            queryFn: useFitspaceGetWorkoutQuery.fetcher({
              trainingId: currentWorkoutData?.getMyPlansOverview.activePlan?.id,
            }),
            staleTime: STALE_TIME,
          })
        } else {
          // Quick workout plan queries
          await queryClient.prefetchQuery({
            queryKey: useFitspaceGetUserQuickWorkoutPlanQuery.getKey(),
            queryFn: useFitspaceGetUserQuickWorkoutPlanQuery.fetcher(),
            staleTime: STALE_TIME,
          })
        }

        await queryClient.prefetchQuery({
          queryKey: useExercisesProgressByUserQuery.getKey({
            userId: user.id,
          }),
          queryFn: useExercisesProgressByUserQuery.fetcher({
            userId: user.id,
          }),
          staleTime: STALE_TIME,
        })
        await queryClient.prefetchQuery({
          queryKey: useAvailableExercisesForProgressQuery.getKey({
            userId: user.id,
          }),
          queryFn: useAvailableExercisesForProgressQuery.fetcher({
            userId: user.id,
          }),
          staleTime: STALE_TIME,
        })
      } catch (error) {
        // Silently handle prefetch errors - they shouldn't break the app
        console.warn('Prefetch error:', error)
      }
    }

    // Start prefetching queries after a short delay to not block initial render
    const timeoutId = setTimeout(prefetchQueries, 2000)

    // Prefetch specific workout route if there's an active plan
    if (currentWorkoutData?.getMyPlansOverview?.activePlan?.id) {
      router.prefetch(
        `/fitspace/workout/${currentWorkoutData.getMyPlansOverview.activePlan.id}`,
        prefetchOptions,
      )
    }

    return () => clearTimeout(timeoutId)
  }, [router, queryClient, currentWorkoutData, user?.id])

  return null
}
