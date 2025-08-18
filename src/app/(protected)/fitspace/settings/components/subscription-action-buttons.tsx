'use client'

import { formatDate } from 'date-fns'

import { Button } from '@/components/ui/button'

interface ActiveSubscription {
  id: string
  endDate: string
}

interface SubscriptionActionButtonsProps {
  hasCancelledSubscription: boolean
  activeSubscription?: ActiveSubscription
  isUpgrading: boolean
  onReactivate: () => void
  onCancel: () => void
  premiumPackage?: { priceNOK: number }
}

export function SubscriptionActionButtons({
  hasCancelledSubscription,
  activeSubscription,
  isUpgrading,
  onReactivate,
  onCancel,
  premiumPackage,
}: SubscriptionActionButtonsProps) {
  return (
    <div className="mt-4 pt-4">
      {hasCancelledSubscription ? (
        <Button
          onClick={onReactivate}
          disabled={isUpgrading || !premiumPackage}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          loading={isUpgrading}
        >
          Reactivate Premium
        </Button>
      ) : (
        <div className="flex flex-col gap-3">
          <Button
            onClick={onCancel}
            disabled={!activeSubscription}
            variant="destructive"
            className="w-full"
          >
            Cancel Subscription
          </Button>
          <p className="text-xs text-center text-gray-600 dark:text-gray-400">
            You'll keep premium access until{' '}
            {activeSubscription?.endDate &&
              formatDate(activeSubscription.endDate, 'd. MMMM yyyy')}
          </p>
        </div>
      )}
    </div>
  )
}
