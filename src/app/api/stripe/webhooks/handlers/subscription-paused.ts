import Stripe from 'stripe'

import { prisma } from '@/lib/db'
import {
  ServerEvent,
  captureServerEvent,
  captureServerException,
} from '@/lib/posthog-server'

/**
 * Handle subscription paused webhook
 *
 * This fires when a subscription is paused (via pause_collection).
 * Since Stripe is our source of truth for pause state, we only log for monitoring.
 * Quota tracking is handled when the user initiates the pause via our API.
 */
export async function handleSubscriptionPaused(
  subscription: Stripe.Subscription,
) {
  try {
    const resumesAt = subscription.pause_collection?.resumes_at
      ? new Date(subscription.pause_collection.resumes_at * 1000).toISOString()
      : 'unknown'

    console.info(
      `[WEBHOOK] Subscription ${subscription.id} paused, resumes at: ${resumesAt}`,
    )

    // Find user for tracking
    const dbSubscription = await prisma.userSubscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
      select: { userId: true, package: { select: { name: true } } },
    })

    if (dbSubscription) {
      captureServerEvent({
        distinctId: dbSubscription.userId,
        event: ServerEvent.SUBSCRIPTION_PAUSED,
        properties: {
          stripeSubscriptionId: subscription.id,
          packageName: dbSubscription.package?.name,
          resumesAt,
        },
      })
    }
  } catch (error) {
    console.error('Error handling subscription paused:', error)
    const err = error instanceof Error ? error : new Error(String(error))
    captureServerException(err, undefined, {
      webhook: 'subscription-paused',
      stripeSubscriptionId: subscription.id,
    })
  }
}
