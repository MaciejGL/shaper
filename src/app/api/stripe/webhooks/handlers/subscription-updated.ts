import Stripe from 'stripe'

import { SubscriptionStatus } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import {
  ServerEvent,
  captureServerEvent,
  captureServerException,
} from '@/lib/posthog-server'
import {
  STRIPE_LOOKUP_KEYS,
  resolvePriceIdToLookupKey,
} from '@/lib/stripe/lookup-keys'

type StripeSubscriptionWithPeriod = Stripe.Subscription & {
  current_period_end?: number | null
}

export async function handleSubscriptionUpdated(
  subscription: StripeSubscriptionWithPeriod,
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

    // Check if subscription is cancelled but still active
    // For trials: cancel_at is set to trial end
    // For paid: cancel_at_period_end is true
    const cancelledButActive = !!(
      subscription.cancel_at || subscription.cancel_at_period_end
    )
    const isStillActive =
      subscription.status === 'active' || subscription.status === 'trialing'

    const status =
      cancelledButActive && isStillActive
        ? SubscriptionStatus.CANCELLED_ACTIVE
        : mapStripeStatusToSubscriptionStatus(subscription.status)

    const currentPeriodEnd = subscription.current_period_end
    const endDate = currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null
    const endDateUpdate = endDate ? { endDate } : {}

    if (!endDate) {
      console.warn(
        `[subscription-updated] Missing current_period_end for ${subscription.id}; updating status without endDate`,
      )
    }

    // Detect plan change using lookup keys (not price IDs) for reliability
    // This prevents accidental switches during pause_collection or other non-price updates
    const currentLookupKey = dbSubscription.package.stripeLookupKey
    const subscriptionItem = subscription.items.data[0]

    // Get new lookup key: prefer inline lookup_key, fallback to API resolution
    let newLookupKey: string | null = subscriptionItem?.price.lookup_key || null
    if (!newLookupKey && subscriptionItem?.price.id) {
      newLookupKey = await resolvePriceIdToLookupKey(subscriptionItem.price.id)
    }

    // Determine if this is a real plan switch (lookup keys differ AND new key is valid)
    const isPlanSwitch =
      newLookupKey && currentLookupKey && newLookupKey !== currentLookupKey

    if (isPlanSwitch) {
      // Only query with a concrete lookup key - never with undefined
      const newPackage = await prisma.packageTemplate.findFirst({
        where: { stripeLookupKey: newLookupKey },
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
            ...endDateUpdate,
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
      } else {
        console.warn(
          `[subscription-updated] Plan switch detected but no package found for lookup key: ${newLookupKey}`,
        )
      }
    } else if (!newLookupKey && subscriptionItem?.price.id) {
      // Stripe Price has no lookup_key - do not attempt to switch packages
      console.warn(
        `[subscription-updated] Stripe Price ${subscriptionItem.price.id} has no lookup_key; skipping package switch`,
      )
    }

    // No plan change (or couldn't resolve new package), just update status/dates
    await prisma.userSubscription.update({
      where: { id: dbSubscription.id },
      data: { status, ...endDateUpdate },
    })

    console.info(
      `✅ Subscription ${subscription.id} updated to ${status}${
        cancelledButActive ? ' (cancelled but active until end)' : ''
      }`,
    )

    // Track subscription updated event
    const eventType = cancelledButActive
      ? ServerEvent.SUBSCRIPTION_CANCELLED
      : ServerEvent.SUBSCRIPTION_UPDATED
    captureServerEvent({
      distinctId: dbSubscription.userId,
      event: eventType,
      properties: {
        stripeSubscriptionId: subscription.id,
        newStatus: status,
        cancelledButActive,
      },
    })
  } catch (error) {
    console.error('Error handling subscription updated:', error)
    const err = error instanceof Error ? error : new Error(String(error))
    captureServerException(err, undefined, {
      webhook: 'subscription-updated',
      stripeSubscriptionId: subscription.id,
    })
  }
}

function mapStripeStatusToSubscriptionStatus(
  stripeStatus: string,
): SubscriptionStatus {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':
      return SubscriptionStatus.ACTIVE
    case 'canceled':
      return SubscriptionStatus.CANCELLED
    case 'past_due':
      return SubscriptionStatus.PENDING
    default:
      return SubscriptionStatus.ACTIVE
  }
}
