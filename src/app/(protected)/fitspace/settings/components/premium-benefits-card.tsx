'use client'

import { formatDate } from 'date-fns'
import { AlertTriangle, Clock, Crown } from 'lucide-react'

import { BadgeProps } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { PREMIUM_BENEFITS, PremiumBenefitsList } from './premium-benefits-list'
import { SubscriptionActionButtons } from './subscription-action-buttons'

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

interface PremiumBenefitsCardProps {
  subscriptionState: SubscriptionState
  userId: string
}

export function PremiumBenefitsCard({
  subscriptionState,
  userId,
}: PremiumBenefitsCardProps) {
  // Get display information based on subscription state

  const displayInfo = getDisplayInfo(subscriptionState)
  const StatusIcon = displayInfo.icon

  return (
    <div className="space-y-6">
      <Card variant="secondary">
        <CardContent>
          {/* Header */}
          <div className="flex items-center space-x-3 mb-4">
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center',
                displayInfo.iconColor,
              )}
            >
              <StatusIcon className="w-5 h-5 text-white" />
            </div>
            <h5 className={cn('text-lg font-semibold', displayInfo.textColor)}>
              {displayInfo.title}
            </h5>
          </div>

          {/* Notice */}
          {displayInfo.notice && (
            <div className={cn('mb-4 p-3 rounded-lg', displayInfo.bgColor)}>
              <p className={cn('text-sm font-medium', displayInfo.textColor)}>
                {displayInfo.notice}
              </p>
            </div>
          )}

          {/* Benefits List */}
          <PremiumBenefitsList
            benefits={PREMIUM_BENEFITS}
            variant={displayInfo.benefitsVariant}
          />

          {/* Status Information */}
          <div className={cn('mt-4 pt-4 border-t', displayInfo.borderColor)}>
            <p className={cn('text-sm', displayInfo.textColor)}>
              {displayInfo.statusText}
            </p>
          </div>

          {/* Action Buttons */}
          <SubscriptionActionButtons
            subscriptionState={subscriptionState}
            userId={userId}
          />
        </CardContent>
      </Card>
    </div>
  )
}

const getDisplayInfo = (
  subscriptionState: SubscriptionState,
): {
  title: string
  icon: React.ElementType
  iconColor: string
  textColor: string
  benefitsVariant: BadgeProps['variant']
  borderColor: string
  bgColor: string
  statusText: string
  notice: string | null
} => {
  switch (subscriptionState.type) {
    case 'trial':
      return {
        title: 'Premium Trial - Active',
        icon: Clock,
        iconColor: cn('bg-blue-500'),
        textColor: cn('text-blue-900 dark:text-blue-100'),
        benefitsVariant: 'premium',
        borderColor: cn('border-blue-200 dark:border-blue-800'),
        bgColor: cn('bg-blue-100 dark:bg-blue-900/30'),
        statusText: `Trial ends in ${subscriptionState.daysRemaining} days`,
        notice: `Your premium trial is active! Enjoy all features for ${subscriptionState.daysRemaining} more days.`,
      }
    case 'active':
      return {
        title: 'Premium Benefits - Active',
        icon: Crown,
        iconColor: cn('bg-green-500'),
        textColor: cn('text-green-900 dark:text-green-100'),
        benefitsVariant: 'premium',
        borderColor: cn('border-green-200 dark:border-green-800'),
        bgColor: cn('bg-green-100 dark:bg-green-900/30'),
        statusText: `Active until ${subscriptionState.subscription?.endDate ? formatDate(subscriptionState.subscription.endDate, 'd. MMMM yyyy') : 'Unknown'}`,
        notice: null,
      }
    case 'grace_period':
      return {
        title: 'Premium Grace Period',
        icon: AlertTriangle,
        iconColor: cn('bg-orange-500'),
        textColor: cn('text-orange-900 dark:text-orange-100'),
        benefitsVariant: 'premium',
        borderColor: cn('border-orange-200 dark:border-orange-800'),
        bgColor: cn('bg-orange-100 dark:bg-orange-900/30'),
        statusText: `Grace period ends in ${subscriptionState.daysRemaining} days`,
        notice: `Payment failed, but you still have premium access for ${subscriptionState.daysRemaining} more days. Please update your payment method.`,
      }
    case 'cancelled':
      return {
        title: 'Subscription Cancelled',
        icon: AlertTriangle,
        iconColor: cn('bg-gray-500'),
        textColor: cn('text-gray-900 dark:text-gray-100'),
        benefitsVariant: 'warning',
        borderColor: cn('border-gray-200 dark:border-gray-800'),
        bgColor: cn('bg-gray-100 dark:bg-gray-900/30'),
        statusText: 'Subscription cancelled',
        notice:
          'Your subscription has been cancelled. You can reactivate it anytime to restore premium benefits.',
      }
    default:
      return {
        title: 'Expired Subscription',
        icon: AlertTriangle,
        iconColor: cn('bg-red-500'),
        textColor: cn('text-red-900 dark:text-red-100'),
        benefitsVariant: 'warning',
        borderColor: cn('border-red-200 dark:border-red-800'),
        bgColor: cn('bg-red-100 dark:bg-red-900/30'),
        statusText: 'Subscription expired',
        notice:
          'Your subscription has expired. Upgrade to restore premium benefits.',
      }
  }
}
