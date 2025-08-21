import { BillingStatus } from '@prisma/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

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
      priceNOK: number
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

export interface BillingRecord {
  id: string
  amount: number
  currency: string
  status: BillingStatus
  description: string
  periodStart: string
  periodEnd: string
  paidAt: string | null
  failureReason?: string
  refundAmount?: number
  refundReason?: string
  stripeInvoiceId?: string
  package: {
    name: string
    duration: string
  }
  createdAt: string
  updatedAt: string
}

export interface BillingHistory {
  records: BillingRecord[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
  summary: {
    totalRecords: number
    totalPaid: number
    totalRefunded: number
    currency: string
  }
}

export interface ReactivationOption {
  packageId: string
  package: {
    id: string
    name: string
    description?: string
    duration: string
    priceNOK: number
    trainer?: {
      name: string
      fullName: string
    } | null
  }
  eligibility: {
    canReactivate: boolean
    trialEligible: boolean
    lastSubscription: {
      id: string
      status: string
      endDate: string
      cancelledAt?: string | null
    }
    totalSubscriptions: number
    reason: string
  }
}

export interface ReactivationEligibility {
  userId: string
  reactivationOptions: ReactivationOption[]
  activeSubscriptions: {
    id: string
    status: string
    packageName: string
    endDate: string
    isInTrial: boolean
    isInGracePeriod: boolean
  }[]
  summary: {
    totalEligiblePackages: number
    totalActiveSubscriptions: number
    hasReactivationOptions: boolean
  }
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

// Hook for billing history
export function useBillingHistory(userId?: string, limit = 10, offset = 0) {
  return useQuery<BillingHistory>({
    queryKey: ['billing-history', userId, limit, offset],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required')

      const response = await fetch(
        `/api/stripe/billing-history?userId=${userId}&limit=${limit}&offset=${offset}`,
      )
      if (!response.ok) {
        throw new Error('Failed to fetch billing history')
      }
      return response.json()
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

// Hook for reactivation eligibility
export function useReactivationEligibility(userId?: string) {
  return useQuery<ReactivationEligibility>({
    queryKey: ['reactivation-eligibility', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required')

      const response = await fetch(
        `/api/stripe/reactivation-eligibility?userId=${userId}`,
      )
      if (!response.ok) {
        throw new Error('Failed to fetch reactivation eligibility')
      }
      return response.json()
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
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

// Hook for subscription reactivation
export function useReactivateSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      packageId,
      returnUrl,
    }: {
      userId: string
      packageId: string
      returnUrl?: string
    }) => {
      const response = await fetch('/api/stripe/reactivate-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, packageId, returnUrl }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to reactivate subscription')
      }

      return response.json()
    },
    onSuccess: (_, { userId }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ['subscription-status', userId],
      })
      queryClient.invalidateQueries({
        queryKey: ['reactivation-eligibility', userId],
      })
    },
  })
}

// Hook for subscription cancellation
export function useCancelSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      subscriptionId,
      cancelImmediately = false,
      reason,
    }: {
      userId: string
      subscriptionId: string
      cancelImmediately?: boolean
      reason?: string
    }) => {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          subscriptionId,
          cancelImmediately,
          reason,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to cancel subscription')
      }

      return response.json()
    },
    onSuccess: (_, { userId }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ['subscription-status', userId],
      })
      queryClient.invalidateQueries({
        queryKey: ['reactivation-eligibility', userId],
      })
      queryClient.invalidateQueries({ queryKey: ['billing-history', userId] })
    },
  })
}

// Hook for invoice download
export function useDownloadInvoice() {
  return useMutation({
    mutationFn: async ({
      userId,
      invoiceId,
    }: {
      userId: string
      invoiceId: string
    }) => {
      const response = await fetch(
        `/api/stripe/download-invoice?userId=${userId}&invoiceId=${invoiceId}`,
      )

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: 'Download failed' }))
        throw new Error(error.error || 'Failed to download invoice')
      }

      // Convert response to blob
      const blob = await response.blob()

      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `invoice-${invoiceId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up
      window.URL.revokeObjectURL(downloadUrl)

      return { success: true }
    },
  })
}
