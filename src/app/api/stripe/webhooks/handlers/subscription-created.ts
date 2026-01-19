import Stripe from 'stripe'

import {
  PackageTemplate,
  SubscriptionStatus,
  User,
  UserProfile,
} from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email/send-mail'
import { reportTransaction } from '@/lib/external-reporting/report-transaction'
import { getBaseUrl } from '@/lib/get-base-url'
import {
  ServerEvent,
  captureServerEvent,
  captureServerException,
} from '@/lib/posthog-server'
import {
  STRIPE_LOOKUP_KEYS,
  resolvePriceIdToLookupKey,
} from '@/lib/stripe/lookup-keys'
import { stripe } from '@/lib/stripe/stripe'
import { createSupportChatForUser } from '@/lib/support-chat'

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
    const subscriptionItems = subscription.items?.data ?? []
    const periodStarts = subscriptionItems
      .map((item) => item.current_period_start)
      .filter((value): value is number => typeof value === 'number')
    const periodEnds = subscriptionItems
      .map((item) => item.current_period_end)
      .filter((value): value is number => typeof value === 'number')

    // Stripe API 2025-03-31+: period fields live on subscription items.
    // For flexible subscriptions with multiple items:
    // - Start: latest item start
    // - End: earliest item end
    const currentPeriodStart = periodStarts.length
      ? Math.max(...periodStarts)
      : null
    const currentPeriodEnd = periodEnds.length ? Math.min(...periodEnds) : null

    if (!currentPeriodStart || !currentPeriodEnd) {
      console.error(
        `[subscription-created] Missing current period for subscription ${subscription.id}`,
      )
      return
    }

    const startDate = new Date(currentPeriodStart * 1000)
    const endDate = new Date(currentPeriodEnd * 1000)

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

    // Resolve price ID to lookup key
    const lookupKey = await resolvePriceIdToLookupKey(priceId)

    if (!lookupKey) {
      console.error(`Could not resolve price ID ${priceId} to lookup key`)
      return
    }

    // Extract platform/token from Stripe subscription metadata (for Google reporting)
    const metaPlatform = subscription.metadata?.platform
    const originPlatform =
      metaPlatform === 'android' || metaPlatform === 'ios' ? metaPlatform : null
    const externalOfferToken = subscription.metadata?.extToken || null
    const initialStripeInvoiceId =
      typeof subscription.latest_invoice === 'string'
        ? subscription.latest_invoice
        : subscription.latest_invoice?.id || null

    // Create new subscription record
    await createUserSubscription({
      user,
      packageTemplate,
      subscription,
      lookupKey,
      startDate,
      endDate,
      trialStart,
      trialEnd,
      isTrial,
      assignedTrainerId,
      originPlatform,
      externalOfferToken,
      initialStripeInvoiceId,
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
      originPlatform,
      hasExternalOfferToken: !!externalOfferToken,
      initialStripeInvoiceId,
    })

    // Report initial purchase to Google (Android only)
    // Done here to avoid race condition with invoice.payment_succeeded
    if (
      originPlatform === 'android' &&
      externalOfferToken &&
      initialStripeInvoiceId
    ) {
      try {
        // Fetch invoice for amount/currency
        const invoice = await stripe.invoices.retrieve(initialStripeInvoiceId)
        const amount = invoice.amount_paid || invoice.total || 0

        console.info(
          '[GOOGLE_REPORTING][SUBSCRIPTION_CREATED] Reporting initial purchase:',
          {
            userId: user.id,
            invoiceId: initialStripeInvoiceId,
            amount,
            currency: invoice.currency,
            lookupKey,
          },
        )

        await reportTransaction({
          userId: user.id,
          stripeTransactionId: initialStripeInvoiceId,
          amount,
          currency: invoice.currency || 'usd',
          stripeLookupKey: lookupKey as Parameters<
            typeof reportTransaction
          >[0]['stripeLookupKey'],
          transactionType: 'purchase',
          platform: 'android',
          externalOfferToken,
        })

        console.info(
          '[GOOGLE_REPORTING][SUBSCRIPTION_CREATED] Report sent successfully',
        )
      } catch (reportError) {
        // Log but don't fail subscription creation
        console.error(
          '[GOOGLE_REPORTING][SUBSCRIPTION_CREATED] Failed to report:',
          reportError,
        )
      }
    }

    // Mark customer as having used a trial in Stripe
    if (isTrial) {
      await stripe.customers.update(customerId, {
        metadata: { hasUsedTrial: 'true' },
      })
    }

    // Send welcome email
    await sendWelcomeEmail(user, packageTemplate, false)

    // Create support chat for user after successful subscription
    await createSupportChatForUser(user.id)

    // Track subscription created event
    captureServerEvent({
      distinctId: user.id,
      event: ServerEvent.SUBSCRIPTION_CREATED,
      properties: {
        packageName: packageTemplate.name,
        packageId: packageTemplate.id,
        stripeSubscriptionId: subscription.id,
        platform: originPlatform,
        isTrialing: isTrial,
        lookupKey,
      },
    })

    // If new subscription is coaching, pause any existing yearly premium
    const isCoaching = lookupKey === STRIPE_LOOKUP_KEYS.PREMIUM_COACHING

    if (isCoaching) {
      const existingYearly = await prisma.userSubscription.findFirst({
        where: {
          userId: user.id,
          status: SubscriptionStatus.ACTIVE,
          package: {
            stripeLookupKey: 'premium_yearly',
            duration: 'YEARLY',
          },
        },
      })

      if (existingYearly?.stripeSubscriptionId) {
        try {
          await stripe.subscriptions.update(
            existingYearly.stripeSubscriptionId,
            {
              pause_collection: {
                behavior: 'void',
              },
              metadata: {
                pausedForCoaching: 'true',
                pausedAt: new Date().toISOString(),
              },
            },
          )
          console.info(
            `✅ Paused yearly subscription ${existingYearly.stripeSubscriptionId}`,
          )
        } catch (error) {
          console.error('Failed to pause yearly subscription:', error)
        }
      }
    }
  } catch (error) {
    console.error('Error handling subscription created:', error)
    const err = error instanceof Error ? error : new Error(String(error))
    captureServerException(err, undefined, {
      webhook: 'subscription-created',
      stripeSubscriptionId: subscription.id,
    })
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
  lookupKey,
  startDate,
  endDate,
  trialStart,
  trialEnd,
  isTrial,
  assignedTrainerId,
  originPlatform,
  externalOfferToken,
  initialStripeInvoiceId,
}: {
  user: User & { profile?: UserProfile | null }
  packageTemplate: PackageTemplate
  subscription: Stripe.Subscription
  lookupKey: string
  startDate: Date
  endDate: Date
  trialStart: Date | null
  trialEnd: Date | null
  isTrial: boolean
  assignedTrainerId?: string
  originPlatform: string | null
  externalOfferToken: string | null
  initialStripeInvoiceId: string | null
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
      stripeLookupKey: lookupKey,

      // Trial period setup
      trialStart,
      trialEnd,
      isTrialActive: isTrial || false,

      // External offers (Google Play reporting)
      originPlatform,
      externalOfferToken,
      initialStripeInvoiceId,
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
        dashboardUrl: `${getBaseUrl()}/fitspace/workout`,
      })
      console.info(`📧 Welcome email sent to ${user.email}`)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
    }
  }
}
