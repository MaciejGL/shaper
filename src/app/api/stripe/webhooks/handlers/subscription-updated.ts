import Stripe from 'stripe'

import { SubscriptionStatus } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'

export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
) {
  try {
    const status = mapStripeStatusToSubscriptionStatus(subscription.status)

    // Use subscription's current_period_end from items data
    const endDate = new Date(
      subscription.items.data[0].current_period_end * 1000,
    )

    await prisma.userSubscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status,
        endDate,
      },
    })

    console.info(`✅ Subscription ${subscription.id} updated to ${status}`)
  } catch (error) {
    console.error('Error handling subscription updated:', error)
  }
}

function mapStripeStatusToSubscriptionStatus(
  stripeStatus: string,
): SubscriptionStatus {
  switch (stripeStatus) {
    case 'active':
      return SubscriptionStatus.ACTIVE
    case 'canceled':
      return SubscriptionStatus.CANCELLED
    case 'past_due':
      return SubscriptionStatus.PENDING
    default:
      return SubscriptionStatus.ACTIVE
  }
}
