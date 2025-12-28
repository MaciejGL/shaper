'use client'

import { useState } from 'react'

import { useMobileApp } from '@/components/mobile-app-bridge'
import { useUser } from '@/context/user-context'

interface SubscribeOptions {
  returnUrl?: string
  cancelUrl?: string
}

/**
 * Shared hook for handling Premium subscription flow.
 * Handles Android Alternative Billing token, checkout session creation, and redirect.
 */
export function useSubscribe() {
  const { user } = useUser()
  const { isNativeApp, platform, getExternalOfferToken, openExternalCheckout } =
    useMobileApp()
  const [isSubscribing, setIsSubscribing] = useState(false)

  const subscribe = async (
    lookupKey: string,
    options?: SubscribeOptions,
  ): Promise<void> => {
    if (!user?.id) return

    setIsSubscribing(true)

    try {
      // Get Alternative Billing token for Android (returns null for other platforms)
      const { token: extToken, diagnostics: extDiagnostics } =
        await getExternalOfferToken(lookupKey)

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          lookupKey,
          returnUrl:
            options?.returnUrl || `${window.location.origin}/checkout/success`,
          cancelUrl:
            options?.cancelUrl ||
            `${window.location.origin}/checkout/cancelled`,
          platform: isNativeApp ? platform : undefined,
          extToken,
          extDiagnostics,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { checkoutUrl } = await response.json()
      openExternalCheckout(checkoutUrl)
    } catch (error) {
      console.error('Subscription error:', error)
      setIsSubscribing(false)
    }
  }

  return { subscribe, isSubscribing }
}
