import { useQuery } from '@tanstack/react-query'

import { useUser } from '@/context/user-context'

import type { TrainingAnalytics } from './analytics-types'

async function fetchTrainingAnalytics(): Promise<TrainingAnalytics> {
  const response = await fetch('/api/ai/training-analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch analytics')
  }

  return response.json()
}

export function useTrainingAnalytics() {
  const { hasPremium, isLoading: isUserLoading } = useUser()

  const query = useQuery({
    queryKey: ['training-analytics'],
    queryFn: fetchTrainingAnalytics,
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
    gcTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: hasPremium && !isUserLoading, // Only fetch for premium users
  })

  return {
    analytics: hasPremium ? query.data : undefined,
    isLoading: query.isLoading || isUserLoading,
    error: query.error,
    refetch: query.refetch,
    hasPremium,
  }
}
