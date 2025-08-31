import Stripe from 'stripe'

import { prisma } from '@/lib/db'
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
  trainerPayoutAmount: number
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
 * Calculates revenue split amounts (10% platform / 90% trainer)
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

  const applicationFeeAmount = Math.round(totalAmount * 0.1) // 10% platform fee
  const trainerPayoutAmount = totalAmount - applicationFeeAmount // 90% to trainer/team

  return {
    totalAmount,
    applicationFeeAmount,
    trainerPayoutAmount,
  }
}

/**
 * Creates payment intent data with revenue sharing configuration
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
    on_behalf_of: payout.connectedAccountId,
    transfer_data: {
      destination: payout.connectedAccountId,
    },
    metadata: {
      trainerId,
      platformFeeAmount: revenue.applicationFeeAmount.toString(),
      trainerPayoutAmount: revenue.trainerPayoutAmount.toString(),
      revenueShareApplied: 'true',
      payoutDestination: payout.displayName,
    },
  }
}
