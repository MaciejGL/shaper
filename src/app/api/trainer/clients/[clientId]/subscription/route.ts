import { NextRequest, NextResponse } from 'next/server'

import { SubscriptionStatus } from '@/generated/prisma/client'
import { ensureTrainerClientAccess } from '@/lib/access-control'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/getUser'
import { STRIPE_LOOKUP_KEYS } from '@/lib/stripe/lookup-keys'
import { stripe } from '@/lib/stripe/stripe'

/**
 * Calculate the next N billing dates based on the billing cycle anchor
 * Uses the actual day-of-month from current period end to maintain consistency
 */
function calculateUpcomingBillingDates(
  currentPeriodEnd: number,
  count: number = 6,
): string[] {
  const dates: string[] = []
  const baseDate = new Date(currentPeriodEnd * 1000)

  // Set to end of day to ensure cancellation happens AFTER the billing period
  // This prevents the edge case where cancel_at is a few minutes before renewal
  baseDate.setHours(23, 59, 59, 999)

  for (let i = 0; i < count; i++) {
    const date = new Date(baseDate)
    // Add months properly (handles different month lengths correctly)
    date.setMonth(date.getMonth() + i)
    dates.push(date.toISOString())
  }

  return dates
}

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ clientId: string }> },
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { clientId } = await params

    // Verify trainer has permission
    try {
      await ensureTrainerClientAccess(user.user.id, clientId)
    } catch (_error) {
      return NextResponse.json(
        { error: 'Client not found or not associated with this trainer' },
        { status: 403 },
      )
    }

    // Find client's coaching subscription (include CANCELLED_ACTIVE for scheduled cancellations)
    const coachingSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: clientId,
        trainerId: user.user.id,
        status: {
          in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELLED_ACTIVE],
        },
        package: {
          stripeLookupKey: STRIPE_LOOKUP_KEYS.PREMIUM_COACHING,
        },
      },
      include: { package: true },
    })

    if (!coachingSubscription) {
      return NextResponse.json(
        { error: 'No active coaching subscription found' },
        { status: 404 },
      )
    }

    // Check Stripe subscription status
    let isPaused = false
    let cancelAt: string | null = null
    let upcomingBillingDates: string[] = []

    if (coachingSubscription.stripeSubscriptionId) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(
          coachingSubscription.stripeSubscriptionId,
        )
        isPaused = !!stripeSubscription.pause_collection

        // Check if scheduled to cancel
        if (stripeSubscription.cancel_at) {
          cancelAt = new Date(stripeSubscription.cancel_at * 1000).toISOString()
        }

        // Calculate upcoming billing dates for the dropdown
        const currentPeriodEnd =
          stripeSubscription.items.data[0]?.current_period_end ||
          Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
        upcomingBillingDates = calculateUpcomingBillingDates(
          currentPeriodEnd,
          6,
        )
      } catch (error) {
        console.error('Error checking Stripe subscription:', error)
      }
    }

    return NextResponse.json({
      id: coachingSubscription.id,
      status: coachingSubscription.status,
      isPaused,
      cancelAt,
      upcomingBillingDates,
      package: {
        name: coachingSubscription.package.name,
        stripeLookupKey: coachingSubscription.package.stripeLookupKey,
      },
      stripeSubscriptionId: coachingSubscription.stripeSubscriptionId,
    })
  } catch (error) {
    console.error('Error fetching client subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
