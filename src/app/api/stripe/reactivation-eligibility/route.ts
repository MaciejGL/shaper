import { SubscriptionStatus } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/db'
import { REACTIVATION_HELPERS, SUBSCRIPTION_HELPERS } from '@/lib/stripe/config'

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

    // Get all user's subscriptions
    const userSubscriptions = await prisma.userSubscription.findMany({
      where: { userId },
      include: {
        package: {
          select: {
            id: true,
            name: true,
            description: true,
            duration: true,
            priceNOK: true,
            stripePriceIdUSD: true,
            stripePriceIdEUR: true,
            stripePriceIdNOK: true,
            trainerId: true,
            trainer: {
              select: {
                name: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Group subscriptions by package
    const subscriptionsByPackage = userSubscriptions.reduce(
      (acc, sub) => {
        const packageId = sub.packageId
        if (!acc[packageId]) {
          acc[packageId] = []
        }
        acc[packageId].push(sub)
        return acc
      },
      {} as Record<string, typeof userSubscriptions>,
    )

    // Determine reactivation eligibility for each package
    const reactivationOptions = Object.entries(subscriptionsByPackage)
      .map(([packageId, subscriptions]) => {
        const latestSub = subscriptions[0] // Most recent subscription

        // Use helper functions for cleaner logic
        const canReactivatePackage =
          REACTIVATION_HELPERS.canReactivatePackage(subscriptions)
        const hasUsedTrial = REACTIVATION_HELPERS.hasUsedTrial(subscriptions)
        const latestCancelledSub =
          REACTIVATION_HELPERS.getLatestCancelledSubscription(subscriptions)

        // Check if package is properly configured with Stripe
        const hasStripeConfiguration = !!(
          latestSub.package.stripePriceIdUSD ||
          latestSub.package.stripePriceIdEUR ||
          latestSub.package.stripePriceIdNOK
        )

        const canReactivate = canReactivatePackage && hasStripeConfiguration

        if (!canReactivate || !latestCancelledSub) {
          return null
        }

        return {
          packageId,
          package: {
            id: latestSub.package.id,
            name: latestSub.package.name,
            description: latestSub.package.description,
            duration: latestSub.package.duration,
            priceNOK: latestSub.package.priceNOK,
            trainer: latestSub.package.trainer
              ? {
                  name: latestSub.package.trainer.name,
                  fullName: latestSub.package.trainer.profile
                    ? `${latestSub.package.trainer.profile.firstName} ${latestSub.package.trainer.profile.lastName}`.trim()
                    : latestSub.package.trainer.name,
                }
              : null,
          },
          eligibility: {
            canReactivate: true,
            trialEligible: !hasUsedTrial,
            lastSubscription: {
              id: latestCancelledSub.id,
              status: latestCancelledSub.status,
              endDate: latestCancelledSub.endDate,
              cancelledAt:
                latestCancelledSub.status === SubscriptionStatus.CANCELLED
                  ? latestCancelledSub.updatedAt
                  : null,
            },
            totalSubscriptions: subscriptions.length,
            reason: hasUsedTrial
              ? 'You can reactivate this subscription'
              : 'You can reactivate this subscription with a trial period',
          },
        }
      })
      .filter(Boolean)

    // Get current active subscriptions for context
    const activeSubscriptions = userSubscriptions
      .filter(
        (sub) =>
          SUBSCRIPTION_HELPERS.isActive(sub.status) ||
          SUBSCRIPTION_HELPERS.isPending(sub.status),
      )
      .map((sub) => ({
        id: sub.id,
        status: sub.status,
        packageName: sub.package.name,
        endDate: sub.endDate,
        isInTrial: sub.isTrialActive,
        isInGracePeriod: sub.isInGracePeriod,
      }))

    return NextResponse.json({
      userId,
      reactivationOptions,
      activeSubscriptions,
      summary: {
        totalEligiblePackages: reactivationOptions.length,
        totalActiveSubscriptions: activeSubscriptions.length,
        hasReactivationOptions: reactivationOptions.length > 0,
      },
    })
  } catch (error) {
    console.error('Error checking reactivation eligibility:', error)
    return NextResponse.json(
      { error: 'Failed to check reactivation eligibility' },
      { status: 500 },
    )
  }
}
