import Stripe from 'stripe'

import { User, UserProfile, UserSubscription } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email/send-mail'
import { getBaseUrl } from '@/lib/get-base-url'

export async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  console.info('\n\n⏰ Trial will end:\n\n', subscription)

  try {
    const userSubscription = await findUserSubscription(subscription.id)

    if (!userSubscription) {
      console.error(`Subscription not found: ${subscription.id}`)
      return
    }

    // Update trial status
    await updateTrialStatus(userSubscription.id)

    console.info(`⏰ Trial ending soon for user ${userSubscription.user.email}`)

    // Send trial ending email
    await sendTrialEndingEmail(userSubscription)
  } catch (error) {
    console.error('Error handling trial will end:', error)
  }
}

async function findUserSubscription(stripeSubscriptionId: string) {
  return await prisma.userSubscription.findFirst({
    where: { stripeSubscriptionId },
    include: { user: { include: { profile: true } } },
  })
}

async function updateTrialStatus(subscriptionId: string) {
  await prisma.userSubscription.update({
    where: { id: subscriptionId },
    data: {
      isTrialActive: false,
    },
  })
}

async function sendTrialEndingEmail(
  userSubscription: UserSubscription & {
    user: User & { profile?: UserProfile | null }
  },
) {
  const packageTemplate = await prisma.packageTemplate.findUnique({
    where: { id: userSubscription.packageId },
  })

  if (packageTemplate && userSubscription.user.email) {
    // Calculate days remaining in trial
    const trialEnd = userSubscription.trialEnd
    const daysRemaining = trialEnd
      ? Math.max(
          0,
          Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        )
      : 3

    try {
      await sendEmail.trialEnding(userSubscription.user.email, {
        userName: userSubscription.user.profile?.firstName,
        daysRemaining,
        packageName: packageTemplate.name,
        upgradeUrl: `${getBaseUrl()}/fitspace/settings`,
      })
      console.info(
        `📧 Trial ending email sent to ${userSubscription.user.email}`,
      )
    } catch (emailError) {
      console.error('Failed to send trial ending email:', emailError)
    }
  }
}
