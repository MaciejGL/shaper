import Stripe from 'stripe'

import { prisma } from '@/lib/db'
import {
  ServerEvent,
  captureServerEvent,
  captureServerException,
} from '@/lib/posthog-server'

/**
 * Handle subscription resumed webhook
 *
 * This fires when a subscription resumes (pause_collection ends or is removed).
 * Since Stripe is our source of truth for pause state, we only log for monitoring.
 */
export async function handleSubscriptionResumed(
  subscription: Stripe.Subscription,
) {
  try {
    console.info(`[WEBHOOK] Subscription ${subscription.id} resumed`)

    // Find user for tracking
    const dbSubscription = await prisma.userSubscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
      select: { userId: true, package: { select: { name: true } } },
    })

    if (dbSubscription) {
      captureServerEvent({
        distinctId: dbSubscription.userId,
        event: ServerEvent.SUBSCRIPTION_RESUMED,
        properties: {
          stripeSubscriptionId: subscription.id,
          packageName: dbSubscription.package?.name,
        },
      })
    }
  } catch (error) {
    console.error('Error handling subscription resumed:', error)
    const err = error instanceof Error ? error : new Error(String(error))
    captureServerException(err, undefined, {
      webhook: 'subscription-resumed',
      stripeSubscriptionId: subscription.id,
    })
  }
}
