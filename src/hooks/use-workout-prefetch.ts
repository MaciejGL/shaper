import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'

import { useFitspaceGetWorkoutDayQuery } from '@/generated/graphql-client'

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
   * @default 10000 (10 seconds)
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
 * Prefetches only the current selected week
 */
export function useWorkoutPrefetch(
  plan: NavigationPlan | null,
  activeWeekId: string | null,
  options: UseWorkoutPrefetchOptions = {},
) {
  const { delay = 5000, staleTime = 5 * 60 * 1000 } = options
  const queryClient = useQueryClient()

  const prefetchDays = useCallback(
    (dayIds: string[]) => {
      dayIds.forEach((dayId) => {
        const queryKey = useFitspaceGetWorkoutDayQuery.getKey({ dayId })

        // Check if we already have fresh data for this day
        const existingData = queryClient.getQueryData(queryKey)
        const queryState = queryClient.getQueryState(queryKey)

        // Skip prefetch if:
        // 1. Data exists and is fresh (within staleTime)
        // 2. Query is currently fetching
        if (existingData && queryState?.dataUpdatedAt) {
          const isDataFresh = Date.now() - queryState.dataUpdatedAt < staleTime
          if (isDataFresh) {
            return
          }
        }

        if (queryState?.fetchStatus === 'fetching') {
          return
        }

        queryClient.prefetchQuery({
          queryKey,
          queryFn: useFitspaceGetWorkoutDayQuery.fetcher({ dayId }),
          staleTime,
        })
      })
    },
    [queryClient, staleTime],
  )

  useEffect(() => {
    if (!plan?.weeks || !activeWeekId) return

    const timer = setTimeout(() => {
      // Find and prefetch only the current selected week
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

  // Expose manual prefetch for immediate prefetching when needed
  const prefetchWeek = useCallback(
    (weekId: string) => {
      const week = plan?.weeks.find((w) => w.id === weekId)
      if (!week) return

      const dayIds = week.days.map((day) => day.id)
      prefetchDays(dayIds)
    },
    [plan, prefetchDays],
  )

  return { prefetchWeek }
}
