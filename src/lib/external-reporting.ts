/**
 * External Reporting Module
 *
 * Centralized reporting for Apple and Google external purchase compliance.
 * Only reports Premium subscriptions (monthly/yearly) when:
 * - User is on iOS/Android (not web)
 * - That platform is in "full" mode for user's region
 *
 * Apple: App Store Server API - External Purchase reporting
 * Google: Play Developer API - External Transaction reporting
 */
import {
  PAYMENT_RULES,
  Platform,
  getRegionFromTimezone,
} from '@/config/payment-rules'
import { STRIPE_LOOKUP_KEYS } from '@/lib/stripe/lookup-keys'

import prisma from './db'
import { stripe } from './stripe/stripe'

// Premium subscription lookup keys that require reporting
const REPORTABLE_PRODUCTS: (typeof STRIPE_LOOKUP_KEYS)[keyof typeof STRIPE_LOOKUP_KEYS][] =
  [STRIPE_LOOKUP_KEYS.PREMIUM_MONTHLY, STRIPE_LOOKUP_KEYS.PREMIUM_YEARLY]

export type TransactionType = 'purchase' | 'renewal' | 'refund'

interface ReportParams {
  userId: string
  stripeTransactionId: string
  amount: number
  currency: string
  stripeLookupKey: (typeof STRIPE_LOOKUP_KEYS)[keyof typeof STRIPE_LOOKUP_KEYS]
  transactionType: TransactionType
  platform: Platform | null // Platform that initiated the purchase
}

/**
 * Main entry point for reporting transactions.
 * Only reports if:
 * 1. Product is Premium (monthly/yearly)
 * 2. Purchase was from iOS or Android (not web)
 * 3. That platform is in "full" mode for user's region
 */
export async function reportExternalTransaction(
  params: ReportParams,
): Promise<void> {
  const {
    userId,
    stripeLookupKey,
    transactionType,
    stripeTransactionId,
    amount,
    currency,
    platform,
  } = params

  // Only report Premium subscriptions
  if (!REPORTABLE_PRODUCTS.includes(stripeLookupKey)) {
    return
  }

  // Web purchases never need reporting
  if (!platform || platform === 'web') {
    return
  }

  // Get user to check their region
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      profile: { select: { timezone: true } },
    },
  })

  if (!user) {
    console.error('[REPORTING] User not found:', userId)
    return
  }

  // Check if reporting is required for this platform + region combo
  const region = getRegionFromTimezone(user.profile?.timezone)
  const rules = PAYMENT_RULES[region] || PAYMENT_RULES.DEFAULT
  const platformRules = rules[platform]

  // Only report if this platform is in "full" mode (not companion)
  if (platformRules.paymentModel !== 'full') {
    return
  }

  // Log the report (placeholder for actual API calls)
  console.info('[EXTERNAL REPORTING] Transaction reported:', {
    transactionId: stripeTransactionId,
    type: transactionType,
    amount: `${amount / 100} ${currency.toUpperCase()}`,
    product: stripeLookupKey,
    userId: user.id,
    platform,
    region,
  })

  // TODO: Implement actual Apple/Google API calls
  if (platform === 'ios') {
    // await reportToApple(...)
  } else if (platform === 'android') {
    // await reportToGoogle(...)
  }
}

/**
 * Report a refund - looks up subscription details automatically
 */
export async function reportRefund(params: {
  userId: string
  chargeId: string
  amount: number
  currency: string
}): Promise<void> {
  const { userId, chargeId, amount, currency } = params

  try {
    // Find Premium subscription for this user
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId,
        stripeSubscriptionId: { not: null },
        package: {
          stripeLookupKey: {
            in: [
              STRIPE_LOOKUP_KEYS.PREMIUM_MONTHLY,
              STRIPE_LOOKUP_KEYS.PREMIUM_YEARLY,
            ],
          },
        },
      },
      include: { package: true },
    })

    if (
      !subscription?.stripeSubscriptionId ||
      !subscription.package.stripeLookupKey
    ) {
      return
    }

    // Get platform from Stripe subscription metadata
    const stripeSub = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId,
    )
    const platform = (stripeSub.metadata?.platform as 'ios' | 'android') || null

    await reportExternalTransaction({
      userId,
      stripeTransactionId: chargeId,
      amount,
      currency,
      stripeLookupKey: subscription.package
        .stripeLookupKey as (typeof STRIPE_LOOKUP_KEYS)[keyof typeof STRIPE_LOOKUP_KEYS],
      transactionType: 'refund',
      platform,
    })
  } catch (error) {
    console.error('[REPORTING] Failed to report refund:', error)
  }
}
