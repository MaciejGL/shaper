import Stripe from 'stripe'

import {
  PackageTemplate,
  SubscriptionStatus,
  User,
  UserProfile,
  UserSubscription,
} from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email/send-mail'
import { isProd } from '@/lib/get-base-url'
import {
  ServerEvent,
  captureServerEvent,
  captureServerException,
} from '@/lib/posthog-server'
import { STRIPE_LOOKUP_KEYS } from '@/lib/stripe/lookup-keys'
import { stripe } from '@/lib/stripe/stripe'

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
) {
  try {
    // Get subscription details before updating
    const userSubscription = await prisma.userSubscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
      include: {
        user: { include: { profile: true } },
        package: true,
      },
    })

    if (!userSubscription) {
      console.error(`Subscription not found for Stripe ID: ${subscription.id}`)
      return
    }

    // Immediately disable access and clear grace periods
    await disableSubscriptionAccess(subscription.id)

    console.info(
      `✅ Subscription ${subscription.id} deleted - immediate access revoked for user ${userSubscription.user.email}`,
    )

    // Check if this was an upgrade cancellation
    const isUpgradeCancellation =
      subscription.metadata?.cancelReason === 'upgrade_to_coaching'

    if (isUpgradeCancellation) {
      // Send upgrade credit email instead of normal cancellation email
      await sendUpgradeCreditEmail(userSubscription, subscription)
    } else {
      // Send normal cancellation email
      await sendCancellationEmail(userSubscription)
    }

    // If coaching ended, resume any paused yearly subscription
    const wasCoaching =
      userSubscription.package.stripeLookupKey ===
      STRIPE_LOOKUP_KEYS.PREMIUM_COACHING

    if (wasCoaching) {
      console.info(`Coaching ended for user ${userSubscription.userId}`)

      // Find paused yearly subscriptions
      const allYearly = await prisma.userSubscription.findMany({
        where: {
          userId: userSubscription.userId,
          status: SubscriptionStatus.ACTIVE,
          package: { stripeLookupKey: STRIPE_LOOKUP_KEYS.PREMIUM_YEARLY },
        },
      })

      for (const yearly of allYearly) {
        if (!yearly.stripeSubscriptionId) continue

        try {
          const stripeSub = await stripe.subscriptions.retrieve(
            yearly.stripeSubscriptionId,
          )

          // Resume paused yearly subscription
          if (
            stripeSub.pause_collection?.behavior === 'void' &&
            stripeSub.metadata?.pausedForCoaching === 'true'
          ) {
            await stripe.subscriptions.update(yearly.stripeSubscriptionId, {
              pause_collection: null,
              metadata: {
                ...stripeSub.metadata,
                resumedAt: new Date().toISOString(),
                pausedForCoaching: null, // Remove flag
              },
            })

            console.info(
              `✅ Resumed yearly subscription ${yearly.stripeSubscriptionId}`,
            )
            break
          }
        } catch (error) {
          console.error(
            `Failed to resume subscription ${yearly.stripeSubscriptionId}:`,
            error,
          )
        }
      }

      // Remove trainer assignment when coaching subscription ends
      if (userSubscription.trainerId && isProd) {
        await prisma.user.update({
          where: { id: userSubscription.userId },
          data: { trainerId: null },
        })
        console.info(
          `Removed trainer assignment for user ${userSubscription.userId}`,
        )
      }
    }

    // Track subscription deleted event
    captureServerEvent({
      distinctId: userSubscription.userId,
      event: ServerEvent.SUBSCRIPTION_DELETED,
      properties: {
        stripeSubscriptionId: subscription.id,
        packageName: userSubscription.package.name,
        isUpgradeCancellation,
      },
    })
  } catch (error) {
    console.error('Error handling subscription deleted:', error)
    const err = error instanceof Error ? error : new Error(String(error))
    captureServerException(err, undefined, {
      webhook: 'subscription-deleted',
      stripeSubscriptionId: subscription.id,
    })
    throw error
  }
}

async function disableSubscriptionAccess(stripeSubscriptionId: string) {
  const now = new Date()

  await prisma.userSubscription.updateMany({
    where: { stripeSubscriptionId },
    data: {
      status: SubscriptionStatus.CANCELLED,
      endDate: now, // Immediately expire subscription to disable access

      // Clear grace period settings to prevent continued access
      isInGracePeriod: false,
      gracePeriodEnd: null,
      failedPaymentRetries: 0,

      // Clear trial settings to prevent continued access
      isTrialActive: false,
    },
  })
}

async function sendCancellationEmail(
  userSubscription: UserSubscription & {
    user: User & { profile?: UserProfile | null }
    package: PackageTemplate
  },
) {
  if (userSubscription.user.email && userSubscription.package) {
    try {
      await sendEmail.subscriptionDeleted(userSubscription.user.email, {
        userName: userSubscription.user.profile?.firstName,
        packageName: userSubscription.package.name,
      })
      console.info(
        `📧 Subscription deletion email sent to ${userSubscription.user.email}`,
      )
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError)
    }
  }
}

async function sendUpgradeCreditEmail(
  userSubscription: UserSubscription & {
    user: User & { profile?: UserProfile | null }
    package: PackageTemplate
  },
  stripeSubscription: Stripe.Subscription,
) {
  if (!userSubscription.user.email) return

  try {
    // Retrieve the cancellation invoice to get the credit amount
    const invoices = await stripe.invoices.list({
      subscription: stripeSubscription.id,
      limit: 1,
    })

    const creditAmount =
      invoices.data[0]?.total && invoices.data[0].total < 0
        ? Math.abs(invoices.data[0].total / 100)
        : 0
    const currency = invoices.data[0]?.currency?.toUpperCase() || 'USD'

    // Find the new coaching subscription to get next billing details
    const coachingSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: userSubscription.userId,
        status: SubscriptionStatus.ACTIVE,
        package: { stripeLookupKey: STRIPE_LOOKUP_KEYS.PREMIUM_COACHING },
      },
      include: { package: true },
    })

    if (!coachingSubscription || !coachingSubscription.stripeSubscriptionId) {
      console.warn(
        `Could not find active coaching subscription for user ${userSubscription.userId}`,
      )
      return
    }

    // Retrieve the coaching subscription from Stripe to get pricing
    const stripeCoachingSub = await stripe.subscriptions.retrieve(
      coachingSubscription.stripeSubscriptionId,
    )

    const coachingPrice =
      stripeCoachingSub.items?.data[0]?.price?.unit_amount || 0
    const coachingPriceFormatted = (coachingPrice / 100).toFixed(2)
    const amountAfterCredit = (coachingPrice / 100 - creditAmount).toFixed(2)

    // Format next billing date - use items.data[0].current_period_end as per Stripe types
    const nextBillingTimestamp =
      (stripeCoachingSub.items?.data[0] as { current_period_end?: number })
        ?.current_period_end || Math.floor(Date.now() / 1000)
    const nextBillingDate = new Date(
      nextBillingTimestamp * 1000,
    ).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // Format credit date
    const creditDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // Get old package name from metadata or fallback to database
    const oldPackageName =
      stripeSubscription.metadata?.oldPackageName ||
      userSubscription.package.name

    await sendEmail.subscriptionUpgradeCredit(userSubscription.user.email, {
      userName: userSubscription.user.profile?.firstName,
      oldPackageName,
      newPackageName: coachingSubscription.package.name,
      creditAmount: creditAmount.toFixed(2),
      currency,
      creditDate,
      nextBillingDate,
      newPlanPrice: coachingPriceFormatted,
      amountAfterCredit,
    })

    console.info(
      `📧 Subscription upgrade credit email sent to ${userSubscription.user.email} (${creditAmount.toFixed(2)} ${currency})`,
    )
  } catch (emailError) {
    console.error('Failed to send upgrade credit email:', emailError)
  }
}
