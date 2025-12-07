import { useQuery } from '@tanstack/react-query'

interface ClientSubscription {
  id: string
  status: string
  isPaused: boolean
  cancelAt: string | null
  upcomingBillingDates: string[]
  package: {
    name: string
    stripeLookupKey: string | null
  }
  stripeSubscriptionId: string | null
}

export function useClientSubscription(clientId: string) {
  const { data, isLoading, error } = useQuery<ClientSubscription | null>({
    queryKey: ['client-subscription', clientId],
    queryFn: async () => {
      const response = await fetch(
        `/api/trainer/clients/${clientId}/subscription`,
        {
          // Add timeout to prevent hanging
          signal: AbortSignal.timeout(10000), // 10 second timeout
        },
      )

      if (!response.ok) {
        if (response.status === 404) {
          return null // No subscription
        }
        throw new Error('Failed to fetch subscription')
      }

      return response.json()
    },
    staleTime: 10000, // Data is fresh for 10 seconds - prevents rapid refetches
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    refetchOnWindowFocus: true, // ✅ CRITICAL: Refetch when user returns from payment
    refetchOnMount: true, // ✅ Refetch when component mounts
    retry: 2, // Retry failed requests up to 2 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff
  })

  return {
    subscription: data,
    isLoading,
    error,
    isPaused: data?.isPaused ?? false,
    cancelAt: data?.cancelAt ?? null,
    upcomingBillingDates: data?.upcomingBillingDates ?? [],
    isScheduledToCancel: !!data?.cancelAt,
  }
}
