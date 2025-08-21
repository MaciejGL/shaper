import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

import {
  BillingStatus,
  Currency,
  SubscriptionStatus,
} from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { SUBSCRIPTION_HELPERS } from '@/lib/stripe/config'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, subscriptionId, cancelImmediately = false, reason } = body

    if (!userId || !subscriptionId) {
      return NextResponse.json(
        { error: 'User ID and Subscription ID are required' },
        { status: 400 },
      )
    }

    // Find the subscription in our database
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        id: subscriptionId,
        userId,
      },
      include: {
        package: {
          select: {
            name: true,
            duration: true,
          },
        },
      },
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 },
      )
    }

    // Check if subscription can be cancelled
    if (
      !SUBSCRIPTION_HELPERS.isActive(subscription.status) &&
      !SUBSCRIPTION_HELPERS.isPending(subscription.status)
    ) {
      return NextResponse.json(
        { error: 'Only active or pending subscriptions can be cancelled' },
        { status: 400 },
      )
    }

    // Cancel the Stripe subscription if it exists
    if (subscription.stripeSubscriptionId) {
      try {
        if (cancelImmediately) {
          // Cancel immediately - user loses access right away
          await stripe.subscriptions.cancel(subscription.stripeSubscriptionId)
        } else {
          // Cancel at period end - user retains access until end of billing period
          await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: true,
            metadata: {
              userId: subscription.userId,
              packageId: subscription.packageId,
              subscriptionId: subscription.id,
              cancellation_reason: reason || 'User requested cancellation',
              cancelled_by_user: 'true',
            },
          })
        }
      } catch (stripeError) {
        console.error('Error cancelling Stripe subscription:', stripeError)
        // Continue with database update even if Stripe fails
        // The webhook will handle the Stripe side if it eventually processes
      }
    }

    // Update our database
    const updatedSubscription = await prisma.userSubscription.update({
      where: { id: subscriptionId },
      data: {
        status: cancelImmediately
          ? SubscriptionStatus.CANCELLED
          : SubscriptionStatus.ACTIVE, // Keep active until period end
        // Note: The webhook will handle final cancellation when Stripe sends the event
      },
    })

    // Create a billing record for the cancellation event
    await prisma.billingRecord.create({
      data: {
        subscriptionId: subscription.id,
        amount: 0, // No charge for cancellation
        currency: Currency.USD, // Default currency for cancellation record
        status: BillingStatus.SUCCEEDED,
        periodStart: subscription.startDate,
        periodEnd: subscription.endDate,
        description: `Subscription cancelled${cancelImmediately ? ' immediately' : ' at period end'} - ${subscription.package.name}`,
        failureReason: reason || undefined,
      },
    })

    console.info(
      `❌ Subscription ${subscriptionId} cancelled ${cancelImmediately ? 'immediately' : 'at period end'} for user ${userId}`,
    )

    return NextResponse.json({
      success: true,
      message: cancelImmediately
        ? 'Subscription cancelled immediately. You can reactivate it anytime.'
        : `Subscription will be cancelled at the end of your current billing period (${subscription.endDate.toLocaleDateString()}). You can reactivate it anytime.`,
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        endDate: updatedSubscription.endDate,
        packageName: subscription.package.name,
        canReactivate: true,
      },
      cancellation: {
        immediate: cancelImmediately,
        effectiveDate: cancelImmediately ? new Date() : subscription.endDate,
        reason: reason || 'User requested cancellation',
        retainAccessUntil: cancelImmediately
          ? new Date()
          : subscription.endDate,
      },
    })
  } catch (error) {
    console.error('Error cancelling subscription:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 },
    )
  }
}
