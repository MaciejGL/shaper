'use client'

import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { useCustomerPortal } from '@/hooks/use-subscription'

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
      priceNOK: number
      duration: string
    }
  }
  daysRemaining?: number
  isReactivationEligible?: boolean
}

interface SubscriptionActionButtonsProps {
  subscriptionState: SubscriptionState
  userId: string
}

export function SubscriptionActionButtons({
  subscriptionState,
  userId,
}: SubscriptionActionButtonsProps) {
  const { type } = subscriptionState

  // Use the customer portal hook
  const customerPortal = useCustomerPortal()

  const handleOpenCustomerPortal = async () => {
    try {
      const result = await customerPortal.mutateAsync({
        userId,
        returnUrl: `${window.location.origin}/fitspace/settings`,
      })

      if (result.url) {
        window.open(result.url, '_blank')
      }
    } catch (error) {
      console.error('Failed to open customer portal:', error)
      toast.error('Failed to open customer portal')
    }
  }

  return (
    <div className="mt-4 pt-4">
      {(type === 'active' ||
        type === 'grace_period' ||
        type === 'cancelled') && (
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleOpenCustomerPortal}
            variant={type === 'grace_period' ? 'default' : 'secondary'}
            className={
              type === 'grace_period'
                ? 'w-full bg-orange-600 hover:bg-orange-700 text-white'
                : 'w-full'
            }
            disabled={customerPortal.isPending}
            loading={customerPortal.isPending}
          >
            Manage Subscription
          </Button>
          <p
            className={`text-xs text-center ${
              type === 'grace_period'
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {type === 'grace_period'
              ? 'Update your payment method or manage your subscription'
              : type === 'cancelled'
                ? 'Reactivate your subscription or manage billing settings'
                : 'Update payment method, cancel subscription, or view billing history'}
          </p>
        </div>
      )}
    </div>
  )
}
