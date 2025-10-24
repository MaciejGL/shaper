'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { useUser } from '@/context/user-context'
import { GQLFitGetMyTrainerOffersQuery } from '@/generated/graphql-client'

interface OfferPaymentButtonsProps {
  offer: GQLFitGetMyTrainerOffersQuery['getClientTrainerOffers'][number]
}

export function OfferPaymentButtons({ offer }: OfferPaymentButtonsProps) {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)

  const handlePayment = async () => {
    if (!user?.email) {
      toast.error('Please log in to continue')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/stripe/create-trainer-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerToken: offer.token,
          clientEmail: user.email,
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
      setIsLoading(false)
    }
  }

  return (
    <div className="pt-2">
      <Button onClick={handlePayment} className="w-full" loading={isLoading}>
        Pay in Stripe
      </Button>
    </div>
  )
}
