import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

import { SubscriptionStatus } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { COMMISSION_CONFIG } from '@/lib/stripe/config'
import {
  createInPersonDiscountIfEligible,
  createMealTrainingBundleDiscountIfEligible,
} from '@/lib/stripe/discount-utils'
import { STRIPE_LOOKUP_KEYS } from '@/lib/stripe/lookup-keys'
import {
  type PayoutDestination,
  getPayoutDestination,
} from '@/lib/stripe/revenue-sharing-utils'
import { stripe } from '@/lib/stripe/stripe'
import { recordTermsAgreement } from '@/lib/terms-utils'

export async function POST(request: NextRequest) {
  try {
    const { offerToken, clientEmail, successUrl, cancelUrl } =
      await request.json()

    if (!offerToken || !clientEmail) {
      return NextResponse.json(
        { error: 'Offer token and client email are required' },
        { status: 400 },
      )
    }

    // Find and validate the offer with trainer info
    const offer = await prisma.trainerOffer.findUnique({
      where: { token: offerToken },
      include: {
        trainer: { include: { profile: true } },
      },
    })

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }

    // Parse packageSummary and fetch package details
    const packageSummary = offer.packageSummary as
      | {
          packageId: string
          quantity: number
          name: string
        }[]
      | null

    if (!packageSummary || packageSummary.length === 0) {
      return NextResponse.json(
        { error: 'Offer contains no packages' },
        { status: 400 },
      )
    }

    // Fetch actual package data
    const packages = await prisma.packageTemplate.findMany({
      where: {
        id: { in: packageSummary.map((p) => p.packageId) },
      },
    })

    // Create items structure compatible with existing logic
    const offer_items = packageSummary.map((summary) => {
      const packageData = packages.find((p) => p.id === summary.packageId)
      if (!packageData) {
        throw new Error(`Package ${summary.packageId} not found`)
      }
      return {
        packageId: summary.packageId,
        quantity: summary.quantity,
        package: packageData,
      }
    })

    if (offer.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Offer has expired' }, { status: 400 })
    }

    // Allow checkout for PENDING offers, or PROCESSING offers where the user can retry
    if (
      offer.status === 'COMPLETED' ||
      offer.status === 'CANCELLED' ||
      offer.status === 'EXPIRED'
    ) {
      return NextResponse.json(
        { error: 'Offer is no longer available' },
        { status: 400 },
      )
    }

    // If offer is in PROCESSING status, it means a previous checkout is potentially in progress
    // We'll still allow it since the webhook will handle resetting it if the session expires
    if (offer.status === 'PROCESSING') {
      console.info(
        `⚠️ Creating checkout for offer ${offerToken} that is already in PROCESSING status - webhook will handle cleanup if needed`,
      )
    }

    if (offer.clientEmail !== clientEmail) {
      return NextResponse.json(
        { error: 'Email does not match offer' },
        { status: 400 },
      )
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email: clientEmail } })

    if (!user) {
      // Create user account for new client with profile
      user = await prisma.user.create({
        data: {
          email: clientEmail,
          name: clientEmail.split('@')[0], // Temporary name
          role: 'CLIENT',
          profile: {
            create: {
              firstName: '',
              lastName: '',
            },
          },
        },
        include: {
          profile: true,
        },
      })
    }

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: clientEmail,
        metadata: { userId: user.id },
      })
      customerId = customer.id

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      })
    }

    // Validate that all packages in bundle have valid Stripe lookup keys
    for (const item of offer_items) {
      if (!item.package.stripeLookupKey) {
        return NextResponse.json(
          {
            error: `Package "${item.package.name}" is not configured for payments`,
          },
          { status: 400 },
        )
      }
      // Additional validation to ensure lookup key is a valid string
      if (
        typeof item.package.stripeLookupKey !== 'string' ||
        item.package.stripeLookupKey.trim() === ''
      ) {
        return NextResponse.json(
          {
            error: `Package "${item.package.name}" has invalid lookup key: ${item.package.stripeLookupKey}`,
          },
          { status: 400 },
        )
      }
    }

    // Check if Premium Coaching is in the bundle (includes premium access)
    const hasPremiumCoaching = offer_items.some(
      (item) =>
        item.package.stripeLookupKey === STRIPE_LOOKUP_KEYS.PREMIUM_COACHING,
    )

    // Check for existing premium subscriptions and handle proration for monthly
    if (hasPremiumCoaching) {
      const existingPremium = await prisma.userSubscription.findFirst({
        where: {
          userId: user.id,
          status: SubscriptionStatus.ACTIVE,
          package: {
            stripeLookupKey: { in: ['premium_monthly', 'premium_yearly'] },
          },
        },
        include: { package: true },
      })

      if (existingPremium?.stripeSubscriptionId) {
        const isMonthly = existingPremium.package.duration === 'MONTHLY'

        if (isMonthly) {
          // MONTHLY: Modify existing subscription (proration)
          try {
            const existingStripeSubscription =
              await stripe.subscriptions.retrieve(
                existingPremium.stripeSubscriptionId,
              )
            const subscriptionItemId =
              existingStripeSubscription.items.data[0].id

            const coachingPrices = await stripe.prices.list({
              lookup_keys: [STRIPE_LOOKUP_KEYS.PREMIUM_COACHING],
              limit: 1,
            })

            if (coachingPrices.data.length === 0) {
              throw new Error('Coaching price not found')
            }

            const coachingPriceId = coachingPrices.data[0].id

            // Update subscription to coaching with proration
            await stripe.subscriptions.update(
              existingPremium.stripeSubscriptionId,
              {
                items: [{ id: subscriptionItemId, price: coachingPriceId }],
                proration_behavior: 'create_prorations',
                metadata: {
                  trainerId: offer.trainerId,
                  offerToken,
                  switchedFromMonthly: 'true',
                },
              },
            )

            console.info(
              `✅ Modified monthly subscription ${existingPremium.stripeSubscriptionId} to coaching with proration`,
            )

            // Mark offer as completed
            await prisma.trainerOffer.update({
              where: { id: offer.id },
              data: { status: 'COMPLETED', completedAt: new Date() },
            })

            // Return early - subscription.updated webhook will handle DB update
            return NextResponse.json({
              success: true,
              subscriptionId: existingPremium.stripeSubscriptionId,
              message: 'Subscription updated with proration',
              prorated: true,
            })
          } catch (error) {
            console.error('Failed to prorate monthly subscription:', error)
            // Continue with normal checkout if proration fails
          }
        }
        // If yearly, continue with normal checkout - webhook will pause it
      }
    }

    // Filter out standalone premium subscriptions if premium coaching is present
    const checkoutItems = offer_items.filter((item) => {
      const isPremiumSubscription =
        item.package.stripeLookupKey === STRIPE_LOOKUP_KEYS.PREMIUM_MONTHLY ||
        item.package.stripeLookupKey === STRIPE_LOOKUP_KEYS.PREMIUM_YEARLY

      // Exclude premium subscriptions if premium coaching is present (premium access is included)
      return !(isPremiumSubscription && hasPremiumCoaching)
    })

    // Validate we still have items to checkout
    if (checkoutItems.length === 0) {
      return NextResponse.json(
        {
          error:
            'No chargeable items in bundle - all items are included in coaching combo',
        },
        { status: 400 },
      )
    }

    // Analyze payment types based on filtered items
    const paymentTypes = checkoutItems.map((item) => {
      const metadata = (item.package.metadata as Record<string, unknown>) || {}
      return metadata.category === 'trainer_coaching'
        ? 'subscription'
        : 'payment'
    })

    const hasSubscription = paymentTypes.includes('subscription')

    const mode = hasSubscription ? 'subscription' : 'payment'

    // Resolve lookup keys to price IDs for all items
    const lineItems = await Promise.all(
      checkoutItems.map(async (item) => {
        const prices = await stripe.prices.list({
          lookup_keys: [item.package.stripeLookupKey!],
          limit: 1,
        })

        if (prices.data.length === 0) {
          throw new Error(
            `No price found for lookup key: ${item.package.stripeLookupKey}`,
          )
        }

        return {
          price: prices.data[0].id,
          quantity: item.quantity,
        }
      }),
    )

    // Apply discounts based on bundle combinations
    const discounts = []

    // Apply 50% discount to in-person sessions if bundle contains coaching combo
    const inPersonDiscount = await createInPersonDiscountIfEligible(
      checkoutItems,
      hasPremiumCoaching,
      offerToken,
    )
    if (inPersonDiscount) {
      discounts.push(inPersonDiscount)
    }

    // Apply 20% discount to meal+training bundle if both are present
    const mealTrainingDiscount =
      await createMealTrainingBundleDiscountIfEligible(
        checkoutItems,
        offerToken,
      )
    if (mealTrainingDiscount) {
      discounts.push(mealTrainingDiscount)
    }

    // Setup revenue sharing (subscriptions: at checkout, one-time: in webhook)
    let payout: PayoutDestination = {
      connectedAccountId: null,
      destination: 'none',
      displayName: 'none',
      platformFeePercent: COMMISSION_CONFIG.PLATFORM_PERCENTAGE,
    }

    if (offer.trainerId && hasSubscription) {
      payout = await getPayoutDestination(offer.trainerId)
      if (payout.connectedAccountId) {
        console.info(
          `💰 Revenue sharing: ${payout.displayName} → ${payout.platformFeePercent}%`,
        )
      }
    }

    // Build session metadata
    const sessionMetadata = {
      offerToken,
      trainerId: offer.trainerId,
      userId: user.id,
      clientEmail,
      source: 'trainer_offer',
      bundleItemCount: checkoutItems.length.toString(),
      originalItemCount: offer_items.length.toString(),
      hasCoachingCombo: hasPremiumCoaching.toString(),
      inPersonDiscount: hasPremiumCoaching ? '50' : '0',
      hasDiscountCoupon: (
        hasPremiumCoaching && discounts.length > 0
      ).toString(),
      bundlePackages: checkoutItems
        .slice(0, 3)
        .map((item) => item.package.name)
        .join(', '),
      revenueShareEnabled: (!!payout.connectedAccountId).toString(),
      payoutDestination: payout.displayName,
      platformFeePercent: payout.platformFeePercent.toString(),
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode,
      ...(discounts.length > 0 && { discounts }),
      ...(discounts.length === 0 && { allow_promotion_codes: true }),
      success_url:
        successUrl ||
        `${process.env.NEXT_PUBLIC_APP_URL}/offer/${offerToken}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/offer/${offerToken}`,
      metadata: sessionMetadata,
      // Subscription revenue sharing - uses application_fee_percent (works with any currency)
      ...(mode === 'subscription' &&
        payout.connectedAccountId && {
          subscription_data: {
            trial_period_days: undefined,
            application_fee_percent: payout.platformFeePercent,
            transfer_data: {
              destination: payout.connectedAccountId,
            },
            metadata: sessionMetadata,
          },
        }),
      // NOTE: One-time payment revenue sharing is handled in webhook
      // Reason: payment_intent_data.application_fee_amount requires fixed amount (locks to USD)
      // Multi-currency requires knowing actual charged currency (available in webhook)
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
      client_reference_id: offerToken,
    })

    // Mark offer as processing to prevent double payments
    await prisma.trainerOffer.update({
      where: { id: offer.id },
      data: { status: 'PROCESSING' },
    })

    try {
      await recordTermsAgreement({
        userId: user.id,
        offerId: offer.id,
      })
    } catch (error) {
      console.error('Failed to record terms agreement:', error)
    }

    const bundleDescription =
      checkoutItems.length === 1
        ? `${checkoutItems[0].quantity > 1 ? `${checkoutItems[0].quantity}x ` : ''}${checkoutItems[0].package.name}`
        : `Bundle (${checkoutItems.length} packages)`

    const premiumIncluded =
      hasPremiumCoaching &&
      offer_items.some(
        (item) =>
          item.package.stripeLookupKey === STRIPE_LOOKUP_KEYS.PREMIUM_MONTHLY ||
          item.package.stripeLookupKey === STRIPE_LOOKUP_KEYS.PREMIUM_YEARLY,
      )

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
      mode,
      bundleDescription,
      itemCount: checkoutItems.length,
      originalItemCount: offer_items.length,
      hasCoachingCombo: hasPremiumCoaching,
      premiumIncluded,
      trainerName: offer.trainer.profile?.firstName || offer.trainer.name,
      inPersonDiscount: hasPremiumCoaching ? 50 : 0,
      hasDiscountCoupon: hasPremiumCoaching && discounts.length > 0,
      discountDescription:
        hasPremiumCoaching && discounts.length > 0
          ? '50% off In-Person Sessions'
          : null,
    })
  } catch (error) {
    console.error('Error creating trainer checkout:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Payment error: ${error.message}` },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    )
  }
}
