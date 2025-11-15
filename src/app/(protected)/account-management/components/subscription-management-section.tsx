'use client'

import { CreditCard, ExternalLink } from 'lucide-react'
import { useState } from 'react'

import { LoadingSkeleton } from '@/components/loading-skeleton'
import { CoachingServiceTerms } from '@/components/subscription/coaching-service-terms'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useUser } from '@/context/user-context'
import { useCurrentSubscription } from '@/hooks/use-current-subscription'
import { STRIPE_LOOKUP_KEYS } from '@/lib/stripe/lookup-keys'

import { PremiumPricingSelector } from './premium-pricing-selector'

export function SubscriptionManagementSection() {
  const { user } = useUser()
  const {
    data: subscriptionData,
    isLoading: isLoadingSubscription,
    error: subscriptionError,
  } = useCurrentSubscription(user?.id)

  const isLoading = isLoadingSubscription
  const hasError = subscriptionError

  const [showTermsModal, setShowTermsModal] = useState(false)
  const [isSubscribing, setIsSubscribing] = useState(false)

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
          returnUrl: `${window.location.origin}/account-management`,
          cancelUrl: `${window.location.origin}/account-management`,
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

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          returnUrl: `${window.location.origin}/account-management`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const { url } = await response.json()
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Failed to open billing portal:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton count={2} variant="lg" />
      </div>
    )
  }

  if (hasError) {
    return (
      <Card className="bg-card-on-card">
        <CardContent className="py-8 text-center space-y-4">
          <p className="text-muted-foreground">
            Failed to load subscription information
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="secondary"
            size="sm"
          >
            Reload Page
          </Button>
        </CardContent>
      </Card>
    )
  }

  const getSubscriptionTypeInfo = () => {
    if (!subscriptionData?.subscription) {
      return {
        type: 'None',
        title: 'No Active Subscription',
        description: 'You currently have no active subscription.',
        canUpgrade: true,
      }
    }

    const lookupKey = subscriptionData.subscription.package.stripeLookupKey
    const packageName = subscriptionData.subscription.package.name

    // Check for Premium Coaching subscription
    if (lookupKey === STRIPE_LOOKUP_KEYS.PREMIUM_COACHING) {
      return {
        type: 'Coaching',
        title: 'Premium Coaching',
        description:
          'Full access to training plans, nutrition plans, and coaching sessions.',
        canUpgrade: true, // Can upgrade to Premium
      }
    }

    // Check for Premium subscription
    if (
      lookupKey === STRIPE_LOOKUP_KEYS.PREMIUM_MONTHLY ||
      lookupKey === STRIPE_LOOKUP_KEYS.PREMIUM_YEARLY
    ) {
      return {
        type: 'Premium',
        title: 'Premium',
        description: 'Premium platform access with enhanced features.',
        canUpgrade: false, // Already the highest tier
      }
    }

    // Default case
    return {
      type: 'Active',
      title: packageName,
      description: 'Active subscription with premium features.',
      canUpgrade: true,
    }
  }

  const getNextBillingInfo = () => {
    if (!subscriptionData?.subscription?.endDate) return null

    const endDate = new Date(subscriptionData.subscription.endDate)
    const now = new Date()

    // Check if subscription is still active
    if (endDate <= now) return null

    const duration = subscriptionData.subscription.package.duration
    const isMonthly = duration === 'MONTHLY'
    const isYearly = duration === 'YEARLY'

    return {
      date: endDate.toLocaleDateString(),
      period: isMonthly ? 'Monthly' : isYearly ? 'Yearly' : duration,
    }
  }

  const subscriptionInfo = getSubscriptionTypeInfo()
  const nextBilling = getNextBillingInfo()
  const hasActiveSubscription = subscriptionData?.hasPremiumAccess
  const hasStripeHistory =
    !!subscriptionData?.subscription?.stripeSubscriptionId

  return (
    <div className="space-y-6">
      {/* Show current subscription status only if user has active subscription */}
      {hasActiveSubscription ? (
        <>
          {/* Current Subscription Status */}
          <Card className="bg-card-on-card">
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">
                      {subscriptionInfo.title}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        subscriptionData?.status === 'CANCELLED_ACTIVE'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      }`}
                    >
                      {subscriptionData?.status === 'CANCELLED_ACTIVE'
                        ? 'Cancelled'
                        : 'Active'}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {subscriptionInfo.description}
                  </p>

                  {nextBilling && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {subscriptionData?.status === 'CANCELLED_ACTIVE'
                          ? `Access expires: ${nextBilling.date}`
                          : `Next billing: ${nextBilling.date}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {subscriptionData?.status === 'CANCELLED_ACTIVE'
                          ? 'Subscription cancelled - no further charges will occur'
                          : `${nextBilling.period} subscription`}
                      </p>
                    </div>
                  )}

                  {subscriptionData?.status === 'TRIAL' &&
                    subscriptionData?.expiresAt && (
                      <p className="text-sm text-muted-foreground">
                        Trial expires:{' '}
                        {new Date(
                          subscriptionData.expiresAt,
                        ).toLocaleDateString()}
                      </p>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manage Billing Button */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleManageSubscription}
              variant="secondary"
              className="w-full"
              iconStart={<CreditCard />}
              iconEnd={<ExternalLink />}
            >
              Manage Billing & Payment
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* No subscription - show upgrade options directly */}
          <div className="space-y-6">
            <PremiumPricingSelector
              hasPremium={subscriptionData?.hasPremiumAccess}
              hasUsedTrial={subscriptionData?.hasUsedTrial}
              isSubscribing={isSubscribing}
              onSubscribe={handleSubscribe}
              showTrialBadge={true}
              showTermsLink={true}
              onShowTerms={() => setShowTermsModal(true)}
            />

            {/* Show billing portal access if user has previous Stripe subscription */}
            {hasStripeHistory && (
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleManageSubscription}
                  variant="outline"
                  className="w-full"
                  iconStart={<CreditCard />}
                  iconEnd={<ExternalLink />}
                >
                  Manage Payment Methods
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Terms Modal */}
      <CoachingServiceTerms
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => setShowTermsModal(false)}
        serviceType="premium"
        packages={[]}
        readOnly={true}
      />
    </div>
  )
}
