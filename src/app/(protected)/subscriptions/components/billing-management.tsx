'use client'

import { CreditCard, ExternalLink } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUser } from '@/context/user-context'
import { useCurrentSubscription } from '@/hooks/use-current-subscription'
import { usePaymentRules } from '@/hooks/use-payment-rules'

import { SendAccessLinkButton } from './send-access-link'

/**
 * Billing management section that adapts based on payment rules
 * - Full mode: Direct link to Stripe portal
 * - Companion mode: Email link instead (compliant)
 */
export function BillingManagement() {
  const rules = usePaymentRules()
  const { user, hasPremium } = useUser()
  const { data: subscriptionData } = useCurrentSubscription(user?.id)

  const hasStripeHistory =
    !!subscriptionData?.subscription?.stripeSubscriptionId

  // Only show for premium users or those with billing history
  if (!hasPremium && !hasStripeHistory) return null

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          returnUrl: `${window.location.origin}/subscriptions`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const { url } = await response.json()
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Failed to open billing portal:', error)
    }
  }

  return (
    <Card className="bg-card-on-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Billing</CardTitle>
      </CardHeader>
      <CardContent>
        {rules.canLinkToPayment ? (
          // Full access: Direct link to Stripe portal
          <Button
            onClick={handleManageSubscription}
            variant="secondary"
            className="w-full"
            iconStart={<CreditCard />}
            iconEnd={<ExternalLink />}
          >
            Manage Billing & Payment
          </Button>
        ) : (
          // Companion mode: Email link instead
          <SendAccessLinkButton />
        )}
      </CardContent>
    </Card>
  )
}
