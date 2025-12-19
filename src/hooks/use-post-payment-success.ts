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
  const [isConfirmed, setIsConfirmed] = useState(false)

  // Stop polling when confirmed or timed out
  const shouldPoll = isPostPayment && !isConfirmed && !isTimeout

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
        signal: AbortSignal.timeout(20000),
        cache: 'no-store',
      })
      if (!response.ok) {
        throw new Error('Failed to fetch subscription status')
      }
      return response.json()
    },
    enabled: isPostPayment && !!userId,
    refetchInterval: shouldPoll ? 1000 : false,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  })

  // Set timeout after 20 seconds
  useEffect(() => {
    if (isPostPayment && !isConfirmed) {
      const timeout = setTimeout(() => {
        setIsTimeout(true)
      }, 20000)
      return () => clearTimeout(timeout)
    }
  }, [isPostPayment, isConfirmed])

  // Stop polling when subscription is confirmed
  useEffect(() => {
    if (subscriptionData?.hasPremiumAccess) {
      setIsConfirmed(true)
    }
  }, [subscriptionData?.hasPremiumAccess])

  // Determine state: ready > timeout > polling (default)
  let state: 'polling' | 'timeout' | 'ready' = 'polling'
  if (isConfirmed) {
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
