'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { useConfirmationModalContext } from '@/components/confirmation-modal'
import {
  useCancelSubscriptionMutation,
  useCreateSubscriptionMutation,
  useReactivateSubscriptionMutation,
} from '@/generated/graphql-client'

interface UseSubscriptionActionsProps {
  premiumPackage?: {
    id: string
    priceNOK: number
  }
  activeSubscription?: {
    id: string
  }
  cancelledSubscription?: {
    id: string
    endDate: string
  }
}

export function useSubscriptionActions({
  premiumPackage,
  activeSubscription,
  cancelledSubscription,
}: UseSubscriptionActionsProps) {
  const [isUpgrading, setIsUpgrading] = useState(false)
  const queryClient = useQueryClient()
  const { openModal } = useConfirmationModalContext()

  // Mutations
  const createSubscription = useCreateSubscriptionMutation()
  const cancelSubscription = useCancelSubscriptionMutation()
  const reactivateSubscription = useReactivateSubscriptionMutation()

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

  const handleCancel = async () => {
    if (!activeSubscription) return

    openModal({
      title: 'Cancel Subscription',
      description:
        'Are you sure you want to cancel your subscription? You will continue to have premium access until the end of your billing period.',
      confirmText: 'Cancel Subscription',
      cancelText: 'Keep Subscription',
      variant: 'destructive',
      onConfirm: async () => {
        await cancelSubscription.mutateAsync({
          id: activeSubscription.id,
        })

        // Refresh subscription status
        await queryClient.invalidateQueries({
          queryKey: ['GetMySubscriptionStatus'],
        })
      },
    })
  }

  const handleReactivate = async () => {
    console.log('🔄 handleReactivate called', { cancelledSubscription })
    if (!cancelledSubscription) {
      console.log('❌ No cancelled subscription found')
      return
    }

    setIsUpgrading(true)
    try {
      console.log('🚀 Calling reactivateSubscription mutation with:', {
        subscriptionId: cancelledSubscription.id,
      })
      const result = await reactivateSubscription.mutateAsync({
        subscriptionId: cancelledSubscription.id,
      })
      console.log('✅ Reactivation successful:', result)

      // Refresh subscription status
      await queryClient.invalidateQueries({
        queryKey: ['GetMySubscriptionStatus'],
      })
      console.log('🔄 Queries invalidated')
    } catch (error) {
      console.error('❌ Failed to reactivate subscription:', error)
    } finally {
      setIsUpgrading(false)
    }
  }

  return {
    isUpgrading,
    handleUpgrade,
    handleReactivate,
    handleCancel,
    mutations: {
      createSubscription,
      cancelSubscription,
      reactivateSubscription,
    },
  }
}
