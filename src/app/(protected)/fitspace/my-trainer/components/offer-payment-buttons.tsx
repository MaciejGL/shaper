'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { useUser } from '@/context/user-context'
import { GQLFitGetMyTrainerOffersQuery } from '@/generated/graphql-client'

interface OfferPaymentButtonsProps {
  offer: GQLFitGetMyTrainerOffersQuery['getClientTrainerOffers'][number]
  userHasPremiumSubscription: boolean
}

export function OfferPaymentButtons({
  offer,
  userHasPremiumSubscription,
}: OfferPaymentButtonsProps) {
  const { user } = useUser()
  const [isLoadingCoaching, setIsLoadingCoaching] = useState(false)
  const [isLoadingAddons, setIsLoadingAddons] = useState(false)
  const [isLoadingAll, setIsLoadingAll] = useState(false)

  // Check if offer contains coaching premium
  const hasCoachingInOffer = offer.packageSummary.some(
    (item) =>
      item.name.toLowerCase().includes('coaching') ||
      item.name.toLowerCase().includes('premium coaching'),
  )

  // Check if offer has non-coaching items (addons)
  const hasAddons = offer.packageSummary.some(
    (item) =>
      !item.name.toLowerCase().includes('coaching') &&
      !item.name.toLowerCase().includes('premium coaching'),
  )

  const handlePurchase = async (
    itemFilter: 'all' | 'coaching-only' | 'addons-only',
  ) => {
    if (!user?.email) {
      toast.error('Please log in to continue')
      return
    }

    const loadingSetter =
      itemFilter === 'all'
        ? setIsLoadingAll
        : itemFilter === 'coaching-only'
          ? setIsLoadingCoaching
          : setIsLoadingAddons

    loadingSetter(true)

    try {
      const response = await fetch('/api/stripe/create-trainer-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerToken: offer.token,
          clientEmail: user.email,
          itemFilter,
          successUrl: `${window.location.origin}/fitspace/my-trainer?tab=purchased-services&payment=success`,
          cancelUrl: `${window.location.origin}/fitspace/my-trainer?tab=purchased-services&payment=cancelled`,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create checkout')
      }

      // Redirect to Stripe Checkout
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error) {
      console.error('Error creating checkout:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to proceed to payment',
      )
    } finally {
      loadingSetter(false)
    }
  }

  // Scenario A: User has NO premium subscription
  if (!userHasPremiumSubscription) {
    return (
      <div className="pt-2">
        <Button
          onClick={() => handlePurchase('all')}
          className="w-full"
          loading={isLoadingAll}
          disabled={isLoadingAll}
        >
          Proceed to Payment
        </Button>
      </div>
    )
  }

  // Scenario B: User HAS premium + Offer includes coaching
  if (hasCoachingInOffer) {
    return (
      <div className="pt-2 space-y-2">
        <Button
          onClick={() => handlePurchase('coaching-only')}
          className="w-full"
          loading={isLoadingCoaching}
          disabled={isLoadingCoaching || isLoadingAddons}
          variant="default"
        >
          Upgrade to Coaching Premium
        </Button>
        {hasAddons && (
          <Button
            onClick={() => handlePurchase('addons-only')}
            className="w-full"
            loading={isLoadingAddons}
            disabled={isLoadingCoaching || isLoadingAddons}
            variant="secondary"
          >
            Purchase Add-ons Separately
          </Button>
        )}
        <p className="text-xs text-muted-foreground text-center">
          Unused time from your current plan will be credited automatically
        </p>
      </div>
    )
  }

  // Scenario C: User has premium but offer is addons-only
  return (
    <div className="pt-2">
      <Button
        onClick={() => handlePurchase('addons-only')}
        className="w-full"
        loading={isLoadingAddons}
        disabled={isLoadingAddons}
      >
        Purchase Services
      </Button>
    </div>
  )
}
