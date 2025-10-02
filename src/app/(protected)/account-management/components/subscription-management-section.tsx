'use client'

import { CreditCard, Crown, ExternalLink } from 'lucide-react'

import { LoadingSkeleton } from '@/components/loading-skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUser } from '@/context/user-context'
import { useCurrentSubscription } from '@/hooks/use-current-subscription'

export function SubscriptionManagementSection() {
  const { user } = useUser()
  const { data: subscriptionData, isLoading } = useCurrentSubscription(user?.id)

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
      <Card borderless>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <LoadingSkeleton count={3} withBorder />
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

    const packageName = subscriptionData.subscription.package.name

    // Check for Complete Coaching subscription
    if (
      packageName.toLowerCase().includes('complete') ||
      packageName.toLowerCase().includes('coaching')
    ) {
      return {
        type: 'Coaching',
        title: 'Complete Coaching',
        description:
          'Full access to training plans, nutrition plans, and coaching sessions.',
        canUpgrade: true, // Can upgrade to Premium
      }
    }

    // Check for Premium subscription
    if (packageName.toLowerCase().includes('premium')) {
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

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <Card borderless className="bg-card-on-card">
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">
                  {subscriptionInfo.title}
                </h3>
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
                    {new Date(subscriptionData.expiresAt).toLocaleDateString()}
                  </p>
                )}
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-col gap-2">
        {hasActiveSubscription && (
          <Button
            onClick={handleManageSubscription}
            variant="secondary"
            className="w-full"
            iconStart={<CreditCard />}
            iconEnd={<ExternalLink />}
          >
            Manage Billing & Payment
          </Button>
        )}
      </div>
    </div>
  )
}
