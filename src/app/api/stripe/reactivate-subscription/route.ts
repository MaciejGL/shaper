import { SubscriptionStatus } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

import { prisma } from '@/lib/db'
import { SUBSCRIPTION_CONFIG } from '@/lib/stripe/config'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, packageId, returnUrl } = body

    if (!userId || !packageId) {
      return NextResponse.json(
        { error: 'User ID and Package ID are required' },
        { status: 400 },
      )
    }

    // Find user with Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        stripeCustomerId: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find the package template
    const packageTemplate = await prisma.packageTemplate.findUnique({
      where: { id: packageId },
      select: {
        id: true,
        name: true,
        stripePriceIdNOK: true,
        stripePriceIdEUR: true,
        stripePriceIdUSD: true,
        duration: true,
        trainerId: true,
      },
    })

    if (!packageTemplate || !packageTemplate.stripePriceIdUSD) {
      return NextResponse.json(
        { error: 'Package not found or not properly configured' },
        { status: 404 },
      )
    }

    // Check if user has a cancelled subscription for this package
    const existingSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId,
        packageId,
        status: {
          in: [SubscriptionStatus.CANCELLED, SubscriptionStatus.EXPIRED],
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!existingSubscription) {
      return NextResponse.json(
        {
          error:
            'No cancelled subscription found for this package. Please create a new subscription instead.',
        },
        { status: 400 },
      )
    }

    // Check if user already has an active subscription for this package
    const activeSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId,
        packageId,
        status: {
          in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING],
        },
      },
    })

    if (activeSubscription) {
      return NextResponse.json(
        {
          error: 'You already have an active subscription for this package.',
        },
        { status: 400 },
      )
    }

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
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

    // Determine trial eligibility - no trial for reactivations
    const hasUsedTrial = await prisma.userSubscription.findFirst({
      where: {
        userId,
        packageId,
        isTrialActive: true,
      },
    })

    // Create Stripe checkout session for reactivation
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: packageTemplate.stripePriceIdUSD, // Default to USD, can be enhanced for multi-currency
          quantity: 1,
        },
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: `${returnUrl || process.env.NEXT_PUBLIC_APP_URL}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl || process.env.NEXT_PUBLIC_APP_URL}?cancelled=true`,
      metadata: {
        userId,
        packageId,
        isReactivation: 'true',
        previousSubscriptionId: existingSubscription.id,
      },
      subscription_data: {
        trial_period_days: hasUsedTrial
          ? undefined
          : SUBSCRIPTION_CONFIG.TRIAL_PERIOD_DAYS,
        metadata: {
          userId,
          packageId,
          isReactivation: 'true',
        },
      },
    })

    // Log the reactivation attempt
    console.info(
      `🔄 Reactivation checkout created for user ${userId}, package ${packageId}`,
    )

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
      message: hasUsedTrial
        ? 'Redirecting to payment - no trial available for reactivation'
        : `Redirecting to payment - ${SUBSCRIPTION_CONFIG.TRIAL_PERIOD_DAYS} day trial included`,
    })
  } catch (error) {
    console.error('Error creating reactivation checkout:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to create reactivation checkout session' },
      { status: 500 },
    )
  }
}
