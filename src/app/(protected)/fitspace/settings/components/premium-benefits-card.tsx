'use client'

import { formatDate } from 'date-fns'
import { Check } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

import { PREMIUM_BENEFITS, PremiumBenefitsList } from './premium-benefits-list'
import { SubscriptionActionButtons } from './subscription-action-buttons'

interface CancelledSubscription {
  endDate: string
}

interface ActiveSubscription {
  id: string
  endDate: string
}

interface PremiumBenefitsCardProps {
  hasCancelledSubscription: boolean
  cancelledSubscription?: CancelledSubscription
  activeSubscription?: ActiveSubscription
  isUpgrading: boolean
  onReactivate: () => void
  onCancel: () => void
  premiumPackage?: { priceNOK: number }
}

export function PremiumBenefitsCard({
  hasCancelledSubscription,
  cancelledSubscription,
  activeSubscription,
  isUpgrading,
  onReactivate,
  onCancel,
  premiumPackage,
}: PremiumBenefitsCardProps) {
  // Extract subscription end date logic for clarity
  const endDate = hasCancelledSubscription
    ? cancelledSubscription?.endDate
    : activeSubscription?.endDate

  const formattedEndDate = endDate
    ? formatDate(endDate, 'd. MMMM yyyy')
    : 'Unknown'

  return (
    <div className="space-y-6">
      <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {hasCancelledSubscription
          ? 'Premium Expiring Soon'
          : 'Premium Benefits Active'}
      </h4>

      <Card variant="tertiary">
        <CardContent>
          {/* Header */}
          <div className="flex items-center space-x-3 mb-4">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                hasCancelledSubscription ? 'bg-orange-500' : 'bg-green-500'
              }`}
            >
              <Check className="w-5 h-5 text-white" />
            </div>
            <h5
              className={`text-lg font-semibold ${
                hasCancelledSubscription
                  ? 'text-orange-900 dark:text-orange-100'
                  : 'text-green-900 dark:text-green-100'
              }`}
            >
              {hasCancelledSubscription
                ? 'Premium Cancelled'
                : 'Premium Active'}
            </h5>
          </div>

          {/* Cancellation Notice */}
          {hasCancelledSubscription && cancelledSubscription && (
            <div className="mb-4 p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <p className="text-sm text-orange-800 dark:text-orange-200 font-medium">
                Your subscription has been cancelled but you still have premium
                access until{' '}
                <span className="font-bold">
                  {formatDate(cancelledSubscription.endDate, 'd. MMMM yyyy')}
                </span>
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                Reactivate anytime before this date to continue your premium
                benefits.
              </p>
            </div>
          )}

          {/* Benefits List */}
          <PremiumBenefitsList
            benefits={PREMIUM_BENEFITS}
            variant={hasCancelledSubscription ? 'orange' : 'green'}
          />

          {/* Subscription Dates */}
          {(activeSubscription || hasCancelledSubscription) && (
            <div
              className={`mt-4 pt-4 border-t ${
                hasCancelledSubscription
                  ? 'border-orange-200 dark:border-orange-800'
                  : 'border-green-200 dark:border-green-800'
              }`}
            >
              <p
                className={`text-sm ${
                  hasCancelledSubscription
                    ? 'text-orange-700 dark:text-orange-300'
                    : 'text-green-700 dark:text-green-300'
                }`}
              >
                {hasCancelledSubscription ? 'Premium expires' : 'Active until'}:{' '}
                {formattedEndDate}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <SubscriptionActionButtons
            hasCancelledSubscription={hasCancelledSubscription}
            activeSubscription={activeSubscription}
            isUpgrading={isUpgrading}
            onReactivate={onReactivate}
            onCancel={onCancel}
            premiumPackage={premiumPackage}
          />
        </CardContent>
      </Card>
    </div>
  )
}
