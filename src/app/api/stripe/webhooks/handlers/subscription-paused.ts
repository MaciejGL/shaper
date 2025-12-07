import Stripe from 'stripe'

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
  const resumesAt = subscription.pause_collection?.resumes_at
    ? new Date(subscription.pause_collection.resumes_at * 1000).toISOString()
    : 'unknown'

  console.info(
    `[WEBHOOK] Subscription ${subscription.id} paused, resumes at: ${resumesAt}`,
  )
}
