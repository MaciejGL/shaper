import { NextRequest, NextResponse } from 'next/server'

import { SubscriptionStatus } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { SUBSCRIPTION_HELPERS } from '@/lib/stripe/config'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

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

    // Find the most recent active/pending subscription for display
    const primarySubscription = subscriptions[0]

    // Check if user has premium access from ANY subscription
    const hasPremiumAccess = subscriptions.some((sub) => {
      const packageName = sub.package.name.toLowerCase()
      const isNotExpired = now <= sub.endDate

      // Premium access granted by:
      // 1. Traditional premium subscription
      const hasPremiumSubscription =
        packageName.includes('premium') && isNotExpired

      // 2. Complete Coaching Combo (includes premium access)
      const hasCoachingCombo =
        packageName.includes('coaching') &&
        packageName.includes('combo') &&
        isNotExpired

      return (
        (hasPremiumSubscription || hasCoachingCombo) &&
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
    const isSubscriptionValid =
      subscription.status === SubscriptionStatus.ACTIVE &&
      now <= subscription.endDate

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
      expiresAt = subscription.endDate
      daysRemaining = Math.ceil(
        (subscription.endDate.getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24),
      )
    }

    // Determine status
    let status = 'EXPIRED'
    if (isInTrial) {
      status = 'TRIAL'
    } else if (isInGracePeriod) {
      status = 'GRACE_PERIOD'
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
        endDate: subscription.endDate,
        package: {
          name: subscription.package.name,
          duration: subscription.package.duration,
        },
        stripeSubscriptionId: subscription.stripeSubscriptionId,
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
