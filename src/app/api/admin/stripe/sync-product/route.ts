import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

import { isAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

// POST /api/admin/stripe/sync-product - Manually sync a Stripe product to database
export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
    if (!(await isAdminUser())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 },
      )
    }

    // Fetch product from Stripe
    const product = await stripe.products.retrieve(productId)

    // Fetch prices for the product
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
    })

    // Validate metadata
    if (!product.metadata?.packageType || !product.metadata?.duration) {
      return NextResponse.json(
        {
          error: 'Product missing required metadata: packageType and duration',
          metadata: product.metadata,
        },
        { status: 400 },
      )
    }

    const duration = product.metadata.duration as 'MONTHLY' | 'YEARLY'
    if (!['MONTHLY', 'YEARLY'].includes(duration)) {
      return NextResponse.json(
        { error: 'Invalid duration in metadata. Must be MONTHLY or YEARLY' },
        { status: 400 },
      )
    }

    // Check if this is a test product
    const isTestProduct = product.metadata.env === 'test'
    const productNamePrefix = isTestProduct ? '[TEST] ' : ''

    // Check if package template already exists
    const existingPackage = await prisma.packageTemplate.findFirst({
      where: { stripeProductId: product.id },
    })

    // Handle multi-currency pricing (single price ID with multiple currencies)
    const priceMapping: {
      stripePriceIdNOK?: string
      stripePriceIdEUR?: string
      stripePriceIdUSD?: string
      priceNOK?: number
    } = {}

    if (prices.data.length === 1) {
      // Multi-currency price (one price ID for all currencies) ✅ YOUR SETUP
      const price = prices.data[0]
      priceMapping.stripePriceIdNOK = price.id
      priceMapping.stripePriceIdEUR = price.id
      priceMapping.stripePriceIdUSD = price.id
      priceMapping.priceNOK = price.unit_amount || 0
    } else {
      // Legacy approach (separate price IDs for each currency)
      prices.data.forEach((price) => {
        switch (price.currency.toUpperCase()) {
          case 'NOK':
            priceMapping.stripePriceIdNOK = price.id
            priceMapping.priceNOK = price.unit_amount || 0
            break
          case 'EUR':
            priceMapping.stripePriceIdEUR = price.id
            break
          case 'USD':
            priceMapping.stripePriceIdUSD = price.id
            break
        }
      })
    }

    let packageTemplate

    // Prepare description with test indicator
    const description = isTestProduct
      ? `[TEST ENVIRONMENT] ${product.description || 'Test product for development'}`
      : product.description || null

    if (existingPackage) {
      // Update existing package
      packageTemplate = await prisma.packageTemplate.update({
        where: { id: existingPackage.id },
        data: {
          name: `${productNamePrefix}${product.name}`,
          description,
          isActive: product.active,
          ...priceMapping,
        },
      })
    } else {
      // Create new package
      packageTemplate = await prisma.packageTemplate.create({
        data: {
          name: `${productNamePrefix}${product.name}`,
          description,
          priceNOK:
            priceMapping.priceNOK || (duration === 'MONTHLY' ? 14900 : 149000),
          duration,
          stripeProductId: product.id,
          isActive: product.active,
          ...priceMapping,
        },
      })
    }

    return NextResponse.json({
      success: true,
      action: existingPackage ? 'updated' : 'created',
      isTestProduct,
      packageTemplate: {
        id: packageTemplate.id,
        name: packageTemplate.name,
        duration: packageTemplate.duration,
        stripeProductId: packageTemplate.stripeProductId,
      },
      prices: prices.data.length,
      priceMapping,
      metadata: {
        packageType: product.metadata.packageType,
        duration: product.metadata.duration,
        env: product.metadata.env || 'production',
      },
    })
  } catch (error) {
    console.error('Error syncing product:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to sync product' },
      { status: 500 },
    )
  }
}
