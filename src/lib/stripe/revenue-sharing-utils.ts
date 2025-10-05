import Stripe from 'stripe'

import { prisma } from '@/lib/db'
import { COMMISSION_CONFIG } from '@/lib/stripe/config'
import { stripe } from '@/lib/stripe/stripe'

// Types for revenue sharing
export type PayoutDestination = {
  connectedAccountId: string | null
  destination: 'team' | 'individual' | 'none'
  displayName: string
}

export type RevenueCalculation = {
  totalAmount: number
  applicationFeeAmount: number
}

/**
 * Determines where trainer payments should be sent (team takes priority)
 */
export async function getPayoutDestination(
  trainerId: string,
): Promise<PayoutDestination> {
  const trainerWithTeam = await prisma.user.findUnique({
    where: { id: trainerId },
    select: {
      stripeConnectedAccountId: true,
      teamMemberships: {
        select: {
          team: {
            select: {
              id: true,
              name: true,
              stripeConnectedAccountId: true,
            },
          },
        },
        take: 1, // Get first active team membership
      },
    },
  })

  // Priority: Team account > Individual trainer account
  if (trainerWithTeam?.teamMemberships[0]?.team?.stripeConnectedAccountId) {
    const team = trainerWithTeam.teamMemberships[0].team
    return {
      connectedAccountId: team.stripeConnectedAccountId,
      destination: 'team',
      displayName: `team:${team.name}`,
    }
  }

  if (trainerWithTeam?.stripeConnectedAccountId) {
    return {
      connectedAccountId: trainerWithTeam.stripeConnectedAccountId,
      destination: 'individual',
      displayName: 'individual',
    }
  }

  return {
    connectedAccountId: null,
    destination: 'none',
    displayName: 'none',
  }
}

/**
 * Calculates revenue split amounts for payment mode (one-time payments)
 * Note: Stripe automatically handles processing fees - we just calculate platform fee
 */
export async function calculateRevenueSharing(
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
): Promise<RevenueCalculation> {
  let totalAmount = 0

  // Calculate total from line items
  for (const lineItem of lineItems) {
    if (lineItem.price_data && lineItem.price_data.unit_amount) {
      // Dynamic pricing
      totalAmount += lineItem.price_data.unit_amount * (lineItem.quantity || 1)
    } else if (lineItem.price) {
      // Regular pricing - fetch from Stripe
      const price = await stripe.prices.retrieve(lineItem.price)
      totalAmount += price.unit_amount! * (lineItem.quantity || 1)
    }
  }

  // Calculate platform fee (12% of total)
  // Stripe will automatically deduct processing fees before calculating this percentage
  const applicationFeeAmount = Math.round(
    totalAmount * (COMMISSION_CONFIG.PLATFORM_PERCENTAGE / 100),
  )

  return {
    totalAmount,
    applicationFeeAmount, // Platform receives 12%
    // Trainer receives remainder automatically via Stripe Connect
    // Stripe handles all fee calculations and transfers
  }
}

/**
 * Creates payment intent data with revenue sharing configuration
 * Stripe handles all fee calculations and transfers automatically
 */
export function createPaymentIntentData(
  payout: PayoutDestination,
  revenue: RevenueCalculation,
  trainerId: string,
): Stripe.Checkout.SessionCreateParams['payment_intent_data'] {
  if (!payout.connectedAccountId || revenue.applicationFeeAmount <= 0) {
    return undefined
  }

  return {
    application_fee_amount: revenue.applicationFeeAmount,
    transfer_data: {
      destination: payout.connectedAccountId,
    },
    metadata: {
      trainerId,
      platformFeePercent: COMMISSION_CONFIG.PLATFORM_PERCENTAGE.toString(),
      payoutDestination: payout.displayName,
      revenueShareApplied: 'true',
    },
  }
}
