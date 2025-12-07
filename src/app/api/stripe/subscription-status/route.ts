import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

import { SubscriptionStatus } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { SUBSCRIPTION_HELPERS } from '@/lib/stripe/config'
import { DISCOUNT_TYPES } from '@/lib/stripe/discount-config'
import { getPremiumLookupKeys } from '@/lib/stripe/lookup-keys'
import { stripe } from '@/lib/stripe/stripe'

interface PromotionalDiscount {
  percentOff: number
  monthsRemaining: number
  endsAt: string
  fullPriceAmount: number
  discountedAmount: number
  currency: string
}

async function fetchPromotionalDiscount(
  stripeSubscriptionId: string,
): Promise<PromotionalDiscount | null> {
  try {
    const stripeSubscription = await stripe.subscriptions.retrieve(
      stripeSubscriptionId,
      { expand: ['discounts.source.coupon'] },
    )

    const discount = stripeSubscription.discounts?.[0]
    if (!discount || typeof discount === 'string') return null

    const coupon = discount.source?.coupon
    if (!coupon || typeof coupon === 'string') return null

    // Only return trainer custom discounts
    if (
      coupon.metadata?.discountType !== DISCOUNT_TYPES.TRAINER_CUSTOM_DISCOUNT
    ) {
      return null
    }

    const percentOff = coupon.percent_off
    if (!percentOff || !discount.end) return null

    const now = new Date()
    const discountEnd = new Date(discount.end * 1000)

    // Check if discount is still active
    if (discountEnd <= now) return null

    // Calculate months remaining
    const monthsRemaining = Math.ceil(
      (discountEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30),
    )

    // Get current subscription price info
    const subscriptionItem = stripeSubscription.items.data[0]
    const price = subscriptionItem?.price as Stripe.Price | undefined
    const fullPriceAmount = price?.unit_amount ?? 0
    const discountedAmount = Math.round(
      fullPriceAmount * (1 - percentOff / 100),
    )
    const currency = price?.currency ?? 'nok'

    return {
      percentOff,
      monthsRemaining,
      endsAt: discountEnd.toISOString(),
      fullPriceAmount,
      discountedAmount,
      currency,
    }
  } catch (error) {
    console.error('Failed to fetch promotional discount from Stripe:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const subscriptionType = searchParams.get('type') // 'coaching' or 'platform'
    const lookupKey = searchParams.get('lookupKey') // Filter by specific Stripe lookup key

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 },
      )
    }

    // Get ALL user subscriptions to check for premium access
    const subscriptions = await prisma.userSubscription.findMany({
      where: {
        userId,
        OR: [
          { status: SubscriptionStatus.ACTIVE },
          { status: SubscriptionStatus.CANCELLED_ACTIVE }, // Include cancelled but active
          { status: SubscriptionStatus.PENDING }, // Include pending for grace period check
        ],
      },
      include: {
        package: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const now = new Date()

    // Check if user has ever used a trial (for trial eligibility)
    const hasUsedTrialInDB = await prisma.userSubscription.findFirst({
      where: {
        userId,
        OR: [{ isTrialActive: true }, { trialStart: { not: null } }],
      },
    })

    // Get user's Stripe customer to check metadata
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    })

    let hasUsedTrial = !!hasUsedTrialInDB

    // Also check Stripe metadata if customer exists
    if (user?.stripeCustomerId && !hasUsedTrial) {
      try {
        const stripeCustomer = await stripe.customers.retrieve(
          user.stripeCustomerId,
        )

        if (
          'metadata' in stripeCustomer &&
          stripeCustomer.metadata?.hasUsedTrial === 'true'
        ) {
          hasUsedTrial = true
        }
      } catch (error) {
        console.error('Failed to fetch Stripe customer metadata:', error)
      }
    }

    if (subscriptions.length === 0) {
      return NextResponse.json({
        hasPremiumAccess: false,
        status: 'NO_SUBSCRIPTION',
        subscription: null,
        trial: null,
        gracePeriod: null,
        hasUsedTrial,
      })
    }

    // Use database status instead of fetching Stripe (much faster!)
    const subscriptionsWithCancellation = subscriptions.map((sub) => ({
      ...sub,
      isCancelledButActive: sub.status === SubscriptionStatus.CANCELLED_ACTIVE,
      stripeEndDate: sub.endDate,
    }))

    // Filter subscriptions based on type or specific lookup key
    let filteredSubscriptions = subscriptionsWithCancellation

    if (lookupKey) {
      // Filter by specific Stripe lookup key (most precise)
      filteredSubscriptions = subscriptionsWithCancellation.filter(
        (sub) => sub.package.stripeLookupKey === lookupKey,
      )
    } else if (subscriptionType === 'coaching') {
      // Only coaching subscriptions (with trainerId)
      filteredSubscriptions = subscriptionsWithCancellation.filter(
        (sub) => sub.trainerId !== null,
      )
    } else if (subscriptionType === 'platform') {
      // Only platform subscriptions (no trainerId)
      filteredSubscriptions = subscriptionsWithCancellation.filter(
        (sub) => sub.trainerId === null,
      )
    }

    // If no subscriptions match the filter, return early
    if (filteredSubscriptions.length === 0) {
      return NextResponse.json({
        hasPremiumAccess: false,
        status: 'NO_SUBSCRIPTION',
        subscription: null,
        trial: null,
        gracePeriod: null,
        hasUsedTrial,
      })
    }

    // Find the best subscription to display:
    // 1. Prioritize active non-cancelled subscriptions
    // 2. Then active cancelled subscriptions
    // 3. Finally, most recent by creation date
    const primarySubscription =
      filteredSubscriptions.find(
        (sub) => !sub.isCancelledButActive && now <= sub.stripeEndDate,
      ) ||
      filteredSubscriptions.find(
        (sub) => sub.isCancelledButActive && now <= sub.stripeEndDate,
      ) ||
      filteredSubscriptions[0]

    const isCancelledButActive = primarySubscription.isCancelledButActive

    // Get premium lookup keys
    const premiumLookupKeys = getPremiumLookupKeys()

    // Check if user has premium access from ANY subscription
    const hasPremiumAccess = subscriptions.some((sub) => {
      // For trial subscriptions, check trialEnd; for regular subscriptions, check endDate
      const effectiveEndDate =
        sub.isTrialActive && sub.trialEnd ? sub.trialEnd : sub.endDate
      const isNotExpired = now <= effectiveEndDate

      // Check for lifetime premium (admin-granted, no Stripe lookup key)
      const metadata = sub.package.metadata as { isLifetime?: boolean } | null
      if (metadata?.isLifetime === true && isNotExpired) {
        return true
      }

      // Check if this subscription grants premium access using lookup keys
      const grantsPremiumAccess =
        sub.package.stripeLookupKey &&
        premiumLookupKeys.includes(sub.package.stripeLookupKey) &&
        isNotExpired

      return (
        grantsPremiumAccess &&
        SUBSCRIPTION_HELPERS.canAccess(
          sub.status,
          sub.isTrialActive || false,
          sub.isInGracePeriod || false,
        )
      )
    })

    const subscription = primarySubscription

    // Check trial status (7 days)
    const isInTrial =
      subscription.isTrialActive &&
      subscription.trialEnd &&
      now <= subscription.trialEnd

    // Check grace period status (3 days after failed payment)
    const isInGracePeriod =
      subscription.isInGracePeriod &&
      subscription.gracePeriodEnd &&
      now <= subscription.gracePeriodEnd

    // Check if subscription is still valid
    // For trial subscriptions, check trialEnd; for regular subscriptions, check endDate
    // For cancelled subscriptions, use Stripe's end date as source of truth
    const effectiveEndDate =
      subscription.isTrialActive && subscription.trialEnd
        ? subscription.trialEnd
        : primarySubscription.stripeEndDate
    const isSubscriptionValid =
      (subscription.status === SubscriptionStatus.ACTIVE ||
        subscription.status === SubscriptionStatus.CANCELLED_ACTIVE) &&
      now <= effectiveEndDate

    // Premium access already calculated above based on subscription types

    // Calculate days remaining
    let daysRemaining = 0
    let expiresAt: Date | null = null

    if (isInTrial && subscription.trialEnd) {
      expiresAt = subscription.trialEnd
      daysRemaining = Math.ceil(
        (subscription.trialEnd.getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24),
      )
    } else if (isInGracePeriod && subscription.gracePeriodEnd) {
      expiresAt = subscription.gracePeriodEnd
      daysRemaining = Math.ceil(
        (subscription.gracePeriodEnd.getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24),
      )
    } else if (isSubscriptionValid) {
      expiresAt = effectiveEndDate
      daysRemaining = Math.ceil(
        (effectiveEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      )
    }

    // Determine status - check cancellation first
    let status = 'EXPIRED'
    const isCancelled =
      primarySubscription.status === SubscriptionStatus.CANCELLED_ACTIVE

    if (isCancelled && isInTrial) {
      status = 'CANCELLED_ACTIVE' // Cancelled during trial
    } else if (isInTrial) {
      status = 'TRIAL'
    } else if (isInGracePeriod) {
      status = 'GRACE_PERIOD'
    } else if (isSubscriptionValid && isCancelled) {
      status = 'CANCELLED_ACTIVE'
    } else if (isSubscriptionValid) {
      status = 'ACTIVE'
    }

    // Fetch promotional discount from Stripe if subscription has stripeSubscriptionId
    let promotionalDiscount: PromotionalDiscount | null = null
    if (subscription.stripeSubscriptionId) {
      promotionalDiscount = await fetchPromotionalDiscount(
        subscription.stripeSubscriptionId,
      )
    }

    return NextResponse.json({
      hasPremiumAccess,
      status,
      daysRemaining: Math.max(0, daysRemaining),
      expiresAt,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: effectiveEndDate,
        package: {
          name: subscription.package.name,
          duration: subscription.package.duration,
          stripeLookupKey: subscription.package.stripeLookupKey,
        },
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        isCancelledButActive,
      },
      promotionalDiscount,
      trial: isInTrial
        ? {
            isActive: true,
            startDate: subscription.trialStart,
            endDate: subscription.trialEnd,
            daysRemaining: Math.max(
              0,
              Math.ceil(
                (subscription.trialEnd!.getTime() - now.getTime()) /
                  (1000 * 60 * 60 * 24),
              ),
            ),
          }
        : null,
      gracePeriod: isInGracePeriod
        ? {
            isActive: true,
            endDate: subscription.gracePeriodEnd,
            daysRemaining: Math.max(
              0,
              Math.ceil(
                (subscription.gracePeriodEnd!.getTime() - now.getTime()) /
                  (1000 * 60 * 60 * 24),
              ),
            ),
            failedRetries: subscription.failedPaymentRetries,
          }
        : null,
      hasUsedTrial,
    })
  } catch (error) {
    console.error('Error checking subscription status:', error)
    return NextResponse.json(
      { error: 'Failed to check subscription status' },
      { status: 500 },
    )
  }
}
