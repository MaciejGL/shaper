/**
 * Centralized Stripe Lookup Keys Management
 *
 * This is the single source of truth for all Stripe price lookup keys.
 * Lookup keys allow us to change prices in Stripe dashboard without code deployment.
 */
import { stripe } from './stripe'

// Centralized lookup keys - single source of truth
export const STRIPE_LOOKUP_KEYS = {
  // Platform subscriptions
  PREMIUM_MONTHLY: 'premium_monthly',
  PREMIUM_YEARLY: 'premium_yearly',

  // Trainer recurring services
  PREMIUM_COACHING: 'premium_coaching',

  // Trainer one-time services
  NUTRITION_PLAN: 'nutrition_plan',
  WORKOUT_PLAN: 'workout_plan',

  // Add-on services
  IN_PERSON_SESSION: 'in_person_session',
} as const

// Premium lookup keys that grant premium access
const PREMIUM_LOOKUP_KEYS = [
  STRIPE_LOOKUP_KEYS.PREMIUM_MONTHLY,
  STRIPE_LOOKUP_KEYS.PREMIUM_YEARLY,
  STRIPE_LOOKUP_KEYS.PREMIUM_COACHING,
] as const

/**
 * Check if a lookup key grants premium access
 */
export function isPremiumLookupKey(lookupKey: string): boolean {
  return PREMIUM_LOOKUP_KEYS.includes(
    lookupKey as (typeof PREMIUM_LOOKUP_KEYS)[number],
  )
}

/**
 * Get all premium lookup keys
 */
export function getPremiumLookupKeys(): string[] {
  return [...PREMIUM_LOOKUP_KEYS]
}

/**
 * Resolve lookup key to Stripe Price object
 * Uses Stripe API to fetch the current price for a lookup key
 */
export async function resolveLookupKeyToPrice(
  lookupKey: string,
): Promise<string | null> {
  try {
    const prices = await stripe.prices.list({
      lookup_keys: [lookupKey],
      limit: 1,
    })

    if (prices.data.length === 0) {
      console.warn(`No price found for lookup key: ${lookupKey}`)
      return null
    }

    return prices.data[0].id
  } catch (error) {
    console.error(`Error resolving lookup key ${lookupKey}:`, error)
    return null
  }
}

/**
 * Resolve price ID back to lookup key
 * Used in webhooks to match incoming price IDs to our packages
 */
export async function resolvePriceIdToLookupKey(
  priceId: string,
): Promise<string | null> {
  try {
    const price = await stripe.prices.retrieve(priceId)

    // Stripe prices can have a lookup_key field
    if (price.lookup_key) {
      return price.lookup_key
    }

    // If no lookup key on the price, check if it's in our known keys
    // by comparing price IDs (fallback for migration period)
    console.warn(
      `Price ${priceId} has no lookup_key. This should not happen after migration.`,
    )
    return null
  } catch (error) {
    console.error(`Error resolving price ID ${priceId} to lookup key:`, error)
    return null
  }
}

/**
 * Batch resolve multiple lookup keys to price IDs
 */
export async function resolveLookupKeysToPrices(
  lookupKeys: string[],
): Promise<Record<string, string | null>> {
  const results: Record<string, string | null> = {}

  await Promise.all(
    lookupKeys.map(async (key) => {
      results[key] = await resolveLookupKeyToPrice(key)
    }),
  )

  return results
}
