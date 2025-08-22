import { useMutation, useQuery } from '@tanstack/react-query'

export interface SubscriptionStatus {
  hasPremiumAccess: boolean
  status: 'NO_SUBSCRIPTION' | 'TRIAL' | 'GRACE_PERIOD' | 'ACTIVE' | 'EXPIRED'
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
  }
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

// Hook for subscription status
export function useSubscriptionStatus(userId?: string) {
  return useQuery<SubscriptionStatus>({
    queryKey: ['subscription-status', userId],
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

// Hook for creating checkout session
export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: async ({
      userId,
      packageId,
      returnUrl,
      cancelUrl,
    }: {
      userId: string
      packageId: string
      returnUrl?: string
      cancelUrl?: string
    }) => {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, packageId, returnUrl, cancelUrl }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create checkout session')
      }

      return response.json()
    },
  })
}

// Hook for creating customer portal session
export function useCustomerPortal() {
  return useMutation({
    mutationFn: async ({
      userId,
      returnUrl,
    }: {
      userId: string
      returnUrl?: string
    }) => {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, returnUrl }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(
          error.error || 'Failed to create customer portal session',
        )
      }

      return response.json()
    },
  })
}
