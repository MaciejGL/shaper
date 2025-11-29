import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef } from 'react'

import {
  GQLFitspaceGetWorkoutDayQuery,
  useFitspaceGetWorkoutDayQuery,
  useFitspaceGetWorkoutDaysBatchQuery,
} from '@/generated/graphql-client'

interface NavigationWeek {
  id: string
  days: { id: string; isRestDay: boolean }[]
}

interface NavigationPlan {
  weeks: NavigationWeek[]
}

interface UseWorkoutPrefetchOptions {
  /**
   * Delay in milliseconds before starting prefetch
   * @default 2500 (2.5 seconds)
   */
  delay?: number
  /**
   * How long to keep prefetched data fresh
   * @default 300000 (5 minutes)
   */
  staleTime?: number
}

/**
 * Hook to prefetch workout day data with configurable delay
 * Uses batch query to fetch all days in one request instead of parallel individual requests
 */
export function useWorkoutPrefetch(
  plan: NavigationPlan | null,
  activeWeekId: string | null,
  options: UseWorkoutPrefetchOptions = {},
) {
  const { delay = 2500, staleTime = 5 * 60 * 1000 } = options
  const queryClient = useQueryClient()
  const isFetchingRef = useRef(false)

  const prefetchDays = useCallback(
    async (dayIds: string[]) => {
      if (isFetchingRef.current || dayIds.length === 0) return

      // Filter out days that already have fresh data
      const dayIdsToFetch = dayIds.filter((dayId) => {
        const queryKey = useFitspaceGetWorkoutDayQuery.getKey({ dayId })
        const existingData = queryClient.getQueryData(queryKey)
        const queryState = queryClient.getQueryState(queryKey)

        if (existingData && queryState?.dataUpdatedAt) {
          const isDataFresh = Date.now() - queryState.dataUpdatedAt < staleTime
          if (isDataFresh) return false
        }

        if (queryState?.fetchStatus === 'fetching') return false

        return true
      })

      if (dayIdsToFetch.length === 0) return

      isFetchingRef.current = true

      try {
        // Fetch all days in one batch request
        const batchData = await queryClient.fetchQuery({
          queryKey: useFitspaceGetWorkoutDaysBatchQuery.getKey({
            dayIds: dayIdsToFetch,
          }),
          queryFn: useFitspaceGetWorkoutDaysBatchQuery.fetcher({
            dayIds: dayIdsToFetch,
          }),
          staleTime,
        })

        // Populate individual query caches from batch response
        if (batchData?.getWorkoutDaysBatch) {
          batchData.getWorkoutDaysBatch.forEach((dayPayload) => {
            if (!dayPayload.day?.id) return

            const dayId = dayPayload.day.id
            const queryKey = useFitspaceGetWorkoutDayQuery.getKey({ dayId })

            // Transform batch payload to match single query structure
            const singleDayData: GQLFitspaceGetWorkoutDayQuery = {
              getWorkoutDay: dayPayload,
            }

            queryClient.setQueryData(queryKey, singleDayData)
          })
        }
      } catch (error) {
        console.error('[Prefetch] Failed to batch fetch workout days:', error)
      } finally {
        isFetchingRef.current = false
      }
    },
    [queryClient, staleTime],
  )

  useEffect(() => {
    if (!plan?.weeks || !activeWeekId) return

    const timer = setTimeout(() => {
      const currentWeek = plan.weeks.find((w) => w.id === activeWeekId)

      if (currentWeek) {
        const dayIds = currentWeek.days
          .filter((day) => !day.isRestDay)
          .map((day) => day.id)
        prefetchDays(dayIds)
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [plan, activeWeekId, delay, prefetchDays])

  const prefetchWeek = useCallback(
    (weekId: string) => {
      const week = plan?.weeks.find((w) => w.id === weekId)
      if (!week) return

      const dayIds = week.days
        .filter((day) => !day.isRestDay)
        .map((day) => day.id)
      prefetchDays(dayIds)
    },
    [plan, prefetchDays],
  )

  return { prefetchWeek }
}
