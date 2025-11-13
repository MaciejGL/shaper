import { NextRequest, NextResponse } from 'next/server'

import { SubscriptionStatus } from '@/generated/prisma/client'
import { ensureTrainerClientAccess } from '@/lib/access-control'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/getUser'
import { STRIPE_LOOKUP_KEYS } from '@/lib/stripe/lookup-keys'
import { stripe } from '@/lib/stripe/stripe'

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

    // Find client's coaching subscription
    const coachingSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: clientId,
        trainerId: user.user.id,
        status: SubscriptionStatus.ACTIVE,
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

    // Check if paused in Stripe
    let isPaused = false
    if (coachingSubscription.stripeSubscriptionId) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(
          coachingSubscription.stripeSubscriptionId,
        )
        isPaused = !!stripeSubscription.pause_collection
      } catch (error) {
        console.error('Error checking Stripe subscription:', error)
      }
    }

    return NextResponse.json({
      id: coachingSubscription.id,
      status: coachingSubscription.status,
      isPaused,
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
