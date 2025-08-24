'use server'

import { stripe } from '@/lib/stripe/stripe'

interface StripePriceData {
  price: {
    id: string
    currency: string
    unit_amount: number
    currency_options?: Record<
      string,
      {
        unit_amount: number
        tax_behavior?: string
      }
    >
    type: string
    recurring?: {
      interval: string
      interval_count: number
    }
    product: string
    active: boolean
    metadata: Record<string, string>
  }
  formatted: {
    usd: string | null
    primary: string
  }
}

function formatCurrency(amount: number | null, currency: string): string {
  if (!amount) return '$0.00'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount / 100) // Convert from cents
}

export async function getStripePriceData(
  priceId: string,
): Promise<StripePriceData | null> {
  try {
    if (!priceId) {
      return null
    }

    // Fetch price with currency options expanded
    const price = await stripe.prices.retrieve(priceId, {
      expand: ['currency_options'],
    })

    return {
      price: {
        id: price.id,
        currency: price.currency,
        unit_amount: price.unit_amount || 0,
        currency_options: price.currency_options as Record<
          string,
          { unit_amount: number; tax_behavior?: string }
        >,
        type: price.type,
        recurring: price.recurring || undefined,
        product:
          typeof price.product === 'string'
            ? price.product
            : price.product?.id || '',
        active: price.active,
        metadata: price.metadata,
      },
      // Helper function to format price for display
      formatted: {
        usd: price.currency_options?.usd
          ? formatCurrency(price.currency_options.usd.unit_amount, 'USD')
          : price.currency === 'usd'
            ? formatCurrency(price.unit_amount, 'USD')
            : null,
        primary: formatCurrency(
          price.unit_amount,
          price.currency.toUpperCase(),
        ),
      },
    }
  } catch (error) {
    console.error('Error fetching Stripe price:', error)
    return null
  }
}
