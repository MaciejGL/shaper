'use client'

import { useState } from 'react'

import { CoachingServiceTerms } from '@/components/subscription/coaching-service-terms'
import { useUser } from '@/context/user-context'
import { useCurrentSubscription } from '@/hooks/use-current-subscription'
import { usePaymentRules } from '@/hooks/use-payment-rules'

import { PremiumPricingSelector } from '../../account-management/components/premium-pricing-selector'

/**
 * Pricing section that shows upgrade options
 * Only rendered if rules.canShowUpgradeUI is true
 */
export function PricingSection() {
  const rules = usePaymentRules()
  const { user } = useUser()
  const { data: subscriptionData } = useCurrentSubscription(user?.id)

  const [showTermsModal, setShowTermsModal] = useState(false)
  const [isSubscribing, setIsSubscribing] = useState(false)

  // Double-check rules allow this
  if (!rules.canShowUpgradeUI) return null

  const handleSubscribe = async (lookupKey: string) => {
    if (!user?.id) return

    setIsSubscribing(true)

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          lookupKey,
          returnUrl: `${window.location.origin}/subscriptions`,
          cancelUrl: `${window.location.origin}/subscriptions`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { checkoutUrl } = await response.json()
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Subscription error:', error)
      setIsSubscribing(false)
    }
  }

  return (
    <>
      <PremiumPricingSelector
        hasPremium={subscriptionData?.hasPremiumAccess}
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
        onAccept={() => setShowTermsModal(false)}
        serviceType="premium"
        packages={[]}
        readOnly={true}
      />
    </>
  )
}
