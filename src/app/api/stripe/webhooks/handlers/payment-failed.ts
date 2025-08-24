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
import { SUBSCRIPTION_CONFIG } from '@/lib/stripe/config'

export async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = invoice.id

    if (subscriptionId) {
      const subscription = await findSubscriptionWithPackage(subscriptionId)

      if (subscription) {
        const gracePeriodEnd = calculateGracePeriodEnd()
        const newRetryCount = subscription.failedPaymentRetries + 1

        await updateSubscriptionForFailedPayment(
          subscription.id,
          gracePeriodEnd,
          newRetryCount,
        )

        // Handle dunning management
        await handleDunningManagement(
          subscription,
          newRetryCount,
          subscriptionId,
        )

        // Send payment failed email
        await sendPaymentFailedEmail(subscription, newRetryCount)
      }
    }
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}

async function findSubscriptionWithPackage(stripeSubscriptionId: string) {
  return await prisma.userSubscription.findFirst({
    where: { stripeSubscriptionId },
    include: { package: true },
  })
}

function calculateGracePeriodEnd() {
  const now = new Date()
  return new Date(now.getTime() + SUBSCRIPTION_CONFIG.GRACE_PERIOD_MS)
}

async function updateSubscriptionForFailedPayment(
  subscriptionId: string,
  gracePeriodEnd: Date,
  newRetryCount: number,
) {
  await prisma.userSubscription.update({
    where: { id: subscriptionId },
    data: {
      status: SubscriptionStatus.PENDING,

      // Activate 3-day grace period
      isInGracePeriod: true,
      gracePeriodEnd,

      // Track retry attempts for dunning management
      failedPaymentRetries: newRetryCount,
      lastPaymentAttempt: new Date(),
    },
  })
}

async function handleDunningManagement(
  subscription: UserSubscription & { package: PackageTemplate },
  newRetryCount: number,
  subscriptionId: string,
) {
  if (newRetryCount >= SUBSCRIPTION_CONFIG.MAX_PAYMENT_RETRIES) {
    console.warn(
      `❌ Subscription ${subscriptionId} exceeded max retries (${newRetryCount}), will be cancelled after grace period`,
    )
  }
}

async function sendPaymentFailedEmail(
  subscription: UserSubscription & { package: PackageTemplate },
  newRetryCount: number,
) {
  const user = await prisma.user.findUnique({
    where: { id: subscription.userId },
    include: { profile: true },
  })

  const packageTemplate = await prisma.packageTemplate.findUnique({
    where: { id: subscription.packageId },
  })

  if (user?.email && packageTemplate) {
    try {
      await sendEmail.paymentFailed(user.email, {
        userName: user.profile?.firstName,
        gracePeriodDays: SUBSCRIPTION_CONFIG.GRACE_PERIOD_DAYS,
        packageName: packageTemplate.name,
        updatePaymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/fitspace/settings`,
      })
      console.info(`📧 Payment failed email sent to ${user.email}`)
    } catch (emailError) {
      console.error('Failed to send payment failed email:', emailError)
    }

    // Send grace period ending warning if needed
    await handleGracePeriodWarning(
      user,
      packageTemplate,
      subscription,
      newRetryCount,
    )
  }
}

async function handleGracePeriodWarning(
  user: User & { profile?: UserProfile | null },
  packageTemplate: PackageTemplate,
  subscription: UserSubscription,
  newRetryCount: number,
) {
  if (newRetryCount >= SUBSCRIPTION_CONFIG.MAX_PAYMENT_RETRIES) {
    const gracePeriodEnd = subscription.gracePeriodEnd
    if (gracePeriodEnd) {
      const daysUntilCancellation = Math.max(
        0,
        Math.ceil(
          (gracePeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        ),
      )

      // Send final warning email 1 day before cancellation
      if (daysUntilCancellation <= 1) {
        try {
          await sendEmail.gracePeriodEnding(user.email, {
            userName: user.profile?.firstName,
            packageName: packageTemplate.name,
            daysRemaining: daysUntilCancellation,
            updatePaymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/fitspace/settings`,
          })
          console.info(`📧 Grace period ending email sent to ${user.email}`)
        } catch (emailError) {
          console.error('Failed to send grace period ending email:', emailError)
        }
      }
    }
  }
}
