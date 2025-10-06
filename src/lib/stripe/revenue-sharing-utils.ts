import Stripe from 'stripe'

import { prisma } from '@/lib/db'
import { COMMISSION_CONFIG } from '@/lib/stripe/config'
import { stripe } from '@/lib/stripe/stripe'

// Types for revenue sharing
export type PayoutDestination = {
  connectedAccountId: string | null
  destination: 'team' | 'individual' | 'none'
  displayName: string
  platformFeePercent: number // Custom fee for this team/trainer
}

export type RevenueCalculation = {
  totalAmount: number
  applicationFeeAmount: number
}

/**
 * Determines where trainer payments should be sent (team takes priority)
 * Returns the payout destination AND the custom platform fee for that team/trainer
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
              platformFeePercent: true, // Get custom fee for this team
            },
          },
        },
        take: 1, // Get first active team membership
      },
    },
  })

  // Priority: Team account > Individual trainer account
  const team = trainerWithTeam?.teamMemberships[0]?.team
  if (team?.stripeConnectedAccountId) {
    return {
      connectedAccountId: team.stripeConnectedAccountId,
      destination: 'team',
      displayName: `team:${team.name}`,
      platformFeePercent:
        team.platformFeePercent || COMMISSION_CONFIG.PLATFORM_PERCENTAGE, // Use team's custom fee
    }
  }

  if (trainerWithTeam?.stripeConnectedAccountId) {
    return {
      connectedAccountId: trainerWithTeam?.stripeConnectedAccountId,
      destination: 'individual',
      displayName: 'individual',
      platformFeePercent:
        trainerWithTeam.teamMemberships[0]?.team?.platformFeePercent ||
        COMMISSION_CONFIG.PLATFORM_PERCENTAGE, // Default 11%  for individuals
    }
  }

  return {
    connectedAccountId: null,
    destination: 'none',
    displayName: 'none',
    platformFeePercent: COMMISSION_CONFIG.PLATFORM_PERCENTAGE, // Default if no account
  }
}

/**
 * Calculates revenue split amounts for payment mode (one-time payments)
 * Note: Stripe automatically handles processing fees - we just calculate platform fee
 * @param lineItems - Items being purchased
 * @param platformFeePercent - Custom platform fee percentage for this team/trainer
 */
export async function calculateRevenueSharing(
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  platformFeePercent: number,
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

  // Calculate platform fee using custom percentage for this team
  // Stripe will automatically deduct processing fees before calculating this percentage
  const applicationFeeAmount = Math.round(
    totalAmount * (platformFeePercent / 100),
  )

  return {
    totalAmount,
    applicationFeeAmount, // Platform receives custom %
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
      platformFeePercent: payout.platformFeePercent.toString(), // Use custom fee
      payoutDestination: payout.displayName,
      revenueShareApplied: 'true',
    },
  }
}
