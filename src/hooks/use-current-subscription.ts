import { useQuery } from '@tanstack/react-query'

export interface CurrentSubscription {
  hasPremiumAccess: boolean
  status:
    | 'NO_SUBSCRIPTION'
    | 'TRIAL'
    | 'GRACE_PERIOD'
    | 'ACTIVE'
    | 'CANCELLED_ACTIVE'
    | 'EXPIRED'
  daysRemaining: number
  expiresAt: string | null
  subscription?: {
    id: string
    status: string
    startDate: string
    endDate: string
    package: {
      name: string
      duration: string
      stripeLookupKey?: string | null
    }
    stripeSubscriptionId?: string
    isCancelledButActive?: boolean
  } | null
  trial?: {
    isActive: boolean
    startDate: string
    endDate: string
    daysRemaining: number
  } | null
  gracePeriod?: {
    isActive: boolean
    endDate: string
    daysRemaining: number
    failedRetries: number
  } | null
  hasUsedTrial?: boolean
}

export function useCurrentSubscription(
  userId?: string,
  options?: {
    type?: 'coaching' | 'platform'
    lookupKey?: string
  },
) {
  return useQuery<CurrentSubscription>({
    queryKey: [
      'current-subscription',
      userId,
      options?.type,
      options?.lookupKey,
    ],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required')

      const url = new URL(
        '/api/stripe/subscription-status',
        window.location.origin,
      )
      url.searchParams.set('userId', userId)
      if (options?.type) {
        url.searchParams.set('type', options.type)
      }
      if (options?.lookupKey) {
        url.searchParams.set('lookupKey', options.lookupKey)
      }

      const response = await fetch(url.toString(), {
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })
      if (!response.ok) {
        throw new Error('Failed to fetch subscription status')
      }
      return response.json()
    },
    enabled: !!userId,
    staleTime: 10000, // Data is fresh for 10 seconds - prevents rapid refetches
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    refetchOnWindowFocus: true, // ✅ CRITICAL: Refetch when user returns from payment
    refetchOnMount: true, // ✅ Refetch when component mounts (new page)
    retry: 2, // Retry failed requests up to 2 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff
  })
}
