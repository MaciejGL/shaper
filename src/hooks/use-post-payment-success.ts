'use client'

import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { CurrentSubscription } from './use-current-subscription'

export function usePostPaymentSuccess(userId?: string) {
  const searchParams = useSearchParams()
  const isPostPayment =
    searchParams?.get('success') === 'true' ||
    searchParams?.get('premium_activated') === 'true'

  const [isTimeout, setIsTimeout] = useState(false)

  // Poll every 2 seconds if post-payment and not timed out
  const { data: subscriptionData, refetch } = useQuery<CurrentSubscription>({
    queryKey: ['current-subscription', userId, 'post-payment'],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required')

      const url = new URL(
        '/api/stripe/subscription-status',
        window.location.origin,
      )
      url.searchParams.set('userId', userId)

      const response = await fetch(url.toString(), {
        signal: AbortSignal.timeout(20000), // 20 second timeout
        cache: 'no-store',
      })
      if (!response.ok) {
        throw new Error('Failed to fetch subscription status')
      }
      return response.json()
    },
    enabled: isPostPayment && !!userId,
    refetchInterval: 1000, // Poll every 1s
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  })

  // Set timeout after 10 seconds
  useEffect(() => {
    if (isPostPayment) {
      const timeout = setTimeout(() => {
        setIsTimeout(true)
      }, 20000)
      return () => clearTimeout(timeout)
    }
  }, [isPostPayment])

  const subscriptionReady = !!subscriptionData?.hasPremiumAccess

  // Determine state: ready > timeout > polling (default)
  let state: 'polling' | 'timeout' | 'ready' = 'polling'
  if (subscriptionReady) {
    state = 'ready'
  } else if (isTimeout) {
    state = 'timeout'
  }

  return {
    isPostPayment,
    state,
    refetch,
  }
}
