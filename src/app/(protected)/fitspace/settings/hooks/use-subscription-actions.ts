'use client'

import { useState } from 'react'

import { useCreateCheckoutSession } from '@/hooks/use-subscription'

interface UseSubscriptionActionsProps {
  userId: string
  premiumPackage?: {
    id: string
  }
}

export function useSubscriptionActions({
  userId,
  premiumPackage,
}: UseSubscriptionActionsProps) {
  const [isUpgrading, setIsUpgrading] = useState(false)

  // Stripe mutations
  const createCheckoutSession = useCreateCheckoutSession()

  const handleUpgrade = async (packageId?: string) => {
    const targetPackageId = packageId || premiumPackage?.id
    if (!targetPackageId) return

    setIsUpgrading(true)
    try {
      const result = await createCheckoutSession.mutateAsync({
        userId,
        packageId: targetPackageId,
        returnUrl: `${window.location.origin}/account-management?success=true`,
        cancelUrl: `${window.location.origin}/account-management?cancelled=true`,
      })

      // Redirect to Stripe checkout
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl
      } else {
        console.error('No checkout URL returned')
        setIsUpgrading(false)
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error)
      setIsUpgrading(false)
    }
  }

  return {
    isUpgrading,
    handleUpgrade,
    mutations: {
      createCheckoutSession,
    },
  }
}
