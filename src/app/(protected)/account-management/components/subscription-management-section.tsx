'use client'

import { CreditCard, ExternalLink } from 'lucide-react'
import { useState } from 'react'

import { LoadingSkeleton } from '@/components/loading-skeleton'
import { CoachingServiceTerms } from '@/components/subscription/coaching-service-terms'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useUser } from '@/context/user-context'
import { useGetActivePackageTemplatesQuery } from '@/generated/graphql-client'
import { useCurrentSubscription } from '@/hooks/use-current-subscription'
import { STRIPE_LOOKUP_KEYS } from '@/lib/stripe/lookup-keys'

import { UpgradeCard } from '../../fitspace/settings/components/upgrade-card'
import { useSubscriptionActions } from '../../fitspace/settings/hooks/use-subscription-actions'

export function SubscriptionManagementSection() {
  const { user } = useUser()
  const { data: subscriptionData, isLoading: isLoadingSubscription } =
    useCurrentSubscription(user?.id)

  // Fetch available packages for upgrade options
  const { data: packagesData, isLoading: isLoadingPackages } =
    useGetActivePackageTemplatesQuery({})
  const availablePackages = packagesData?.getActivePackageTemplates || []

  // Combined loading state - wait for both queries
  const isLoading = isLoadingSubscription || isLoadingPackages

  // Get monthly and yearly packages using lookup keys
  const monthlyPackage = availablePackages.find(
    (pkg) =>
      pkg.stripeLookupKey === STRIPE_LOOKUP_KEYS.PREMIUM_MONTHLY &&
      pkg.isActive,
  )
  const yearlyPackage = availablePackages.find(
    (pkg) =>
      pkg.stripeLookupKey === STRIPE_LOOKUP_KEYS.PREMIUM_YEARLY && pkg.isActive,
  )

  // Terms modal state
  const [showTermsModal, setShowTermsModal] = useState(false)

  // Subscription upgrade logic
  const { isUpgrading, handleUpgrade } = useSubscriptionActions({
    userId: user?.id || '',
    premiumPackage: monthlyPackage
      ? {
          id: monthlyPackage.id,
        }
      : undefined,
  })

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
        <LoadingSkeleton count={2} withBorder variant="lg" />
      </div>
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
          <Card borderless className="bg-card-on-card">
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
            {/* Upgrade Card with pricing options */}
            <UpgradeCard
              monthlyPackage={
                monthlyPackage
                  ? {
                      ...monthlyPackage,
                      description: monthlyPackage.description || undefined,
                    }
                  : undefined
              }
              yearlyPackage={
                yearlyPackage
                  ? {
                      ...yearlyPackage,
                      description: yearlyPackage.description || undefined,
                    }
                  : undefined
              }
              isUpgrading={isUpgrading}
              onUpgrade={handleUpgrade}
            />

            {/* Terms Agreement Text */}
            <p className="text-xs text-center text-muted-foreground">
              By subscribing, you agree to our{' '}
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="text-primary hover:text-primary/80 underline"
              >
                terms of service
              </button>
              {' and '}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 underline"
              >
                privacy policy
              </a>
            </p>

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
