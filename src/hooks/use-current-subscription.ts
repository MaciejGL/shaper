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

      const response = await fetch(url.toString())
      if (!response.ok) {
        throw new Error('Failed to fetch subscription status')
      }
      return response.json()
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // 10 minutes
  })
}
