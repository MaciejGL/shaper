import Stripe from 'stripe'

/**
 * Handle subscription resumed webhook
 *
 * This fires when a subscription resumes (pause_collection ends or is removed).
 * Since Stripe is our source of truth for pause state, we only log for monitoring.
 */
export async function handleSubscriptionResumed(
  subscription: Stripe.Subscription,
) {
  console.info(`[WEBHOOK] Subscription ${subscription.id} resumed`)
}
