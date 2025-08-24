'use client'

import { useUser } from '@/context/user-context'
import {
  useGetActivePackageTemplatesQuery,
  useGetMySubscriptionStatusQuery,
  useGetMySubscriptionsQuery,
} from '@/generated/graphql-client'

import { useSubscriptionActions } from '../hooks/use-subscription-actions'

import { CurrentPlanCard } from './current-plan-card'
import { PremiumBenefitsCard } from './premium-benefits-card'
import { UpgradeCard } from './upgrade-card'

// Types for better subscription state management
interface SubscriptionState {
  type: 'none' | 'trial' | 'active' | 'grace_period' | 'cancelled' | 'expired'
  subscription?: {
    id: string
    status: string
    isActive: boolean
    daysUntilExpiry: number
    endDate?: string
    package?: {
      id: string
      name: string
      duration: string
    }
  }
  daysRemaining?: number
  isReactivationEligible?: boolean
}

export function SubscriptionSection() {
  const { user } = useUser()
  const { data: subscriptionData, isLoading } =
    useGetMySubscriptionStatusQuery()
  const { data: packagesData } = useGetActivePackageTemplatesQuery({})
  const { data: mySubscriptionsData } = useGetMySubscriptionsQuery()
  const subscriptionStatus = subscriptionData?.getMySubscriptionStatus
  const availablePackages = packagesData?.getActivePackageTemplates || []
  const mySubscriptions = mySubscriptionsData?.getMySubscriptions || []

  // Simple package selection - just get monthly and yearly options
  const monthlyPackage = availablePackages.find(
    (pkg) => pkg.duration === 'MONTHLY' && pkg.isActive,
  )
  const yearlyPackage = availablePackages.find(
    (pkg) => pkg.duration === 'YEARLY' && pkg.isActive,
  )

  // Analyze subscription state with comprehensive logic
  const subscriptionState: SubscriptionState = (() => {
    // No premium access at all
    if (!subscriptionStatus?.hasPremium) {
      return { type: 'none' }
    }

    // Check for active subscription from mySubscriptions
    const activeSubscription = mySubscriptions.find(
      (sub) => sub.status === 'ACTIVE' && sub.isActive,
    )

    if (activeSubscription) {
      // Check if it's a trial based on subscription duration
      const isTrialActive =
        activeSubscription.daysUntilExpiry > 0 &&
        activeSubscription.daysUntilExpiry <= 14 // Assuming 14-day trial

      return {
        type: isTrialActive ? 'trial' : 'active',
        subscription: activeSubscription,
        daysRemaining: activeSubscription.daysUntilExpiry,
      }
    }

    // Check for cancelled but still active subscription
    const cancelledSubscription = mySubscriptions.find(
      (sub) => sub.status === 'CANCELLED' && sub.isActive,
    )
    if (cancelledSubscription) {
      return {
        type: 'grace_period',
        subscription: cancelledSubscription,
        daysRemaining: cancelledSubscription.daysUntilExpiry,
        isReactivationEligible: true,
      }
    }

    // Check for expired subscription
    const expiredSubscription = mySubscriptions.find(
      (sub) => sub.status === 'EXPIRED',
    )
    if (expiredSubscription) {
      return {
        type: 'cancelled',
        subscription: expiredSubscription,
        isReactivationEligible: true,
      }
    }

    // Has premium but no subscriptions (edge case)
    return { type: 'expired' }
  })()

  // For upgrade functionality, we still need the hook for the UpgradeCard
  const { isUpgrading, handleUpgrade } = useSubscriptionActions({
    userId: user?.id || '',
    premiumPackage: monthlyPackage
      ? {
          id: monthlyPackage.id,
        }
      : undefined,
  })

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-muted rounded-lg"></div>
        <div className="h-64 bg-muted rounded-lg"></div>
      </div>
    )
  }

  if (!user?.id || user.email !== 'm.glowacki01@gmail.com') {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Current Plan Status - Enhanced with subscription state */}
      <CurrentPlanCard
        hasPremium={subscriptionState.type !== 'none'}
        subscriptionState={subscriptionState}
      />

      {/* Render different components based on subscription state */}
      {subscriptionState.type === 'none' ? (
        /* No subscription - show upgrade options */
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
      ) : (
        /* Has some form of subscription - show management */
        <PremiumBenefitsCard
          subscriptionState={subscriptionState}
          userId={user?.id || ''}
        />
      )}
    </div>
  )
}
