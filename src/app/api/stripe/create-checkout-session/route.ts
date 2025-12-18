import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

import { SubscriptionStatus } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { getBaseUrl } from '@/lib/get-base-url'
import { SUBSCRIPTION_CONFIG } from '@/lib/stripe/config'
import {
  getInvoiceMetadata,
  getInvoiceTemplateConfig,
  getZeroVatTaxRateId,
} from '@/lib/stripe/invoice-config'
import { STRIPE_LOOKUP_KEYS } from '@/lib/stripe/lookup-keys'
import { stripe } from '@/lib/stripe/stripe'
import { recordTermsAgreement } from '@/lib/terms-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      packageId,
      lookupKey,
      returnUrl,
      cancelUrl,
      platform,
      extToken,
      clientDebug,
      externalOfferDiagnostics,
    } = body

    // #region agent log
    const ua = request.headers.get('user-agent') || ''
    const uaFlags = {
      hasWv: ua.includes('; wv'),
      hasAndroid: ua.toLowerCase().includes('android'),
      hasExpo: ua.toLowerCase().includes('expo'),
      hasHypertro: ua.toLowerCase().includes('hypertro'),
    }
    console.info('[DBG_EXT_OFFERS][CHECKOUT_RECEIVED]', {
      platform: typeof platform === 'string' ? platform : null,
      hasExtToken: typeof extToken === 'string' && extToken.length > 0,
      hasUserId: typeof userId === 'string' && userId.length > 0,
      hasLookupKey: typeof lookupKey === 'string' && lookupKey.length > 0,
      uaFlags,
      externalOfferDiagnostics:
        externalOfferDiagnostics && typeof externalOfferDiagnostics === 'object'
          ? {
              isInitialized: !!externalOfferDiagnostics.isInitialized,
              isAvailable:
                typeof externalOfferDiagnostics.isAvailable === 'boolean'
                  ? externalOfferDiagnostics.isAvailable
                  : null,
              errorName:
                typeof externalOfferDiagnostics.errorName === 'string'
                  ? externalOfferDiagnostics.errorName
                  : null,
            }
          : null,
      clientDebug:
        clientDebug && typeof clientDebug === 'object'
          ? {
              isNativeApp: !!clientDebug.isNativeApp,
              platform:
                typeof clientDebug.platform === 'string'
                  ? clientDebug.platform
                  : null,
              hasNativeAppObject: !!clientDebug.hasNativeAppObject,
              hasNativeOpenExternalCheckout:
                !!clientDebug.hasNativeOpenExternalCheckout,
              hasNativeGetExternalOfferToken:
                !!clientDebug.hasNativeGetExternalOfferToken,
            }
          : null,
    })
    fetch('http://127.0.0.1:7243/ingest/ff67e938-d34a-495d-99c6-d347bebc5d85', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'H2',
        location: 'src/app/api/stripe/create-checkout-session/route.ts:POST',
        message: 'checkout_received',
        data: {
          platform: typeof platform === 'string' ? platform : null,
          hasExtToken: typeof extToken === 'string' && extToken.length > 0,
          hasUserId: typeof userId === 'string' && userId.length > 0,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion agent log

    if (!userId || (!packageId && !lookupKey)) {
      return NextResponse.json(
        { error: 'User ID and either Package ID or Lookup Key are required' },
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

    let packageTemplate = null
    let stripeLookupKey: string | null = null
    let packageName = 'Premium Subscription'

    // If packageId provided, look up package template
    if (packageId) {
      packageTemplate = await prisma.packageTemplate.findUnique({
        where: { id: packageId },
        select: {
          id: true,
          name: true,
          description: true,
          duration: true,
          stripeLookupKey: true,
          trainerId: true,
        },
      })

      if (!packageTemplate) {
        return NextResponse.json(
          { error: 'Package not found' },
          { status: 404 },
        )
      }

      // Check if package has Stripe configuration
      if (!packageTemplate.stripeLookupKey) {
        return NextResponse.json(
          { error: 'Package is not configured for Stripe payments' },
          { status: 400 },
        )
      }

      stripeLookupKey = packageTemplate.stripeLookupKey
      packageName = packageTemplate.name

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
    } else if (lookupKey) {
      // Direct lookup key provided (for platform subscriptions)
      stripeLookupKey = lookupKey

      // Determine package name from lookup key
      if (lookupKey === STRIPE_LOOKUP_KEYS.PREMIUM_MONTHLY) {
        packageName = 'Premium Monthly'
      } else if (lookupKey === STRIPE_LOOKUP_KEYS.PREMIUM_YEARLY) {
        packageName = 'Premium Yearly'
      }

      // Check if user already has an active platform subscription
      const existingSubscription = await prisma.userSubscription.findFirst({
        where: {
          userId,
          status: {
            in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING],
          },
          package: {
            stripeLookupKey: {
              in: [
                STRIPE_LOOKUP_KEYS.PREMIUM_MONTHLY,
                STRIPE_LOOKUP_KEYS.PREMIUM_YEARLY,
              ],
            },
          },
        },
      })

      if (existingSubscription) {
        return NextResponse.json(
          {
            error:
              'You already have an active premium subscription. Please cancel it first.',
            existingSubscription: {
              id: existingSubscription.id,
              status: existingSubscription.status,
              endDate: existingSubscription.endDate,
            },
          },
          { status: 400 },
        )
      }
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

    // Determine trial eligibility - check if user has EVER used a trial (global check)
    const [hasUsedTrialInDB, stripeCustomer] = await Promise.all([
      prisma.userSubscription.findFirst({
        where: {
          userId,
          OR: [{ isTrialActive: true }, { trialStart: { not: null } }],
        },
      }),
      stripe.customers.retrieve(customerId),
    ])

    // Check both local DB and Stripe metadata for trial usage
    const hasUsedTrial =
      hasUsedTrialInDB ||
      (stripeCustomer as Stripe.Customer).metadata?.hasUsedTrial === 'true'

    // Validate we have a lookup key
    if (!stripeLookupKey) {
      return NextResponse.json(
        { error: 'No valid lookup key found' },
        { status: 400 },
      )
    }

    // Resolve lookup key to actual price ID for Stripe API
    const prices = await stripe.prices.list({
      lookup_keys: [stripeLookupKey],
      limit: 1,
    })

    if (prices.data.length === 0) {
      return NextResponse.json(
        { error: `No price found for lookup key: ${stripeLookupKey}` },
        { status: 400 },
      )
    }

    const priceId = prices.data[0].id

    // Check if this is a coaching upgrade
    const isCoachingSubscription =
      stripeLookupKey === STRIPE_LOOKUP_KEYS.PREMIUM_COACHING

    // If purchasing coaching, check if user has existing premium subscription to trigger refund
    let hasCoachingUpgrade = false
    if (isCoachingSubscription) {
      const existingPremium = await prisma.userSubscription.findFirst({
        where: {
          userId,
          status: {
            in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING],
          },
          package: {
            stripeLookupKey: {
              in: [
                STRIPE_LOOKUP_KEYS.PREMIUM_MONTHLY,
                STRIPE_LOOKUP_KEYS.PREMIUM_YEARLY,
              ],
            },
          },
        },
      })
      hasCoachingUpgrade = !!existingPremium
    }

    // Apply 0% VAT if configured
    const zeroVatTaxRateId = getZeroVatTaxRateId()
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price: priceId,
        quantity: 1,
        ...(zeroVatTaxRateId && { tax_rates: [zeroVatTaxRateId] }),
      },
    ]

    // Add Norwegian compliance metadata
    const invoiceMetadata = getInvoiceMetadata()

    // Apply invoice template to customer
    await stripe.customers.update(customerId, {
      invoice_settings: getInvoiceTemplateConfig(),
    })

    // Create checkout session
    // #region agent log
    console.info('[DBG_EXT_OFFERS][CHECKOUT_CREATE_PARAMS]', {
      sessionMetadataHasPlatform: false,
      sessionMetadataHasExtToken: false,
      subscriptionMetadataPlatform:
        typeof platform === 'string' && platform.length > 0 ? platform : null,
      subscriptionMetadataHasExtToken:
        typeof extToken === 'string' && extToken.length > 0,
      hasUsedTrial,
    })
    fetch('http://127.0.0.1:7243/ingest/ff67e938-d34a-495d-99c6-d347bebc5d85', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'H4',
        location:
          'src/app/api/stripe/create-checkout-session/route.ts:checkout_sessions_create',
        message: 'checkout_create_params',
        data: {
          subscriptionMetadataPlatform:
            typeof platform === 'string' && platform.length > 0
              ? platform
              : null,
          subscriptionMetadataHasExtToken:
            typeof extToken === 'string' && extToken.length > 0,
          hasUsedTrial,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion agent log
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: returnUrl
        ? `${returnUrl}${returnUrl.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}`
        : `${getBaseUrl()}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${getBaseUrl()}?cancelled=true`,
      metadata: {
        userId,
        packageId: packageId || null,
        packageName,
        lookupKey: stripeLookupKey,
        isNewSubscription: 'true',
        hasCoachingUpgrade: hasCoachingUpgrade.toString(),
        ...invoiceMetadata,
      },
      subscription_data: {
        trial_period_days: hasUsedTrial
          ? undefined
          : SUBSCRIPTION_CONFIG.TRIAL_PERIOD_DAYS,
        metadata: {
          userId,
          packageId: packageId || null,
          packageName,
          lookupKey: stripeLookupKey,
          trainerIdAssigned: packageTemplate?.trainerId || '',
          platform: platform || '', // ios, android, or empty for web (Stripe treats '' as unset)
          extToken: extToken || '', // External offer token for Google reporting (Stripe treats '' as unset)
          ...invoiceMetadata,
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
      `🛒 Checkout session created for user ${userId}, ${packageId ? `package ${packageId}` : `lookup key ${stripeLookupKey}`}${hasUsedTrial ? ' (no trial)' : ` (${SUBSCRIPTION_CONFIG.TRIAL_PERIOD_DAYS}-day trial)`}${hasCoachingUpgrade ? ' (coaching upgrade - will trigger refund)' : ''}`,
    )

    try {
      await recordTermsAgreement({
        userId,
      })
    } catch (error) {
      console.error('Failed to record terms agreement:', error)
    }

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
      packageName,
      duration: packageTemplate?.duration || null,
      hasTrialPeriod: !hasUsedTrial,
      trialDays: hasUsedTrial ? 0 : SUBSCRIPTION_CONFIG.TRIAL_PERIOD_DAYS,
      message: hasUsedTrial
        ? `Redirecting to payment for ${packageName}`
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
