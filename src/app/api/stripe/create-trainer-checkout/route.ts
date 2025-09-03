import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

import { prisma } from '@/lib/db'
import { COMMISSION_CONFIG } from '@/lib/stripe/config'
import { createInPersonDiscountIfEligible } from '@/lib/stripe/discount-utils'
import {
  type PayoutDestination,
  type RevenueCalculation,
  calculateRevenueSharing,
  createPaymentIntentData,
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

    // Validate that all packages in bundle have valid Stripe price IDs
    for (const item of offer_items) {
      if (!item.package.stripePriceId) {
        return NextResponse.json(
          {
            error: `Package "${item.package.name}" is not configured for payments`,
          },
          { status: 400 },
        )
      }
      // Additional validation to ensure price ID is a valid string
      if (
        typeof item.package.stripePriceId !== 'string' ||
        item.package.stripePriceId.trim() === ''
      ) {
        return NextResponse.json(
          {
            error: `Package "${item.package.name}" has invalid price ID: ${item.package.stripePriceId}`,
          },
          { status: 400 },
        )
      }
    }

    // Check if Complete Coaching Combo is in the bundle
    const hasCoachingCombo = offer_items.some((item) => {
      const packageName = item.package.name?.toLowerCase() || ''
      return packageName.includes('coaching') && packageName.includes('combo')
    })

    // Filter out premium subscriptions if coaching combo is present (premium is included)
    const checkoutItems = offer_items.filter((item) => {
      const packageName = item.package.name?.toLowerCase() || ''
      const isPremium = packageName.includes('premium')

      // Exclude premium if coaching combo is present (premium access is included)
      return !(isPremium && hasCoachingCombo)
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

    // Use original price IDs for all items (enables adaptive pricing)
    const lineItems = checkoutItems.map((item) => ({
      price: item.package.stripePriceId!,
      quantity: item.quantity,
    }))

    // Apply 50% discount to in-person sessions if bundle contains coaching combo
    const discounts = []
    const discount = await createInPersonDiscountIfEligible(
      checkoutItems,
      hasCoachingCombo,
      offerToken,
    )
    if (discount) {
      discounts.push(discount)
    }

    // Setup revenue sharing for trainer payments (payment mode only)
    let payout: PayoutDestination = {
      connectedAccountId: null,
      destination: 'none',
      displayName: 'none',
    }
    let revenue: RevenueCalculation = {
      totalAmount: 0,
      applicationFeeAmount: 0,
      trainerPayoutAmount: 0,
      stripeFeeAmount: 0,
    }

    if (offer.trainerId) {
      payout = await getPayoutDestination(offer.trainerId)

      if (payout.connectedAccountId) {
        revenue = await calculateRevenueSharing(lineItems)
        console.info(
          `💰 Revenue sharing: ${payout.displayName} → Platform: ${revenue.applicationFeeAmount / 100}, Trainer: ${revenue.trainerPayoutAmount / 100}, Stripe fees: ${revenue.stripeFeeAmount / 100}
${JSON.stringify(lineItems, null, 2)}
${JSON.stringify(payout, null, 2)}
${JSON.stringify(revenue, null, 2)}
`,
        )
      }
    }

    // Create checkout session with trainer assignment
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode,
      // Apply bundle discount as coupon (preserves adaptive pricing)
      ...(discounts.length > 0 && { discounts }),
      // Allow promotion codes only if we don't have our own discounts
      ...(discounts.length === 0 && { allow_promotion_codes: true }),
      ...(mode === 'payment' &&
        payout.connectedAccountId && {
          payment_intent_data: createPaymentIntentData(
            payout,
            revenue,
            offer.trainerId,
          ),
        }),
      success_url:
        successUrl ||
        `${process.env.NEXT_PUBLIC_APP_URL}/offer/${offerToken}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/offer/${offerToken}`,
      metadata: {
        offerToken,
        trainerId: offer.trainerId,
        userId: user.id,
        clientEmail,
        source: 'trainer_offer',
        bundleItemCount: checkoutItems.length.toString(),
        originalItemCount: offer_items.length.toString(),
        hasCoachingCombo: hasCoachingCombo.toString(),
        inPersonDiscount: hasCoachingCombo ? '50' : '0',
        hasDiscountCoupon: (
          hasCoachingCombo && discounts.length > 0
        ).toString(),
        // Include first few package names for reference (charged items only)
        bundlePackages: checkoutItems
          .slice(0, 3)
          .map((item) => item.package.name)
          .join(', '),
        // Revenue sharing info
        revenueShareEnabled: (!!payout.connectedAccountId).toString(),
        payoutDestination: payout.displayName,
        platformFeeAmount: revenue.applicationFeeAmount.toString(),
        trainerPayoutAmount: revenue.trainerPayoutAmount.toString(),
        stripeFeeAmount: revenue.stripeFeeAmount.toString(),
      },
      // For subscriptions, include trainer assignment and revenue sharing
      ...(mode === 'subscription' && {
        subscription_data: {
          // Coaching subscriptions should never have trials (trainers need immediate payment)
          trial_period_days: undefined,
          // Add revenue sharing for subscriptions using application_fee_percent
          ...(payout.connectedAccountId && {
            application_fee_percent: COMMISSION_CONFIG.PLATFORM_PERCENTAGE, // 10%
            transfer_data: {
              destination: payout.connectedAccountId,
            },
          }),
          metadata: {
            offerToken,
            trainerId: offer.trainerId,
            userId: user.id,
            source: 'trainer_offer',
            bundleItemCount: checkoutItems.length.toString(),
            hasCoachingCombo: hasCoachingCombo.toString(),
            inPersonDiscount: hasCoachingCombo ? '50' : '0',
            hasDiscountCoupon: (
              hasCoachingCombo && discounts.length > 0
            ).toString(),
            // Revenue sharing info for subscriptions
            revenueShareEnabled: (!!payout.connectedAccountId).toString(),
            payoutDestination: payout.displayName,
            platformFeePercent:
              COMMISSION_CONFIG.PLATFORM_PERCENTAGE.toString(),
          },
        },
      }),
      // These settings help Stripe detect location for adaptive pricing
      billing_address_collection: 'required', // Changed from 'auto' to 'required'
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
      // Prevent multiple payments for same offer
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
      hasCoachingCombo &&
      offer_items.some((item) =>
        item.package.name?.toLowerCase().includes('premium'),
      )

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
      mode,
      bundleDescription,
      itemCount: checkoutItems.length,
      originalItemCount: offer_items.length,
      hasCoachingCombo,
      premiumIncluded,
      trainerName: offer.trainer.profile?.firstName || offer.trainer.name,
      inPersonDiscount: hasCoachingCombo ? 50 : 0,
      hasDiscountCoupon: hasCoachingCombo && discounts.length > 0,
      discountDescription:
        hasCoachingCombo && discounts.length > 0
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
