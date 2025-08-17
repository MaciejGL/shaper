'use client'

import { useQueryClient } from '@tanstack/react-query'
import { Check, Crown, Sparkles } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  useCreateSubscriptionMutation,
  useGetActivePackageTemplatesQuery,
  useGetMySubscriptionStatusQuery,
} from '@/generated/graphql-client'
import { formatPrice } from '@/types/subscription'

export function SubscriptionSection() {
  const [isUpgrading, setIsUpgrading] = useState(false)
  const queryClient = useQueryClient()

  // Fetch user's subscription status
  const { data: subscriptionData, isLoading } =
    useGetMySubscriptionStatusQuery()

  // Fetch premium package template
  const { data: packagesData } = useGetActivePackageTemplatesQuery({})

  // Create subscription mutation
  const createSubscription = useCreateSubscriptionMutation()

  const subscriptionStatus = subscriptionData?.getMySubscriptionStatus
  const premiumPackage = packagesData?.getActivePackageTemplates?.find(
    (pkg) => pkg.name === 'Hypertro Premium',
  )

  const handleUpgrade = async () => {
    if (!premiumPackage) return

    setIsUpgrading(true)
    try {
      await createSubscription.mutateAsync({
        input: {
          userId: '', // Will be filled by backend from context
          packageId: premiumPackage.id,
          durationMonths: 1,
        },
      })

      // Refresh subscription status without page reload
      await queryClient.invalidateQueries({
        queryKey: ['GetMySubscriptionStatus'],
      })
    } catch (error) {
      console.error('Failed to upgrade:', error)
    } finally {
      setIsUpgrading(false)
    }
  }

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
      {/* Current Plan */}
      <div className="flex items-center justify-between shadow-xs p-6 bg-zinc-300 dark:bg-gray-600/50 rounded-lg">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Current Plan
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {subscriptionStatus?.hasPremium
              ? 'Premium Plan - All features unlocked'
              : 'Free Plan - Basic features included'}
          </p>
        </div>
        <Badge
          variant={subscriptionStatus?.hasPremium ? 'premium' : 'secondary'}
          className={`px-4 py-2 text-sm font-medium ${
            subscriptionStatus?.hasPremium
              ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white'
              : ''
          }`}
        >
          {subscriptionStatus?.hasPremium ? (
            <>
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </>
          ) : (
            'Free'
          )}
        </Badge>
      </div>

      {/* Premium Status or Upgrade Options */}
      {subscriptionStatus?.hasPremium ? (
        <div className="space-y-6">
          <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Premium Benefits Active
          </h4>
          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <h5 className="text-lg font-semibold text-green-900 dark:text-green-100">
                Premium Active
              </h5>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-800 dark:text-green-200">
                  Unlimited training plans
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-800 dark:text-green-200">
                  Full meal plan access
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-800 dark:text-green-200">
                  Premium exercise library
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-800 dark:text-green-200">
                  Advanced analytics
                </span>
              </div>
            </div>

            {/* Show active subscriptions */}
            {subscriptionStatus.activeSubscriptions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300">
                  Active until:{' '}
                  {new Date(
                    subscriptionStatus.activeSubscriptions[0].endDate,
                  ).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Upgrade to Premium
          </h4>
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-blue-600 p-8 rounded-lg text-white">
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="text-2xl font-bold">Premium Features</h5>
                  {premiumPackage && (
                    <p className="text-white/80 text-sm">
                      {formatPrice(premiumPackage.priceNOK)}/month
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                  <span className="text-sm">Unlimited training plans</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                  <span className="text-sm">
                    Access to premium exercises library
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                  <span className="text-sm">Full meal plan access</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                  <span className="text-sm">
                    Premium training plan templates
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                  <span className="text-sm">Advanced progress analytics</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                  <span className="text-sm">Priority customer support</span>
                </div>
              </div>
              <Button
                onClick={handleUpgrade}
                disabled={isUpgrading || !premiumPackage}
                variant="outline"
                className="w-full h-12 text-white border-white/30 hover:bg-white/10 disabled:opacity-50"
              >
                {isUpgrading
                  ? 'Upgrading...'
                  : premiumPackage
                    ? `Upgrade to Premium - ${formatPrice(premiumPackage.priceNOK)}/month`
                    : 'Loading...'}
              </Button>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
          </div>
        </div>
      )}

      {/* Usage Information */}
      <div className="p-6 bg-zinc-300 dark:bg-gray-800/50 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Usage & Limits
        </h4>
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Training Plans:</span>{' '}
            {subscriptionStatus?.trainingPlanLimit === -1
              ? 'Unlimited'
              : `Limited to ${subscriptionStatus?.trainingPlanLimit || 1}`}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Meal Plans:</span>{' '}
            {subscriptionStatus?.canAccessMealPlans
              ? 'Full Access'
              : 'Premium Required'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Premium Exercises:</span>{' '}
            {subscriptionStatus?.canAccessPremiumExercises
              ? 'Full Access'
              : 'Premium Required'}
          </p>
        </div>
      </div>
    </div>
  )
}
