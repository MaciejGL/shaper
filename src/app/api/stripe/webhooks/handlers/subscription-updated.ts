import Stripe from 'stripe'

import { SubscriptionStatus } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { STRIPE_LOOKUP_KEYS } from '@/lib/stripe/lookup-keys'
import { stripe } from '@/lib/stripe/stripe'

export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
) {
  try {
    const dbSubscription = await prisma.userSubscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
      include: { package: true },
    })

    if (!dbSubscription) {
      console.warn(`Subscription ${subscription.id} not found in DB`)
      return
    }

    const status = mapStripeStatusToSubscriptionStatus(subscription.status)
    const endDate = new Date(
      subscription.items.data[0].current_period_end * 1000,
    )

    // Check if price changed (monthly premium → coaching via proration)
    const newPriceId = subscription.items.data[0]?.price.id
    const currentPrice = await stripe.prices.list({
      lookup_keys: [dbSubscription.package.stripeLookupKey || ''],
      limit: 1,
    })

    const priceDifferent = currentPrice.data[0]?.id !== newPriceId

    if (priceDifferent && newPriceId) {
      // Plan was switched! Find new package
      const newPrice = await stripe.prices.retrieve(newPriceId)
      const newPackage = await prisma.packageTemplate.findFirst({
        where: { stripeLookupKey: newPrice.lookup_key || undefined },
      })

      if (newPackage) {
        console.info(
          `🔄 Plan switched: ${dbSubscription.package.name} → ${newPackage.name}`,
        )

        await prisma.userSubscription.update({
          where: { id: dbSubscription.id },
          data: {
            packageId: newPackage.id,
            stripeLookupKey: newPackage.stripeLookupKey,
            trainerId: newPackage.trainerId || subscription.metadata?.trainerId,
            status,
            endDate,
          },
        })

        // Update user's trainer if switched to coaching
        const switchedToCoaching =
          newPackage.stripeLookupKey === STRIPE_LOOKUP_KEYS.PREMIUM_COACHING
        const trainerId =
          subscription.metadata?.trainerId || newPackage.trainerId

        if (switchedToCoaching && trainerId) {
          await prisma.user.update({
            where: { id: dbSubscription.userId },
            data: { trainerId },
          })
        }

        return
      }
    }

    // No plan change, just update status/dates
    await prisma.userSubscription.update({
      where: { id: dbSubscription.id },
      data: { status, endDate },
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
