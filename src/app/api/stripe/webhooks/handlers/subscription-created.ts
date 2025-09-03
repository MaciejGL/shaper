import Stripe from 'stripe'

import {
  PackageTemplate,
  SubscriptionStatus,
  User,
  UserProfile,
} from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email/send-mail'
import { stripe } from '@/lib/stripe/stripe'

import {
  findPackageByStripePriceId,
  findUserByStripeCustomerId,
} from '../utils/shared'

export async function handleSubscriptionCreated(
  subscription: Stripe.Subscription,
) {
  try {
    const customerId = subscription.customer as string
    const priceId = subscription.items.data[0]?.price.id
    // Use Stripe's subscription data directly - trust their calculations
    const startDate = new Date(
      subscription.items.data[0].current_period_start * 1000,
    )
    const endDate = new Date(
      subscription.items.data[0].current_period_end * 1000,
    )

    const { isTrial, trialStart, trialEnd } = extractTrialInfo(subscription)

    if (!priceId) {
      console.error('No price ID found in subscription')
      return
    }

    // Find user and package
    const [user, packageTemplate] = await Promise.all([
      findUserByStripeCustomerId(customerId),
      findPackageByStripePriceId(priceId),
    ])

    if (!user) {
      console.error(`User not found for Stripe customer: ${customerId}`)
      return
    }

    if (!packageTemplate) {
      console.error(`Package not found for Stripe price: ${priceId}`)
      return
    }

    // Handle reactivation if needed
    await handleReactivation(subscription, user.id)

    // Handle trainer assignment from offers
    const assignedTrainerId = await handleTrainerAssignment(
      subscription,
      packageTemplate.trainerId || undefined,
    )

    // Create new subscription record
    await createUserSubscription({
      user,
      packageTemplate,
      subscription,
      priceId,
      startDate,
      endDate,
      trialStart,
      trialEnd,
      isTrial,
      assignedTrainerId,
    })

    // Log what was stored in database
    console.info(`💾 Created subscription record:`, {
      userId: user.id,
      packageId: packageTemplate.id,
      packageName: packageTemplate.name,
      stripeSubscriptionId: subscription.id,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      trialStart: trialStart?.toISOString() || null,
      trialEnd: trialEnd?.toISOString() || null,
      isTrialActive: isTrial,
      trainerId: assignedTrainerId || null,
    })

    // Mark customer as having used a trial in Stripe
    if (isTrial) {
      await stripe.customers.update(customerId, {
        metadata: { hasUsedTrial: 'true' },
      })
    }

    // Send welcome email
    await sendWelcomeEmail(user, packageTemplate, false)
  } catch (error) {
    console.error('Error handling subscription created:', error)
  }
}

function extractTrialInfo(subscription: Stripe.Subscription) {
  const isTrial =
    subscription.trial_end !== null && subscription.trial_end !== undefined
  const trialStart =
    isTrial && subscription.trial_start
      ? new Date(subscription.trial_start * 1000)
      : null
  const trialEnd =
    isTrial && subscription.trial_end
      ? new Date(subscription.trial_end * 1000)
      : null

  return { isTrial, trialStart, trialEnd }
}

async function handleReactivation(
  subscription: Stripe.Subscription,
  userId: string,
) {
  const isReactivation = subscription.metadata?.isReactivation === 'true'
  const previousSubscriptionId = subscription.metadata?.previousSubscriptionId

  if (isReactivation && previousSubscriptionId) {
    // Mark the previous subscription as superseded
    await prisma.userSubscription.updateMany({
      where: {
        id: previousSubscriptionId,
        userId: userId,
      },
      data: {
        status: SubscriptionStatus.CANCELLED,
      },
    })
  }

  return isReactivation
}

async function handleTrainerAssignment(
  subscription: Stripe.Subscription,
  packageTrainerId?: string,
) {
  const offerToken = subscription.metadata?.offerToken
  const trainerIdFromOffer = subscription.metadata?.trainerId
  let assignedTrainerId = packageTrainerId

  // If this is from a trainer offer, mark offer as completed and assign trainer
  if (offerToken) {
    await prisma.trainerOffer.update({
      where: { token: offerToken },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    })

    // Use trainer from offer if package doesn't have one assigned
    if (!assignedTrainerId && trainerIdFromOffer) {
      assignedTrainerId = trainerIdFromOffer
      console.info(
        `🎯 Assigning trainer ${trainerIdFromOffer} from offer ${offerToken}`,
      )
    }
  }

  return assignedTrainerId
}

async function createUserSubscription({
  user,
  packageTemplate,
  subscription,
  priceId,
  startDate,
  endDate,
  trialStart,
  trialEnd,
  isTrial,
  assignedTrainerId,
}: {
  user: User & { profile?: UserProfile | null }
  packageTemplate: PackageTemplate
  subscription: Stripe.Subscription
  priceId: string
  startDate: Date
  endDate: Date
  trialStart: Date | null
  trialEnd: Date | null
  isTrial: boolean
  assignedTrainerId?: string
}) {
  await prisma.userSubscription.create({
    data: {
      userId: user.id,
      packageId: packageTemplate.id,
      trainerId: assignedTrainerId,
      status: SubscriptionStatus.ACTIVE,
      startDate,
      endDate,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,

      // Trial period setup
      trialStart,
      trialEnd,
      isTrialActive: isTrial || false,
    },
  })
}

async function sendWelcomeEmail(
  user: User & { profile?: UserProfile | null },
  packageTemplate: PackageTemplate,
  isReactivation: boolean,
) {
  if (user.email) {
    try {
      await sendEmail.subscriptionWelcome(user.email, {
        userName: user.profile?.firstName,
        packageName: packageTemplate.name,
        isReactivation,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      })
      console.info(`📧 Welcome email sent to ${user.email}`)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
    }
  }
}
