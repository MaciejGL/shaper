import { stripe } from './stripe'

interface PricingInfo {
  amount: number
  currency: string
  type: 'one-time' | 'subscription'
  recurring?: {
    interval: string
    interval_count: number
  } | null
}

export async function getStripePricingInfo(
  lookupKey: string,
): Promise<PricingInfo | null> {
  try {
    // Fetch price by lookup key
    const prices = await stripe.prices.list({
      lookup_keys: [lookupKey],
      limit: 1,
    })

    if (prices.data.length === 0) {
      console.warn(`No price found for lookup key: ${lookupKey}`)
      return null
    }

    const price = prices.data[0]

    return {
      amount: price.unit_amount || 0,
      currency: price.currency.toUpperCase(),
      type: price.type === 'recurring' ? 'subscription' : 'one-time',
      recurring: price.recurring
        ? {
            interval: price.recurring.interval,
            interval_count: price.recurring.interval_count,
          }
        : null,
    }
  } catch (error) {
    console.error('Error fetching Stripe price:', error)
    return null
  }
}

export async function getMultipleStripePrices(
  lookupKeys: string[],
): Promise<Record<string, PricingInfo | null>> {
  const results: Record<string, PricingInfo | null> = {}

  // Process in batches to avoid rate limits
  const batchSize = 10
  for (let i = 0; i < lookupKeys.length; i += batchSize) {
    const batch = lookupKeys.slice(i, i + batchSize)
    const batchPromises = batch.map(async (lookupKey) => {
      const pricing = await getStripePricingInfo(lookupKey)
      return { lookupKey, pricing }
    })

    const batchResults = await Promise.all(batchPromises)
    batchResults.forEach(({ lookupKey, pricing }) => {
      results[lookupKey] = pricing
    })
  }

  return results
}
