'use client'

import {
  useGetActivePackageTemplatesQuery,
  useGetMySubscriptionStatusQuery,
} from '@/generated/graphql-client'

import { useSubscriptionActions } from '../hooks/use-subscription-actions'

import { CurrentPlanCard } from './current-plan-card'
import { PremiumBenefitsCard } from './premium-benefits-card'
import { UpgradeCard } from './upgrade-card'
import { UsageLimitsCard } from './usage-limits-card'

export function SubscriptionSection() {
  // Fetch user's subscription status
  const { data: subscriptionData, isLoading } =
    useGetMySubscriptionStatusQuery()

  // Fetch premium package template
  const { data: packagesData } = useGetActivePackageTemplatesQuery({})

  const subscriptionStatus = subscriptionData?.getMySubscriptionStatus
  const premiumPackage = packagesData?.getActivePackageTemplates?.find(
    (pkg) => pkg.name === 'Hypertro Premium',
  )

  // Check subscription states
  const hasCancelledSubscription =
    (subscriptionStatus?.cancelledSubscriptions?.length ?? 0) > 0
  const cancelledSubscription = subscriptionStatus?.cancelledSubscriptions?.[0]
  const activeSubscription = subscriptionStatus?.activeSubscriptions?.find(
    (sub) => sub.status === 'ACTIVE',
  )

  // Subscription actions hook
  const { isUpgrading, handleUpgrade, handleReactivate, handleCancel } =
    useSubscriptionActions({
      premiumPackage,
      activeSubscription,
      cancelledSubscription,
    })

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-muted rounded-lg"></div>
        <div className="h-64 bg-muted rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Current Plan Status */}
      <CurrentPlanCard hasPremium={subscriptionStatus?.hasPremium ?? false} />

      {/* Premium Status or Upgrade Options */}
      {subscriptionStatus?.hasPremium ? (
        <PremiumBenefitsCard
          hasCancelledSubscription={hasCancelledSubscription}
          cancelledSubscription={cancelledSubscription}
          activeSubscription={activeSubscription}
          isUpgrading={isUpgrading}
          onReactivate={handleReactivate}
          onCancel={handleCancel}
          premiumPackage={premiumPackage}
        />
      ) : (
        <UpgradeCard
          premiumPackage={premiumPackage}
          isUpgrading={isUpgrading}
          onUpgrade={handleUpgrade}
        />
      )}

      {/* Usage Information */}
      <UsageLimitsCard
        trainingPlanLimit={subscriptionStatus?.trainingPlanLimit ?? 1}
        canAccessMealPlans={subscriptionStatus?.canAccessMealPlans ?? false}
        canAccessPremiumExercises={
          subscriptionStatus?.canAccessPremiumExercises ?? false
        }
      />
    </div>
  )
}
