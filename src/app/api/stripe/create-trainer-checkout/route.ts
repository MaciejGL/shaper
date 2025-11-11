import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

import { SubscriptionStatus } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { getBaseUrl } from '@/lib/get-base-url'
import { COMMISSION_CONFIG } from '@/lib/stripe/config'
import { buildSupplierName } from '@/lib/stripe/connect-utils'
import {
  getInvoiceMetadata,
  getInvoiceTemplateConfig,
  getZeroVatTaxRateId,
} from '@/lib/stripe/invoice-config'
import { STRIPE_LOOKUP_KEYS } from '@/lib/stripe/lookup-keys'
import {
  type PayoutDestination,
  getPayoutDestination,
} from '@/lib/stripe/revenue-sharing-utils'
import { stripe } from '@/lib/stripe/stripe'
import { recordTermsAgreement } from '@/lib/terms-utils'

import { CheckoutRequest } from './types'
import {
  buildSessionMetadata,
  calculateBundleDiscounts,
  ensureStripeCustomer,
  fetchAndValidateOffer,
  findOrCreateUser,
  formatCheckoutResponse,
  parseOfferPackages,
  prepareCheckoutItems,
  prepareLineItems,
  validatePackageStripeKeys,
} from './utils'

export async function POST(request: NextRequest) {
  try {
    const { offerToken, clientEmail, successUrl, cancelUrl } =
      (await request.json()) as CheckoutRequest

    if (!offerToken || !clientEmail) {
      return NextResponse.json(
        { error: 'Offer token and client email are required' },
        { status: 400 },
      )
    }

    // Fetch and validate offer
    const offer = await fetchAndValidateOffer(offerToken, clientEmail)

    // Parse packages from offer
    const offerItems = await parseOfferPackages(offer)

    // Find or create user and Stripe customer
    const user = await findOrCreateUser(clientEmail)
    const customerId = await ensureStripeCustomer(
      user.id,
      clientEmail,
      user.stripeCustomerId,
    )

    // Validate package Stripe configuration
    validatePackageStripeKeys(offerItems)

    // Prepare checkout items and determine mode
    const { checkoutItems, hasPremiumCoaching, mode } =
      prepareCheckoutItems(offerItems)

    // Check if client has active coaching subscription
    const clientCoachingSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: user.id,
        status: SubscriptionStatus.ACTIVE,
        package: {
          stripeLookupKey: STRIPE_LOOKUP_KEYS.PREMIUM_COACHING,
        },
        endDate: {
          gte: new Date(),
        },
      },
      include: { package: true },
    })

    const hasCoachingSubscription = !!clientCoachingSubscription

    // Fetch trainer info for supplier attribution
    let supplierName: string | undefined
    if (offer.trainerId) {
      const trainer = await prisma.user.findUnique({
        where: { id: offer.trainerId },
        include: { profile: true },
      })

      if (trainer?.profile) {
        const firstName = trainer.profile.firstName || trainer.name
        const lastName = trainer.profile.lastName
        const connectAccountId = trainer.stripeConnectedAccountId

        supplierName = await buildSupplierName(
          firstName || '',
          lastName,
          connectAccountId,
        )
      }
    }

    // Get tax rate and prepare line items
    const zeroVatTaxRateId = getZeroVatTaxRateId()
    const lineItems = await prepareLineItems(checkoutItems, zeroVatTaxRateId)

    // Calculate bundle discounts (considers both bundle contents and user subscription)
    const discounts = await calculateBundleDiscounts(
      checkoutItems,
      hasPremiumCoaching || hasCoachingSubscription,
      offerToken,
    )

    // Setup revenue sharing for subscriptions
    let payout: PayoutDestination = {
      connectedAccountId: null,
      destination: 'none',
      displayName: 'none',
      platformFeePercent: COMMISSION_CONFIG.PLATFORM_PERCENTAGE,
    }

    const hasSubscription = mode === 'subscription'

    if (offer.trainerId && hasSubscription) {
      payout = await getPayoutDestination(offer.trainerId)
      if (payout.connectedAccountId) {
        console.info(
          `💰 Revenue sharing: ${payout.displayName} → ${payout.platformFeePercent}%`,
        )
      }
    }

    // Build session metadata with invoice compliance data
    const invoiceMetadata = getInvoiceMetadata()
    const sessionMetadata = {
      ...buildSessionMetadata(
        offerToken,
        offer.trainerId,
        user.id,
        clientEmail,
        checkoutItems,
        offerItems.length,
        hasPremiumCoaching,
        discounts,
        payout.displayName,
        payout.platformFeePercent,
        payout.connectedAccountId,
      ),
      ...invoiceMetadata,
      ...(supplierName && {
        supplier_name: supplierName,
        supplier_label: 'Services provided by',
      }),
    }

    // Apply invoice template to customer
    await stripe.customers.update(customerId, {
      invoice_settings: getInvoiceTemplateConfig(),
    })

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode,
      ...(discounts.length > 0 && { discounts }),
      ...(discounts.length === 0 && { allow_promotion_codes: true }),
      success_url:
        successUrl ||
        `${getBaseUrl()}/offer/${offerToken}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${getBaseUrl()}/offer/${offerToken}`,
      metadata: sessionMetadata,
      // Subscription revenue sharing
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
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
      client_reference_id: offerToken,
    })

    // Mark offer as processing
    await prisma.trainerOffer.update({
      where: { id: offer.id },
      data: { status: 'PROCESSING' },
    })

    // Record terms agreement
    try {
      await recordTermsAgreement({
        userId: user.id,
        offerId: offer.id,
      })
    } catch (error) {
      console.error('Failed to record terms agreement:', error)
    }

    // Format and return response
    const response = formatCheckoutResponse(
      checkoutSession.url,
      checkoutSession.id,
      mode,
      checkoutItems,
      offerItems,
      hasPremiumCoaching,
      discounts,
      offer.trainer.profile?.firstName || offer.trainer.name,
    )

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error creating trainer checkout:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Payment error: ${error.message}` },
        { status: 400 },
      )
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    )
  }
}
