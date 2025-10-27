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

    // Send cancellation email
    await sendCancellationEmail(userSubscription)

    // If coaching ended, resume any paused yearly subscription
    const wasCoaching =
      userSubscription.package.stripeLookupKey === 'premium_coaching'

    if (wasCoaching) {
      console.info(`Coaching ended for user ${userSubscription.userId}`)

      // Find paused yearly subscriptions
      const allYearly = await prisma.userSubscription.findMany({
        where: {
          userId: userSubscription.userId,
          status: SubscriptionStatus.ACTIVE,
          package: { stripeLookupKey: 'premium_yearly' },
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
      if (userSubscription.trainerId) {
        await prisma.user.update({
          where: { id: userSubscription.userId },
          data: { trainerId: null },
        })
        console.info(
          `Removed trainer assignment for user ${userSubscription.userId}`,
        )
      }
    }
  } catch (error) {
    console.error('Error handling subscription deleted:', error)
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
