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
  priceId: string,
): Promise<PricingInfo | null> {
  try {
    const price = await stripe.prices.retrieve(priceId)

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
  priceIds: string[],
): Promise<Record<string, PricingInfo | null>> {
  const results: Record<string, PricingInfo | null> = {}

  // Process in batches to avoid rate limits
  const batchSize = 10
  for (let i = 0; i < priceIds.length; i += batchSize) {
    const batch = priceIds.slice(i, i + batchSize)
    const batchPromises = batch.map(async (priceId) => {
      const pricing = await getStripePricingInfo(priceId)
      return { priceId, pricing }
    })

    const batchResults = await Promise.all(batchPromises)
    batchResults.forEach(({ priceId, pricing }) => {
      results[priceId] = pricing
    })
  }

  return results
}
