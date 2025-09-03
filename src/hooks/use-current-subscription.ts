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

export function useCurrentSubscription(userId?: string) {
  return useQuery<CurrentSubscription>({
    queryKey: ['current-subscription', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required')

      const response = await fetch(
        `/api/stripe/subscription-status?userId=${userId}`,
      )
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
