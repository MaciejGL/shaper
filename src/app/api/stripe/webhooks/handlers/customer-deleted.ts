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
import { getBaseUrl } from '@/lib/get-base-url'
import { captureServerException } from '@/lib/posthog-server'

export async function handleCustomerDeleted(customer: Stripe.Customer) {
  console.info('🗑️ Customer deleted:', customer.id)

  try {
    const user = await findUserByCustomerId(customer.id)

    if (!user) {
      console.warn(`No user found for deleted Stripe customer: ${customer.id}`)
      return
    }

    console.info(`Found user ${user.id} for deleted customer ${customer.id}`)

    // Cancel all active subscriptions
    const activeSubscriptions = await cancelActiveSubscriptions(user)

    // Clear the Stripe customer ID from the user record
    await clearStripeCustomerId(user.id)

    console.info(`✅ Cleared Stripe customer ID for user ${user.id}`)

    // Send notification email about account changes
    await sendCustomerDeletionEmail(user, activeSubscriptions)

    console.info(
      `🗑️ Successfully processed customer deletion for user ${user.id} (${user.email})`,
    )
  } catch (error) {
    console.error('Error handling customer deleted:', error)
    const err = error instanceof Error ? error : new Error(String(error))
    captureServerException(err, undefined, {
      webhook: 'customer-deleted',
      stripeCustomerId: customer.id,
    })
  }
}

async function findUserByCustomerId(stripeCustomerId: string) {
  return await prisma.user.findUnique({
    where: { stripeCustomerId },
    include: {
      profile: true,
      subscriptions: {
        include: {
          package: true,
        },
      },
    },
  })
}

async function cancelActiveSubscriptions(
  user: User & {
    subscriptions: (UserSubscription & { package: PackageTemplate })[]
  },
) {
  const activeSubscriptions = user.subscriptions.filter(
    (sub: UserSubscription) =>
      sub.status === SubscriptionStatus.ACTIVE ||
      sub.status === SubscriptionStatus.CANCELLED_ACTIVE ||
      sub.status === SubscriptionStatus.PENDING,
  )

  if (activeSubscriptions.length > 0) {
    await prisma.userSubscription.updateMany({
      where: {
        userId: user.id,
        status: {
          in: [
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.CANCELLED_ACTIVE,
            SubscriptionStatus.PENDING,
          ],
        },
      },
      data: {
        status: SubscriptionStatus.CANCELLED,
        // Clear Stripe-related fields since customer no longer exists
        isInGracePeriod: false,
        gracePeriodEnd: null,
      },
    })

    console.info(
      `✅ Cancelled ${activeSubscriptions.length} active subscriptions for user ${user.id}`,
    )
  }

  return activeSubscriptions
}

async function clearStripeCustomerId(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: null,
    },
  })
}

async function sendCustomerDeletionEmail(
  user: User & { profile?: UserProfile | null },
  activeSubscriptions: (UserSubscription & { package: PackageTemplate })[],
) {
  if (user.email && activeSubscriptions.length > 0) {
    try {
      const latestEndDate = new Date(
        Math.max(...activeSubscriptions.map((sub) => sub.endDate.getTime())),
      )

      await sendEmail.subscriptionCancelled(user.email, {
        userName: user.profile?.firstName,
        packageName: activeSubscriptions
          .map((sub) => sub.package.name)
          .join(', '),
        endDate: latestEndDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        reactivateUrl: `${getBaseUrl()}/account-management`,
      })
      console.info(
        `📧 Customer deletion notification email sent to ${user.email}`,
      )
    } catch (emailError) {
      console.error(
        'Failed to send customer deletion notification email:',
        emailError,
      )
    }
  }
}
