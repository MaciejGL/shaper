'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { useMobileApp } from '@/components/mobile-app-bridge'
import { CoachingServiceTerms } from '@/components/subscription/coaching-service-terms'
import { useUser } from '@/context/user-context'
import { useCurrentSubscription } from '@/hooks/use-current-subscription'

import { PremiumPricingSelector } from '../components/premium-pricing-selector'
import { ReturnToApp } from '../components/return-to-app'

export default function OffersPage() {
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirectUrl')
  const { user } = useUser()
  const { isNativeApp, platform, getExternalOfferToken, openExternalCheckout } =
    useMobileApp()

  const [showTermsModal, setShowTermsModal] = useState(false)
  const [isSubscribing, setIsSubscribing] = useState(false)

  const { data: subscriptionData, isLoading: isLoadingSubscription } =
    useCurrentSubscription(user?.id)

  const isLoading = isLoadingSubscription
  const hasPremium = subscriptionData?.hasPremiumAccess

  const handleSubscribe = async (lookupKey: string) => {
    if (!user?.id) return

    setIsSubscribing(true)

    try {
      // Debug: Log platform detection
      console.info('[OFFERS] Subscribe clicked:', {
        isNativeApp,
        platform,
        lookupKey,
      })

      // For Android in-app, get alternative billing token for Google compliance
      let extToken: string | null = null
      let extDiagnostics: Record<string, unknown> | null = null
      if (isNativeApp && platform === 'android') {
        const result = await getExternalOfferToken(lookupKey)
        extToken = result.token
        extDiagnostics = result.diagnostics
      }

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          lookupKey,
          returnUrl: redirectUrl
            ? `${window.location.origin}${redirectUrl}`
            : `${window.location.origin}/fitspace/my-plans`,
          cancelUrl: `${window.location.origin}/account-management/offers${redirectUrl ? `?redirectUrl=${encodeURIComponent(redirectUrl)}` : ''}`,
          platform: isNativeApp ? platform : undefined,
          extToken,
          extDiagnostics,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { checkoutUrl } = await response.json()

      // Open checkout in Custom Tabs (Android) or Safari (iOS) or redirect (web)
      openExternalCheckout(checkoutUrl)
    } catch (error) {
      console.error('Subscription error:', error)
      setIsSubscribing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-5xl mx-auto py-8 space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-2/3" />
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="h-96 bg-muted rounded" />
            <div className="h-96 bg-muted rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-hypertro mx-auto space-y-6">
      <ReturnToApp variant="back" redirectUrl={redirectUrl} />

      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Unlock Premium Features</h1>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Start your 7-day free trial and get unlimited access to premium
          training plans, advanced analytics, and exclusive content.
        </p>
      </div>

      <PremiumPricingSelector
        hasPremium={hasPremium}
        hasUsedTrial={subscriptionData?.hasUsedTrial}
        isSubscribing={isSubscribing}
        onSubscribe={handleSubscribe}
        showTrialBadge={true}
        showTermsLink={true}
        onShowTerms={() => setShowTermsModal(true)}
      />

      <CoachingServiceTerms
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        serviceType="premium"
      />
    </div>
  )
}
