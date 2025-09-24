'use client'

import { CreditCard, SparklesIcon } from 'lucide-react'

import { LoadingSkeleton } from '@/components/loading-skeleton'
import { useMobileApp } from '@/components/mobile-app-bridge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SectionIcon } from '@/components/ui/section-icon'
import { useUser } from '@/context/user-context'
import { useCurrentSubscription } from '@/hooks/use-current-subscription'

export function SubscriptionInfoSection() {
  const { user } = useUser()
  const { data: subscriptionData, isLoading } = useCurrentSubscription(user?.id)
  const { isNativeApp } = useMobileApp()

  const handleManageSubscription = () => {
    const accountManagementUrl = `${window.location.origin}/account-management`

    if (isNativeApp) {
      // Force external browser opening for native app
      const opened = window.open(
        accountManagementUrl,
        '_blank',
        'noopener,noreferrer,external=true',
      )

      if (!opened) {
        // Fallback: create link element
        const link = document.createElement('a')
        link.href = accountManagementUrl
        link.target = '_blank'
        link.rel = 'noopener noreferrer external'
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } else {
      window.open(accountManagementUrl, '_blank', 'noopener,noreferrer')
    }
  }

  if (isLoading) {
    return (
      <Card borderless>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SectionIcon icon={SparklesIcon} size="sm" variant="amber" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <LoadingSkeleton count={2} withBorder />
        </CardContent>
      </Card>
    )
  }

  const getSubscriptionDisplayInfo = () => {
    if (!subscriptionData?.subscription) {
      return {
        title: 'No Active Subscription',
        description: 'You currently have no active subscription.',
        status: 'inactive' as const,
      }
    }

    const packageName = subscriptionData.subscription.package.name

    // Check for Complete Coaching subscription
    if (
      packageName.toLowerCase().includes('complete') ||
      packageName.toLowerCase().includes('coaching')
    ) {
      return {
        title: 'Complete Coaching',
        description:
          'Full access to training plans, nutrition plans, and coaching sessions.',
        status: 'premium' as const,
      }
    }

    // Check for Premium subscription
    if (packageName.toLowerCase().includes('premium')) {
      return {
        title: 'Premium',
        description: 'Premium platform access with enhanced features.',
        status: 'premium' as const,
      }
    }

    // Default case
    return {
      title: packageName,
      description: 'Active subscription with premium features.',
      status: 'active' as const,
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

  const subscriptionInfo = getSubscriptionDisplayInfo()
  const nextBilling = getNextBillingInfo()
  const hasActiveSubscription = subscriptionData?.hasPremiumAccess

  return (
    <Card borderless>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="flex items-center gap-2 justify-between w-full">
            <div className="flex items-center gap-2">
              <SectionIcon icon={SparklesIcon} size="sm" variant="amber" />
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
          <div className="space-y-2">
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
          >
            {subscriptionData?.status === 'CANCELLED_ACTIVE'
              ? 'Reactivate or Manage Subscription'
              : 'Manage Account & Subscription'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
