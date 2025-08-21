import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

import { SubscriptionStatus } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { SUBSCRIPTION_CONFIG } from '@/lib/stripe/config'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, packageId, returnUrl, cancelUrl } = body

    if (!userId || !packageId) {
      return NextResponse.json(
        { error: 'User ID and Package ID are required' },
        { status: 400 },
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        stripeCustomerId: true,
      },
    })

    if (!user || !user.email) {
      return NextResponse.json(
        { error: 'User not found or missing email' },
        { status: 404 },
      )
    }

    // Find package template
    const packageTemplate = await prisma.packageTemplate.findUnique({
      where: { id: packageId },
      select: {
        id: true,
        name: true,
        description: true,
        duration: true,
        stripePriceIdNOK: true,
        stripePriceIdEUR: true,
        stripePriceIdUSD: true,
        trainerId: true,
      },
    })

    if (!packageTemplate) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    // Check if package has Stripe configuration
    if (
      !packageTemplate.stripePriceIdUSD &&
      !packageTemplate.stripePriceIdEUR &&
      !packageTemplate.stripePriceIdNOK
    ) {
      return NextResponse.json(
        { error: 'Package is not configured for Stripe payments' },
        { status: 400 },
      )
    }

    // Check if user already has an active subscription for this package
    const existingSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId,
        packageId,
        status: {
          in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING],
        },
      },
    })

    if (existingSubscription) {
      return NextResponse.json(
        {
          error: 'You already have an active subscription for this package',
          existingSubscription: {
            id: existingSubscription.id,
            status: existingSubscription.status,
            endDate: existingSubscription.endDate,
          },
        },
        { status: 400 },
      )
    }

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      })
      customerId = customer.id

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      })
    }

    // Determine trial eligibility
    const hasUsedTrial = await prisma.userSubscription.findFirst({
      where: {
        userId,
        packageId,
        OR: [{ isTrialActive: true }, { trialStart: { not: null } }],
      },
    })

    // Determine currency and price ID (default to USD for now)
    // TODO: Add currency detection based on user location
    const priceId =
      packageTemplate.stripePriceIdUSD ||
      packageTemplate.stripePriceIdEUR ||
      packageTemplate.stripePriceIdNOK

    if (!priceId) {
      return NextResponse.json(
        { error: 'No valid price ID found for this package' },
        { status: 400 },
      )
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: `${returnUrl || process.env.NEXT_PUBLIC_APP_URL}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${cancelUrl || process.env.NEXT_PUBLIC_APP_URL}?cancelled=true`,
      metadata: {
        userId,
        packageId,
        packageName: packageTemplate.name,
        isNewSubscription: 'true',
      },
      subscription_data: {
        trial_period_days: hasUsedTrial
          ? undefined
          : SUBSCRIPTION_CONFIG.TRIAL_PERIOD_DAYS,
        metadata: {
          userId,
          packageId,
          packageName: packageTemplate.name,
          trainerIdAssigned: packageTemplate.trainerId || '',
        },
      },
      // Customize the checkout experience
      billing_address_collection: 'auto',
      payment_method_collection: 'always',
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
    })

    console.info(
      `🛒 Checkout session created for user ${userId}, package ${packageId}${hasUsedTrial ? ' (no trial)' : ` (${SUBSCRIPTION_CONFIG.TRIAL_PERIOD_DAYS}-day trial)`}`,
    )

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
      packageName: packageTemplate.name,
      duration: packageTemplate.duration,
      hasTrialPeriod: !hasUsedTrial,
      trialDays: hasUsedTrial ? 0 : SUBSCRIPTION_CONFIG.TRIAL_PERIOD_DAYS,
      message: hasUsedTrial
        ? `Redirecting to payment for ${packageTemplate.name}`
        : `Redirecting to payment - ${SUBSCRIPTION_CONFIG.TRIAL_PERIOD_DAYS} day trial included!`,
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    )
  }
}
