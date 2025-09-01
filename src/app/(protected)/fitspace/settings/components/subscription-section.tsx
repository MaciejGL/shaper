'use client'

import { useState } from 'react'

import { CoachingServiceTerms } from '@/components/subscription/coaching-service-terms'
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

  // Terms dialog state
  const [showTermsDialog, setShowTermsDialog] = useState(false)

  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false)
  const [showTermsError, setShowTermsError] = useState(false)

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
  const { isUpgrading, handleUpgrade: originalHandleUpgrade } =
    useSubscriptionActions({
      userId: user?.id || '',
      premiumPackage: monthlyPackage
        ? {
            id: monthlyPackage.id,
          }
        : undefined,
    })

  // Modified upgrade handler to check terms agreement first
  const handleUpgradeWithTerms = (packageId?: string) => {
    setShowTermsError(false)
    if (!hasAgreedToTerms) {
      setShowTermsError(true)
      return
    }
    originalHandleUpgrade(packageId)
  }

  const handleShowTerms = () => {
    setShowTermsDialog(true)
  }

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
        <div className="space-y-6">
          {/* Terms Agreement for Premium */}
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="premium-terms-agreement"
                checked={hasAgreedToTerms}
                onChange={(e) => {
                  setHasAgreedToTerms(e.target.checked)
                  if (e.target.checked) {
                    setShowTermsError(false)
                  }
                }}
                className={`mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary ${
                  showTermsError ? 'border-red-500 ring-red-500' : ''
                }`}
              />
              <label
                htmlFor="premium-terms-agreement"
                className="text-sm text-muted-foreground leading-5"
              >
                I agree to the{' '}
                <button
                  type="button"
                  onClick={handleShowTerms}
                  className="text-primary hover:text-primary/80 underline font-medium"
                >
                  premium service terms
                </button>
                {', '}
                <a
                  href="/terms"
                  target="_blank"
                  className="text-primary hover:text-primary/80 underline"
                >
                  terms of service
                </a>
                {', and '}
                <a
                  href="/privacy"
                  target="_blank"
                  className="text-primary hover:text-primary/80 underline"
                >
                  privacy policy
                </a>
              </label>
            </div>

            {/* Terms Error Message */}
            {showTermsError && (
              <div className="flex items-center space-x-2 text-red-600 text-sm mt-2">
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Please agree to the terms and conditions to proceed</span>
              </div>
            )}
          </div>

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
            onUpgrade={handleUpgradeWithTerms}
          />
        </div>
      ) : (
        /* Has some form of subscription - show management */
        <PremiumBenefitsCard
          subscriptionState={subscriptionState}
          userId={user?.id || ''}
        />
      )}

      {/* Premium Service Terms Dialog */}
      <CoachingServiceTerms
        isOpen={showTermsDialog}
        onClose={() => setShowTermsDialog(false)}
        onAccept={() => setShowTermsDialog(false)}
        serviceType="premium"
        packages={[]}
        readOnly={true}
      />
    </div>
  )
}
