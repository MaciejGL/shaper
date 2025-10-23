import { useQuery } from '@tanstack/react-query'

interface ClientSubscription {
  id: string
  status: string
  isPaused: boolean
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
      )

      if (!response.ok) {
        if (response.status === 404) {
          return null // No subscription
        }
        throw new Error('Failed to fetch subscription')
      }

      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    subscription: data,
    isLoading,
    error,
    isPaused: data?.isPaused ?? false,
  }
}
