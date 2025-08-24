import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

import { isAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { stripe } from '@/lib/stripe/stripe'

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

    // Check if product is archived
    if (!product.active) {
      return NextResponse.json(
        {
          error:
            'Cannot sync archived products. Please restore the product in Stripe first.',
        },
        { status: 400 },
      )
    }

    // Fetch prices for the product
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
    })

    // Determine product type and validate metadata
    const isTrainerService =
      product.metadata?.category === 'trainer_service' ||
      product.metadata?.category === 'trainer_coaching'
    const isPremiumProduct = product.metadata?.category === 'platform_premium'

    let duration: 'MONTHLY' | 'YEARLY' = 'MONTHLY' // Default duration
    let productCategory = 'general'

    if (isTrainerService) {
      // Trainer service products - validate service metadata
      if (!product.metadata?.service_type) {
        return NextResponse.json(
          {
            error:
              'Trainer service product missing required metadata: service_type',
            metadata: product.metadata,
          },
          { status: 400 },
        )
      }

      productCategory = product.metadata.category || 'trainer_service'

      // Set duration based on service type and price type
      const price = prices.data[0]
      if (price?.type === 'recurring') {
        duration = price.recurring?.interval === 'year' ? 'YEARLY' : 'MONTHLY'
      } else {
        duration = 'MONTHLY' // One-time products default to monthly for database compatibility
      }
    } else if (isPremiumProduct) {
      // Premium products - support both old and new metadata structures
      const isNewPremiumStructure =
        product.metadata?.category === 'platform_premium'

      if (isNewPremiumStructure) {
        // New structure: category = platform_premium + duration
        if (!product.metadata?.duration) {
          return NextResponse.json(
            {
              error:
                'Platform premium product missing required metadata: duration',
              metadata: product.metadata,
            },
            { status: 400 },
          )
        }
        productCategory = 'platform_premium'
      }

      duration = product.metadata.duration as 'MONTHLY' | 'YEARLY'
      if (!['MONTHLY', 'YEARLY'].includes(duration)) {
        return NextResponse.json(
          { error: 'Invalid duration in metadata. Must be MONTHLY or YEARLY' },
          { status: 400 },
        )
      }
    } else {
      // Unknown product type
      return NextResponse.json(
        {
          error:
            'Product must have either trainer service metadata (category + service_type) or premium metadata (packageType + duration OR category=platform_premium + duration)',
          metadata: product.metadata,
        },
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

    // Use the first active price (single price ID approach)
    const stripePriceId = prices.data.length > 0 ? prices.data[0].id : null

    if (!stripePriceId) {
      return NextResponse.json(
        { error: 'No active prices found for this product' },
        { status: 400 },
      )
    }

    let packageTemplate

    // Prepare description with test indicator
    const description = isTestProduct
      ? `[TEST ENVIRONMENT] ${product.description || 'Test product for development'}`
      : product.description || null

    // Prepare package data
    const packageData = {
      name: `${productNamePrefix}${product.name}`,
      description,
      isActive: product.active,
      stripePriceId,
      metadata: product.metadata, // Store all Stripe metadata
    }

    if (existingPackage) {
      // Update existing package
      packageTemplate = await prisma.packageTemplate.update({
        where: { id: existingPackage.id },
        data: packageData,
      })
    } else {
      // Create new package
      packageTemplate = await prisma.packageTemplate.create({
        data: {
          ...packageData,
          duration,
          stripeProductId: product.id,
        },
      })

      // Create associated services for trainer products
    }

    return NextResponse.json({
      success: true,
      action: existingPackage ? 'updated' : 'created',
      isTestProduct,
      productType: isTrainerService ? 'trainer_service' : 'premium',
      productCategory,
      packageTemplate: {
        id: packageTemplate.id,
        name: packageTemplate.name,
        duration: packageTemplate.duration,
        stripeProductId: packageTemplate.stripeProductId,
        stripePriceId: packageTemplate.stripePriceId,
        metadata: packageTemplate.metadata,
      },
      prices: prices.data.length,
      metadata: product.metadata,
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
