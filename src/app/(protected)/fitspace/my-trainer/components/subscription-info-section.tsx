'use client'

import { format } from 'date-fns'
import { CreditCard, SparklesIcon } from 'lucide-react'

import { LoadingSkeleton } from '@/components/loading-skeleton'
import { PromotionalDiscountBanner } from '@/components/subscription/promotional-discount-banner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SectionIcon } from '@/components/ui/section-icon'
import { useUser } from '@/context/user-context'
import { useCurrentSubscription } from '@/hooks/use-current-subscription'
import { useOpenUrl } from '@/hooks/use-open-url'
import { usePaymentRules } from '@/hooks/use-payment-rules'
import { STRIPE_LOOKUP_KEYS } from '@/lib/stripe/lookup-keys'

export function SubscriptionInfoSection() {
  const { user } = useUser()
  const { data: subscriptionData, isLoading } = useCurrentSubscription(
    user?.id,
    {
      lookupKey: STRIPE_LOOKUP_KEYS.PREMIUM_COACHING, // Show only Premium Coaching subscription
    },
  )
  const rules = usePaymentRules()
  const {
    openUrl: openAccountManagement,
    isLoading: isOpeningAccountManagement,
  } = useOpenUrl({
    errorMessage: 'Failed to open account management',
    openInApp: rules.canLinkToPayment,
  })

  const handleManageSubscription = () => {
    openAccountManagement('/account-management')
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SectionIcon icon={SparklesIcon} size="xs" variant="amber" />
            Coaching Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <LoadingSkeleton count={2} />
        </CardContent>
      </Card>
    )
  }

  const getSubscriptionDisplayInfo = () => {
    if (!subscriptionData?.subscription) {
      return {
        title: 'No Active Coaching',
        description: 'You currently have no active coaching access.',
        status: 'inactive' as const,
      }
    }

    const stripeLookupKey =
      subscriptionData.subscription.package.stripeLookupKey

    // Check subscription type using lookup keys
    if (stripeLookupKey === STRIPE_LOOKUP_KEYS.PREMIUM_COACHING) {
      return {
        title: 'Complete Coaching',
        description:
          'Full access to training plans, nutrition plans, and coaching sessions.',
        status: 'premium' as const,
      }
    }

    if (
      stripeLookupKey === STRIPE_LOOKUP_KEYS.PREMIUM_MONTHLY ||
      stripeLookupKey === STRIPE_LOOKUP_KEYS.PREMIUM_YEARLY
    ) {
      return {
        title: 'Premium',
        description: 'Premium platform access with enhanced features.',
        status: 'premium' as const,
      }
    }

    // Default case - use package name as fallback
    return {
      title: subscriptionData.subscription.package.name,
      description: 'Active coaching with premium features.',
      status: 'active' as const,
    }
  }

  const getNextBillingInfo = () => {
    if (!subscriptionData?.subscription?.endDate) return null

    const endDate = new Date(subscriptionData.subscription.endDate)
    const now = new Date()

    // Check if subscription is still active
    if (endDate <= now) return null

    return {
      date: format(endDate, 'MMM d, yyyy'), // e.g., "Nov 3, 2025"
    }
  }

  const subscriptionInfo = getSubscriptionDisplayInfo()
  const nextBilling = getNextBillingInfo()
  const hasActiveSubscription = subscriptionData?.hasPremiumAccess
  const promotionalDiscount = subscriptionData?.promotionalDiscount

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="flex items-center gap-2 justify-between w-full">
            <div className="flex items-center gap-2">
              <SectionIcon icon={SparklesIcon} size="xs" variant="amber" />
              <h3 className="text-lg font-semibold">
                {subscriptionInfo.title}
              </h3>
            </div>
            {hasActiveSubscription && (
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
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-4">
            {nextBilling && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {subscriptionData?.status === 'CANCELLED_ACTIVE'
                    ? `Access expires: ${nextBilling.date}`
                    : `Next payment: ${nextBilling.date}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {subscriptionData?.status === 'CANCELLED_ACTIVE'
                    ? 'Coaching cancelled - no further charges will occur'
                    : 'Recurring coaching access'}
                </p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              {subscriptionInfo.description}
            </p>

            {subscriptionData?.status === 'TRIAL' &&
              subscriptionData?.expiresAt && (
                <p className="text-sm text-muted-foreground">
                  Access expires:{' '}
                  {new Date(subscriptionData.expiresAt).toLocaleDateString()}
                </p>
              )}
          </div>
        </div>

        {promotionalDiscount && (
          <PromotionalDiscountBanner discount={promotionalDiscount} />
        )}

        {hasActiveSubscription && (
          <Button
            onClick={handleManageSubscription}
            variant={
              subscriptionData?.status === 'CANCELLED_ACTIVE'
                ? 'default'
                : 'tertiary'
            }
            className="w-full"
            iconStart={<CreditCard />}
            loading={isOpeningAccountManagement}
            disabled={isOpeningAccountManagement}
          >
            {subscriptionData?.status === 'CANCELLED_ACTIVE'
              ? 'Reactivate or Manage Coaching'
              : 'Manage Account & Billing'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
