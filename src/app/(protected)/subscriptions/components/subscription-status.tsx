'use client'

import { LoadingSkeleton } from '@/components/loading-skeleton'
import { PromotionalDiscountBanner } from '@/components/subscription/promotional-discount-banner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useUser } from '@/context/user-context'
import { useCurrentSubscription } from '@/hooks/use-current-subscription'
import { STRIPE_LOOKUP_KEYS } from '@/lib/stripe/lookup-keys'

import { FreezeSubscriptionSection } from '../../account-management/components/freeze-subscription-section/freeze-subscription-section'

/**
 * Shows current subscription status (allowed everywhere per compliance)
 * This only displays account information, not pricing or purchase options
 */
export function SubscriptionStatus() {
  const { user } = useUser()
  const {
    data: subscriptionData,
    isLoading,
    error,
  } = useCurrentSubscription(user?.id)

  if (isLoading) {
    return <LoadingSkeleton count={2} variant="lg" />
  }

  if (error) {
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

  if (!subscriptionData?.subscription) {
    return null
  }

  const getSubscriptionTypeInfo = () => {
    const lookupKey = subscriptionData.subscription?.package.stripeLookupKey
    const packageName = subscriptionData.subscription?.package.name

    if (lookupKey === STRIPE_LOOKUP_KEYS.PREMIUM_COACHING) {
      return {
        type: 'Coaching',
        title: 'Premium Coaching',
        description:
          'Full access to training plans, nutrition plans, and coaching sessions.',
      }
    }

    if (
      lookupKey === STRIPE_LOOKUP_KEYS.PREMIUM_MONTHLY ||
      lookupKey === STRIPE_LOOKUP_KEYS.PREMIUM_YEARLY
    ) {
      return {
        type: 'Premium',
        title: 'Premium',
        description: 'Premium platform access with enhanced features.',
      }
    }

    return {
      type: 'Active',
      title: packageName || 'Subscription',
      description: 'Active subscription with premium features.',
    }
  }

  const getNextBillingInfo = () => {
    if (!subscriptionData.subscription?.endDate) return null

    const endDate = new Date(subscriptionData.subscription.endDate)
    const now = new Date()

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
  const promotionalDiscount = subscriptionData.promotionalDiscount

  return (
    <div className="space-y-4">
      <Card className="bg-card-on-card">
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">
                  {subscriptionInfo.title}
                </h3>
                <Badge
                  variant={
                    subscriptionData.status === 'CANCELLED_ACTIVE'
                      ? 'secondary'
                      : 'premium'
                  }
                  className={
                    subscriptionData.status === 'CANCELLED_ACTIVE'
                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  }
                >
                  {subscriptionData.status === 'CANCELLED_ACTIVE'
                    ? 'Cancelled'
                    : 'Active'}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                {subscriptionInfo.description}
              </p>

              {nextBilling && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {subscriptionData.status === 'CANCELLED_ACTIVE'
                      ? `Access expires: ${nextBilling.date}`
                      : `Next billing: ${nextBilling.date}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {subscriptionData.status === 'CANCELLED_ACTIVE'
                      ? 'Subscription cancelled - no further charges will occur'
                      : `${nextBilling.period} subscription`}
                  </p>
                </div>
              )}

              {subscriptionData.status === 'TRIAL' &&
                subscriptionData.expiresAt && (
                  <p className="text-sm text-muted-foreground">
                    Trial expires:{' '}
                    {new Date(subscriptionData.expiresAt).toLocaleDateString()}
                  </p>
                )}
            </div>
          </div>

          {promotionalDiscount && (
            <PromotionalDiscountBanner
              discount={promotionalDiscount}
              className="mt-4"
            />
          )}
        </CardContent>
      </Card>

      {/* Freeze Subscription (Premium Yearly only) */}
      {subscriptionData.subscription?.package?.stripeLookupKey ===
        STRIPE_LOOKUP_KEYS.PREMIUM_YEARLY && <FreezeSubscriptionSection />}
    </div>
  )
}
