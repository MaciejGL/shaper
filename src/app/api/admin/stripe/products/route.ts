import { NextResponse } from 'next/server'
import Stripe from 'stripe'

import { isAdminUser } from '@/lib/admin-auth'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

// GET /api/admin/stripe/products - Fetch all Stripe products with prices
export async function GET() {
  try {
    // Check admin authorization
    if (!(await isAdminUser())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Fetch all products from Stripe
    const products = await stripe.products.list({
      limit: 100,
      expand: ['data.default_price'],
    })

    // Fetch prices for each product
    const productsWithPrices = await Promise.all(
      products.data.map(async (product) => {
        const prices = await stripe.prices.list({
          product: product.id,
          active: true,
        })

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          active: product.active,
          metadata: product.metadata,
          created: product.created,
          updated: product.updated,
          prices: prices.data.map((price) => ({
            id: price.id,
            currency: price.currency,
            unit_amount: price.unit_amount,
            recurring: price.recurring,
            type: price.type,
            active: price.active,
          })),
        }
      }),
    )

    return NextResponse.json({
      products: productsWithPrices,
      count: productsWithPrices.length,
    })
  } catch (error) {
    console.error('Error fetching Stripe products:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch Stripe products' },
      { status: 500 },
    )
  }
}
