import { SubscriptionStatus } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import {
  createInPersonDiscountIfEligible,
  createMealTrainingBundleDiscountIfEligible,
} from '@/lib/stripe/discount-utils'
import { STRIPE_LOOKUP_KEYS } from '@/lib/stripe/lookup-keys'
import { stripe } from '@/lib/stripe/stripe'

import {
  BundleItem,
  CheckoutPreparation,
  CheckoutResult,
  OfferWithTrainer,
  SubscriptionUpgradeResult,
} from './types'

/**
 * Fetches and validates the trainer offer with all necessary relations
 */
export async function fetchAndValidateOffer(
  offerToken: string,
  clientEmail: string,
): Promise<OfferWithTrainer> {
  const offer = await prisma.trainerOffer.findUnique({
    where: { token: offerToken },
    include: {
      trainer: { include: { profile: true } },
    },
  })

  if (!offer) {
    throw new Error('Offer not found')
  }

  if (offer.expiresAt < new Date()) {
    throw new Error('Offer has expired')
  }

  if (
    offer.status === 'COMPLETED' ||
    offer.status === 'CANCELLED' ||
    offer.status === 'EXPIRED'
  ) {
    throw new Error('Offer is no longer available')
  }

  if (offer.status === 'PROCESSING') {
    console.info(
      `⚠️ Creating checkout for offer ${offerToken} that is already in PROCESSING status - webhook will handle cleanup if needed`,
    )
  }

  if (offer.clientEmail !== clientEmail) {
    throw new Error('Email does not match offer')
  }

  return offer as OfferWithTrainer
}

/**
 * Parses package summary and fetches package details from database
 */
export async function parseOfferPackages(
  offer: OfferWithTrainer,
): Promise<BundleItem[]> {
  const packageSummary = offer.packageSummary as
    | {
        packageId: string
        quantity: number
        name: string
      }[]
    | null

  if (!packageSummary || packageSummary.length === 0) {
    throw new Error('Offer contains no packages')
  }

  const packages = await prisma.packageTemplate.findMany({
    where: {
      id: { in: packageSummary.map((p) => p.packageId) },
    },
  })

  return packageSummary.map((summary) => {
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
}

/**
 * Finds existing user or creates new one with profile
 */
export async function findOrCreateUser(clientEmail: string) {
  let user = await prisma.user.findUnique({ where: { email: clientEmail } })

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: clientEmail,
        name: clientEmail.split('@')[0],
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

  return user
}

/**
 * Creates or retrieves Stripe customer ID for user
 */
export async function ensureStripeCustomer(
  userId: string,
  email: string,
  existingCustomerId?: string | null,
): Promise<string> {
  if (existingCustomerId) {
    return existingCustomerId
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  })

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  })

  return customer.id
}

/**
 * Validates all packages have valid Stripe lookup keys
 */
export function validatePackageStripeKeys(items: BundleItem[]): void {
  for (const item of items) {
    if (!item.package.stripeLookupKey) {
      throw new Error(
        `Package "${item.package.name}" is not configured for payments`,
      )
    }

    if (
      typeof item.package.stripeLookupKey !== 'string' ||
      item.package.stripeLookupKey.trim() === ''
    ) {
      throw new Error(
        `Package "${item.package.name}" has invalid lookup key: ${item.package.stripeLookupKey}`,
      )
    }
  }
}

/**
 * Handles upgrading existing premium subscription to coaching with proration
 * Returns true if upgrade was successful and checkout should be skipped
 */
export async function handleExistingPremiumUpgrade(
  userId: string,
  hasPremiumCoaching: boolean,
  trainerId: string,
  offerToken: string,
  offerId: string,
): Promise<SubscriptionUpgradeResult> {
  if (!hasPremiumCoaching) {
    return { upgraded: false }
  }

  const existingPremium = await prisma.userSubscription.findFirst({
    where: {
      userId,
      status: SubscriptionStatus.ACTIVE,
      package: {
        stripeLookupKey: { in: ['premium_monthly', 'premium_yearly'] },
      },
    },
    include: { package: true },
  })

  if (!existingPremium?.stripeSubscriptionId) {
    return { upgraded: false }
  }

  const isMonthly = existingPremium.package.duration === 'MONTHLY'

  if (!isMonthly) {
    // Yearly subscription - continue with normal checkout, webhook will pause it
    return { upgraded: false }
  }

  // Monthly subscription - upgrade with proration
  try {
    const existingStripeSubscription = await stripe.subscriptions.retrieve(
      existingPremium.stripeSubscriptionId,
    )
    const subscriptionItemId = existingStripeSubscription.items.data[0].id

    const coachingPrices = await stripe.prices.list({
      lookup_keys: [STRIPE_LOOKUP_KEYS.PREMIUM_COACHING],
      limit: 1,
    })

    if (coachingPrices.data.length === 0) {
      throw new Error('Coaching price not found')
    }

    const coachingPriceId = coachingPrices.data[0].id

    await stripe.subscriptions.update(existingPremium.stripeSubscriptionId, {
      items: [{ id: subscriptionItemId, price: coachingPriceId }],
      proration_behavior: 'create_prorations',
      metadata: {
        trainerId,
        offerToken,
        switchedFromMonthly: 'true',
      },
    })

    console.info(
      `✅ Modified monthly subscription ${existingPremium.stripeSubscriptionId} to coaching with proration`,
    )

    await prisma.trainerOffer.update({
      where: { id: offerId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    })

    return {
      upgraded: true,
      subscriptionId: existingPremium.stripeSubscriptionId,
    }
  } catch (error) {
    console.error('Failed to prorate monthly subscription:', error)
    return { upgraded: false }
  }
}

/**
 * Prepares checkout items by filtering out standalone premium if coaching is present
 */
export function prepareCheckoutItems(
  offerItems: BundleItem[],
): CheckoutPreparation {
  const hasPremiumCoaching = offerItems.some(
    (item) =>
      item.package.stripeLookupKey === STRIPE_LOOKUP_KEYS.PREMIUM_COACHING,
  )

  const checkoutItems = offerItems.filter((item) => {
    const isPremiumSubscription =
      item.package.stripeLookupKey === STRIPE_LOOKUP_KEYS.PREMIUM_MONTHLY ||
      item.package.stripeLookupKey === STRIPE_LOOKUP_KEYS.PREMIUM_YEARLY

    return !(isPremiumSubscription && hasPremiumCoaching)
  })

  if (checkoutItems.length === 0) {
    throw new Error(
      'No chargeable items in bundle - all items are included in coaching combo',
    )
  }

  const paymentTypes = checkoutItems.map((item) => {
    const metadata = (item.package.metadata as Record<string, unknown>) || {}
    return metadata.category === 'trainer_coaching' ? 'subscription' : 'payment'
  })

  const hasSubscription = paymentTypes.includes('subscription')
  const mode = hasSubscription ? 'subscription' : 'payment'

  return { checkoutItems, hasPremiumCoaching, mode }
}

/**
 * Resolves Stripe lookup keys to actual price IDs
 */
export async function prepareLineItems(checkoutItems: BundleItem[]) {
  return Promise.all(
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
}

/**
 * Calculates and applies bundle discounts
 */
export async function calculateBundleDiscounts(
  checkoutItems: BundleItem[],
  hasPremiumCoaching: boolean,
  offerToken: string,
) {
  const discounts = []

  const inPersonDiscount = await createInPersonDiscountIfEligible(
    checkoutItems,
    hasPremiumCoaching,
    offerToken,
  )
  if (inPersonDiscount) {
    discounts.push(inPersonDiscount)
  }

  const mealTrainingDiscount = await createMealTrainingBundleDiscountIfEligible(
    checkoutItems,
    offerToken,
  )
  if (mealTrainingDiscount) {
    discounts.push(mealTrainingDiscount)
  }

  return discounts
}

/**
 * Builds checkout session metadata
 */
export function buildSessionMetadata(
  offerToken: string,
  trainerId: string,
  userId: string,
  clientEmail: string,
  checkoutItems: BundleItem[],
  originalItemCount: number,
  hasPremiumCoaching: boolean,
  discounts: unknown[],
  payoutDestination: string,
  platformFeePercent: number,
  connectedAccountId: string | null,
) {
  return {
    offerToken,
    trainerId,
    userId,
    clientEmail,
    source: 'trainer_offer',
    bundleItemCount: checkoutItems.length.toString(),
    originalItemCount: originalItemCount.toString(),
    hasCoachingCombo: hasPremiumCoaching.toString(),
    inPersonDiscount: hasPremiumCoaching ? '50' : '0',
    hasDiscountCoupon: (hasPremiumCoaching && discounts.length > 0).toString(),
    bundlePackages: checkoutItems
      .slice(0, 3)
      .map((item) => item.package.name)
      .join(', '),
    revenueShareEnabled: (!!connectedAccountId).toString(),
    payoutDestination,
    platformFeePercent: platformFeePercent.toString(),
  }
}

/**
 * Formats the final checkout response
 */
export function formatCheckoutResponse(
  sessionUrl: string | null,
  sessionId: string,
  mode: 'subscription' | 'payment',
  checkoutItems: BundleItem[],
  originalItems: BundleItem[],
  hasPremiumCoaching: boolean,
  discounts: unknown[],
  trainerName: string,
): CheckoutResult {
  const bundleDescription =
    checkoutItems.length === 1
      ? `${checkoutItems[0].quantity > 1 ? `${checkoutItems[0].quantity}x ` : ''}${checkoutItems[0].package.name}`
      : `Bundle (${checkoutItems.length} packages)`

  const premiumIncluded =
    hasPremiumCoaching &&
    originalItems.some(
      (item) =>
        item.package.stripeLookupKey === STRIPE_LOOKUP_KEYS.PREMIUM_MONTHLY ||
        item.package.stripeLookupKey === STRIPE_LOOKUP_KEYS.PREMIUM_YEARLY,
    )

  return {
    checkoutUrl: sessionUrl,
    sessionId,
    mode,
    bundleDescription,
    itemCount: checkoutItems.length,
    originalItemCount: originalItems.length,
    hasCoachingCombo: hasPremiumCoaching,
    premiumIncluded,
    trainerName,
    inPersonDiscount: hasPremiumCoaching ? 50 : 0,
    hasDiscountCoupon: hasPremiumCoaching && discounts.length > 0,
    discountDescription:
      hasPremiumCoaching && discounts.length > 0
        ? '50% off In-Person Sessions'
        : null,
  }
}
