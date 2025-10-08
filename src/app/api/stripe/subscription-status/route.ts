import { NextRequest, NextResponse } from 'next/server'

import { SubscriptionStatus } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { STRIPE_PRODUCTS, SUBSCRIPTION_HELPERS } from '@/lib/stripe/config'
import { stripe } from '@/lib/stripe/stripe'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const subscriptionType = searchParams.get('type') // 'coaching' or 'platform'
    const priceId = searchParams.get('priceId') // Filter by specific Stripe price ID

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

    if (subscriptions.length === 0) {
      return NextResponse.json({
        hasPremiumAccess: false,
        status: 'NO_SUBSCRIPTION',
        subscription: null,
        trial: null,
        gracePeriod: null,
      })
    }

    // Check cancellation status for all subscriptions to prioritize correctly
    // Also get the correct end date from Stripe for cancelled subscriptions
    const subscriptionsWithCancellation = await Promise.all(
      subscriptions.map(async (sub) => {
        let isCancelledButActive = false
        let stripeEndDate = sub.endDate // Use database endDate as fallback

        if (sub.stripeSubscriptionId) {
          try {
            const stripeSubscription = await stripe.subscriptions.retrieve(
              sub.stripeSubscriptionId,
            )
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const stripeSub = stripeSubscription as any
            isCancelledButActive = stripeSub.cancel_at_period_end || false

            // For cancelled subscriptions, use Stripe's current_period_end as source of truth
            if (isCancelledButActive && stripeSub.current_period_end) {
              stripeEndDate = new Date(stripeSub.current_period_end * 1000)
            }
          } catch (error) {
            console.error('Error retrieving Stripe subscription:', error)
          }
        }
        return { ...sub, isCancelledButActive, stripeEndDate }
      }),
    )

    // Filter subscriptions based on type or specific price ID
    let filteredSubscriptions = subscriptionsWithCancellation

    if (priceId) {
      // Filter by specific Stripe price ID (most precise)
      filteredSubscriptions = subscriptionsWithCancellation.filter(
        (sub) => sub.package.stripePriceId === priceId,
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

    // Get premium price IDs from environment variables
    const premiumPriceIds: string[] = []
    if (STRIPE_PRODUCTS.PREMIUM_MONTHLY) {
      premiumPriceIds.push(STRIPE_PRODUCTS.PREMIUM_MONTHLY)
    }
    if (STRIPE_PRODUCTS.PREMIUM_YEARLY) {
      premiumPriceIds.push(STRIPE_PRODUCTS.PREMIUM_YEARLY)
    }
    if (STRIPE_PRODUCTS.COACHING_COMBO) {
      premiumPriceIds.push(STRIPE_PRODUCTS.COACHING_COMBO)
    }

    // Check if user has premium access from ANY subscription
    const hasPremiumAccess = subscriptions.some((sub) => {
      // For trial subscriptions, check trialEnd; for regular subscriptions, check endDate
      const effectiveEndDate =
        sub.isTrialActive && sub.trialEnd ? sub.trialEnd : sub.endDate
      const isNotExpired = now <= effectiveEndDate

      // Check for lifetime premium (admin-granted, no Stripe price ID)
      const metadata = sub.package.metadata as { isLifetime?: boolean } | null
      if (metadata?.isLifetime === true && isNotExpired) {
        return true
      }

      // Check if this subscription grants premium access using stable price IDs
      const grantsPremiumAccess =
        sub.package.stripePriceId &&
        premiumPriceIds.includes(sub.package.stripePriceId) &&
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

    // Check trial status (14 days)
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
      subscription.status === SubscriptionStatus.ACTIVE &&
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

    // Determine status
    let status = 'EXPIRED'
    if (isInTrial) {
      status = 'TRIAL'
    } else if (isInGracePeriod) {
      status = 'GRACE_PERIOD'
    } else if (isSubscriptionValid && isCancelledButActive) {
      status = 'CANCELLED_ACTIVE'
    } else if (isSubscriptionValid) {
      status = 'ACTIVE'
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
          stripePriceId: subscription.package.stripePriceId,
        },
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        isCancelledButActive,
      },
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
    })
  } catch (error) {
    console.error('Error checking subscription status:', error)
    return NextResponse.json(
      { error: 'Failed to check subscription status' },
      { status: 500 },
    )
  }
}
