import Stripe from 'stripe'

import {
  Prisma,
  SubscriptionStatus,
  UserSubscription,
} from '@/generated/prisma/client'
import { prisma } from '@/lib/db'

export async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = invoice.id

    if (subscriptionId) {
      const subscription = await findSubscriptionById(subscriptionId)

      if (subscription) {
        await updateSubscriptionAfterPayment(subscription, invoice)
        console.info(`✅ Payment processed for subscription ${subscriptionId}`)
      }
    }

    // TODO: Send confirmation email to user
    // TODO: Track revenue metrics
  } catch (error) {
    console.error('Error handling payment succeeded:', error)
  }
}

async function findSubscriptionById(stripeSubscriptionId: string) {
  return await prisma.userSubscription.findFirst({
    where: { stripeSubscriptionId },
  })
}

async function updateSubscriptionAfterPayment(
  subscription: UserSubscription,
  invoice: Stripe.Invoice,
) {
  // Prepare update data
  const updateData: Prisma.UserSubscriptionUpdateInput = {
    status: SubscriptionStatus.ACTIVE,

    // Clear grace period and reset retry count
    isInGracePeriod: false,
    gracePeriodEnd: null,
    failedPaymentRetries: 0,
    lastPaymentAttempt: new Date(),
  }

  // DON'T update endDate for trial subscriptions
  // Trial invoice period_end is the same as period_start (setup date)
  // The subscription.created webhook already set the correct trial endDate
  const invoicePeriodEnd = invoice.period_end
  if (!subscription.isTrialActive && invoicePeriodEnd) {
    updateData.endDate = new Date(invoicePeriodEnd * 1000)
  }

  await prisma.userSubscription.update({
    where: { id: subscription.id },
    data: updateData,
  })
}
