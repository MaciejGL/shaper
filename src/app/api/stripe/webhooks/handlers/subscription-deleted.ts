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
