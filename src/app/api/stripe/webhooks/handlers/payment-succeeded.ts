import Stripe from 'stripe'

import { GQLNotificationType } from '@/generated/graphql-server'
import {
  Prisma,
  ServiceType,
  SubscriptionStatus,
  UserSubscription,
} from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email/send-mail'
import { reportTransaction } from '@/lib/external-reporting/report-transaction'
import { notifyTrainerSubscriptionPayment } from '@/lib/notifications/push-notification-service'
import {
  ServerEvent,
  captureServerEvent,
  captureServerException,
} from '@/lib/posthog-server'
import { STRIPE_LOOKUP_KEYS } from '@/lib/stripe/lookup-keys'
import { stripe } from '@/lib/stripe/stripe'
import { createTasksForDelivery } from '@/server/models/service-task/factory'

import { StripeServiceType } from '../../enums'

// Extend Stripe Invoice type to include fields that exist in API
interface InvoiceWithSubscription extends Stripe.Invoice {
  subscription?: string | null
  payment_intent?: string | Stripe.PaymentIntent | null
}

export async function handlePaymentSucceeded(invoice: InvoiceWithSubscription) {
  try {
    let stripeSubscription: Stripe.Subscription | null = null
    let subscription: UserSubscription | null = null

    // Get Stripe customer ID from invoice.
    // Note: invoice webhook payload often omits invoice.subscription and line-item price fields.
    const customerId =
      typeof invoice.customer === 'string'
        ? invoice.customer
        : (invoice.customer?.id ?? null)

    // #region agent log
    console.info('[GOOGLE_REPORTING][PAYMENT_SUCCEEDED][INVOICE]', {
      invoiceId: invoice.id,
      billingReason: invoice.billing_reason,
      hasInvoiceSubscription: !!invoice.subscription,
      hasCustomer: !!customerId,
    })
    // #endregion

    // Method 1: Find Stripe subscription by matching latest_invoice == invoice.id.
    // This is robust for upgrades (multiple subs) and works without expanding invoice lines.
    if (customerId && invoice.id) {
      const stripeSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
      })

      stripeSubscription =
        stripeSubscriptions.data.find((sub) => {
          const latestInvoice =
            typeof sub.latest_invoice === 'string'
              ? sub.latest_invoice
              : sub.latest_invoice?.id
          return latestInvoice === invoice.id
        }) || null

      // #region agent log
      console.info('[GOOGLE_REPORTING][PAYMENT_SUCCEEDED][MATCH_BY_LATEST]', {
        invoiceId: invoice.id,
        subscriptionsCount: stripeSubscriptions.data.length,
        matched: !!stripeSubscription,
        matchedStripeSubscriptionId: stripeSubscription?.id ?? null,
        metaPlatform: stripeSubscription?.metadata?.platform ?? null,
        hasExtToken: !!stripeSubscription?.metadata?.extToken,
      })
      // #endregion

      if (stripeSubscription) {
        subscription = await findSubscriptionById(stripeSubscription.id)
      }
    }

    // Method 2: Fallback to direct invoice.subscription field
    if (!subscription && invoice.subscription) {
      const subscriptionId =
        typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice.subscription
      subscription = await findSubscriptionById(subscriptionId)

      // Also fetch the Stripe subscription for metadata
      if (subscription?.stripeSubscriptionId) {
        stripeSubscription = await stripe.subscriptions.retrieve(
          subscription.stripeSubscriptionId,
        )
      }
    }

    if (!subscription) {
      console.info(`No subscription found for invoice ${invoice.id} - skipping`)
      return
    }

    await updateSubscriptionAfterPayment(subscription, invoice, stripeSubscription)

    // Create new service delivery for COACHING_COMPLETE subscriptions
    await createRecurringServiceDelivery(subscription, invoice)

    console.info(
      `✅ Payment processed for subscription ${subscription.stripeSubscriptionId} (invoice: ${invoice.id})`,
    )

    const isInitialPurchase = invoice.billing_reason === 'subscription_create'

    // Read platform and token from DB subscription (saved in subscription-created.ts)
    const platform: 'ios' | 'android' | null =
      subscription.originPlatform === 'android' ||
      subscription.originPlatform === 'ios'
        ? subscription.originPlatform
        : null

    // #region agent log
    console.info('[GOOGLE_REPORTING][PAYMENT_SUCCEEDED][META]', {
      invoiceId: invoice.id,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      dbSubscriptionId: subscription.id,
      isInitialPurchase,
      platform,
      hasExtToken: !!subscription.externalOfferToken,
      hasInitialStripeInvoiceId: !!subscription.initialStripeInvoiceId,
    })
    // #endregion

    const amountForReporting =
      typeof invoice.amount_paid === 'number' && invoice.amount_paid > 0
        ? invoice.amount_paid
        : typeof invoice.total === 'number'
          ? invoice.total
          : typeof invoice.amount_due === 'number'
            ? invoice.amount_due
            : 0

    // Get package template for reporting decision
    const packageTemplate = await prisma.packageTemplate.findUnique({
      where: { id: subscription.packageId },
    })

    // Only report premium_monthly and premium_yearly from Android
    const reportableLookupKeys: string[] = [
      STRIPE_LOOKUP_KEYS.PREMIUM_MONTHLY,
      STRIPE_LOOKUP_KEYS.PREMIUM_YEARLY,
    ]
    const isReportable =
      platform === 'android' &&
      packageTemplate?.stripeLookupKey &&
      reportableLookupKeys.includes(packageTemplate.stripeLookupKey)

    // #region agent log
    console.info('[GOOGLE_REPORTING][PAYMENT_SUCCEEDED][REPORT_CHECK]', {
      invoiceId: invoice.id,
      isInitialPurchase,
      platform,
      stripeLookupKey: packageTemplate?.stripeLookupKey ?? null,
      isReportable,
      hasExternalOfferToken: !!subscription.externalOfferToken,
      hasInitialStripeInvoiceId: !!subscription.initialStripeInvoiceId,
    })
    // #endregion

    if (isReportable && packageTemplate?.stripeLookupKey) {
      if (isInitialPurchase) {
        console.info('[GOOGLE_REPORTING][PAYMENT_SUCCEEDED][CALLING_REPORT]', {
          type: 'purchase',
          invoiceId: invoice.id,
          amount: amountForReporting,
          currency: invoice.currency,
          hasToken: !!subscription.externalOfferToken,
        })
        await reportTransaction({
          userId: subscription.userId,
          stripeTransactionId: invoice.id!,
          amount: amountForReporting,
          currency: invoice.currency || 'usd',
          stripeLookupKey:
            packageTemplate.stripeLookupKey as (typeof STRIPE_LOOKUP_KEYS)[keyof typeof STRIPE_LOOKUP_KEYS],
          transactionType: 'purchase',
          platform,
          externalOfferToken: subscription.externalOfferToken || undefined,
        })
        console.info('[GOOGLE_REPORTING][PAYMENT_SUCCEEDED][REPORT_DONE]', {
          type: 'purchase',
          invoiceId: invoice.id,
        })
      } else {
        // Renewal: use stored origin platform and initial invoice ID
        const storedPlatform = subscription.originPlatform
        const renewalPlatform =
          storedPlatform === 'android' ? storedPlatform : null

        // Only report renewal if original was from Android
        if (renewalPlatform) {
          console.info(
            '[GOOGLE_REPORTING][PAYMENT_SUCCEEDED][CALLING_REPORT]',
            {
              type: 'renewal',
              invoiceId: invoice.id,
              amount: amountForReporting,
              currency: invoice.currency,
              hasInitialInvoiceId: !!subscription.initialStripeInvoiceId,
            },
          )
          await reportTransaction({
            userId: subscription.userId,
            stripeTransactionId: invoice.id!,
            amount: amountForReporting,
            currency: invoice.currency || 'usd',
            stripeLookupKey:
              packageTemplate.stripeLookupKey as (typeof STRIPE_LOOKUP_KEYS)[keyof typeof STRIPE_LOOKUP_KEYS],
            transactionType: 'renewal',
            platform: renewalPlatform,
            initialExternalTransactionId:
              subscription.initialStripeInvoiceId || undefined,
          })
          console.info('[GOOGLE_REPORTING][PAYMENT_SUCCEEDED][REPORT_DONE]', {
            type: 'renewal',
            invoiceId: invoice.id,
          })
        } else {
          console.info('[GOOGLE_REPORTING][PAYMENT_SUCCEEDED][SKIP_RENEWAL]', {
            invoiceId: invoice.id,
            reason: 'originPlatform not android',
            storedPlatform,
          })
        }
      }
    } else {
      console.info('[GOOGLE_REPORTING][PAYMENT_SUCCEEDED][NOT_REPORTABLE]', {
        invoiceId: invoice.id,
        platform,
        stripeLookupKey: packageTemplate?.stripeLookupKey ?? null,
      })
    }

    // Notify trainer about subscription payment
    if (
      subscription.trainerId &&
      invoice.billing_reason !== 'subscription_create'
    ) {
      await notifyTrainerAboutSubscriptionPayment({
        trainerId: subscription.trainerId,
        clientId: subscription.userId,
        subscription,
        invoice,
      })
    }

    // If this is a coaching payment, check if user has paused yearly to extend pause
    if (subscription?.stripeSubscriptionId) {
      const coachingSub = await prisma.userSubscription.findFirst({
        where: { stripeSubscriptionId: subscription.stripeSubscriptionId },
        include: { package: true },
      })

      const isCoachingPayment =
        coachingSub?.package.stripeLookupKey ===
        STRIPE_LOOKUP_KEYS.PREMIUM_COACHING

      if (isCoachingPayment) {
        // Find any paused yearly subscriptions for this user
        const pausedYearly = await prisma.userSubscription.findMany({
          where: {
            userId: coachingSub.userId,
            status: SubscriptionStatus.ACTIVE,
            package: { stripeLookupKey: 'premium_yearly' },
          },
        })

        for (const yearly of pausedYearly) {
          if (!yearly.stripeSubscriptionId) continue

          try {
            const stripeSub = await stripe.subscriptions.retrieve(
              yearly.stripeSubscriptionId,
            )

            // If paused for coaching, ensure pause continues
            if (
              stripeSub.pause_collection?.behavior === 'void' &&
              stripeSub.metadata?.pausedForCoaching === 'true'
            ) {
              // Update metadata to track latest coaching payment
              await stripe.subscriptions.update(yearly.stripeSubscriptionId, {
                metadata: {
                  ...stripeSub.metadata,
                  lastCoachingPayment: new Date().toISOString(),
                },
              })

              console.info(
                `✅ Extended pause for yearly subscription ${yearly.stripeSubscriptionId}`,
              )
            }
          } catch (error) {
            console.error(
              `Failed to extend pause for ${yearly.stripeSubscriptionId}:`,
              error,
            )
          }
        }
      }
    }

    // Track payment succeeded event
    if (subscription) {
      const isRenewal = invoice.billing_reason !== 'subscription_create'
      captureServerEvent({
        distinctId: subscription.userId,
        event: ServerEvent.PAYMENT_SUCCEEDED,
        properties: {
          invoiceId: invoice.id,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          isRenewal,
          stripeSubscriptionId: subscription.stripeSubscriptionId,
        },
      })
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error)
    const err = error instanceof Error ? error : new Error(String(error))
    captureServerException(err, undefined, {
      webhook: 'payment-succeeded',
      invoiceId: invoice.id,
    })
  }
}

async function findSubscriptionById(stripeSubscriptionId: string) {
  return await prisma.userSubscription.findFirst({
    where: { stripeSubscriptionId },
  })
}

async function updateSubscriptionAfterPayment(
  subscription: UserSubscription,
  invoice: Stripe.Invoice,
  stripeSubscription: Stripe.Subscription | null,
) {
  // Prepare update data
  const updateData: Prisma.UserSubscriptionUpdateInput = {
    status: SubscriptionStatus.ACTIVE,

    // Clear grace period and reset retry count
    isInGracePeriod: false,
    gracePeriodEnd: null,
    failedPaymentRetries: 0,
    lastPaymentAttempt: new Date(),
  }

  // DON'T update endDate for trial subscriptions OR initial setup invoices
  // Initial setup invoices have period_end = period_start (setup date)
  // The subscription.created webhook already set the correct endDate
  const invoicePeriodEnd = invoice.period_end
  const invoicePeriodStart = invoice.period_start
  const isInitialSetupInvoice = invoicePeriodEnd === invoicePeriodStart

  const stripeSubscriptionItems = stripeSubscription?.items?.data ?? []
  const stripePeriodEnds = stripeSubscriptionItems
    .map((item) => item.current_period_end)
    .filter((value): value is number => typeof value === 'number')

  // Stripe API 2025-03-31+: period fields live on subscription items.
  // For flexible subscriptions with multiple items, endDate should be the earliest item end.
  const stripePeriodEnd = stripePeriodEnds.length
    ? Math.min(...stripePeriodEnds)
    : null

  if (!subscription.isTrialActive) {
    // Prefer Stripe subscription's current_period_end (source of truth for renewals)
    if (stripePeriodEnd) {
      updateData.endDate = new Date(stripePeriodEnd * 1000)
    } else if (invoicePeriodEnd && !isInitialSetupInvoice) {
      // Fallback: invoice period end (can be misleading for setup/proration invoices)
      updateData.endDate = new Date(invoicePeriodEnd * 1000)
    }
  }

  await prisma.userSubscription.update({
    where: { id: subscription.id },
    data: updateData,
  })
}

/**
 * Creates a new service delivery for recurring COACHING_COMPLETE subscriptions
 * when a monthly payment succeeds
 */
async function createRecurringServiceDelivery(
  subscription: UserSubscription,
  invoice: Stripe.Invoice,
) {
  try {
    // Only create deliveries for COACHING_COMPLETE services
    const packageTemplate = await prisma.packageTemplate.findUnique({
      where: { id: subscription.packageId },
    })

    if (!packageTemplate) {
      console.error(
        `Package template not found for subscription: ${subscription.id}`,
      )
      return
    }

    // Check if this package is COACHING_COMPLETE
    const packageMetadata = packageTemplate.metadata as Record<string, unknown>
    const serviceTypeString = packageMetadata?.service_type as string

    if (serviceTypeString !== StripeServiceType.COACHING_COMPLETE) {
      // Not a COACHING_COMPLETE service, no recurring delivery needed
      return
    }

    // Don't create delivery for the first payment (already handled by checkout.session.completed)
    // Check if this is a recurring payment by looking at billing reason
    if (invoice.billing_reason === 'subscription_create') {
      console.info(
        `Skipping delivery creation for initial subscription payment: ${subscription.id}`,
      )
      return
    }

    if (!subscription.trainerId) {
      console.error(
        `No trainer ID found for COACHING_COMPLETE subscription: ${subscription.id}`,
      )
      return
    }

    // Get current month/year for delivery naming
    const currentDate = new Date()
    const monthYear = currentDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })

    // Create new service delivery with recurring tasks (meetings only, not plans)
    const delivery = await prisma.serviceDelivery.create({
      data: {
        stripePaymentIntentId: invoice.id!,
        trainerId: subscription.trainerId!,
        clientId: subscription.userId,
        serviceType: ServiceType.COACHING_COMPLETE,
        packageName: `${packageTemplate.name} - ${monthYear}`,
        quantity: 1,
        status: 'PENDING',
        metadata: {
          subscriptionId: subscription.id,
          stripeSubscriptionId: subscription.stripeSubscriptionId,
          invoiceId: invoice.id,
          billingPeriodStart: invoice.period_start,
          billingPeriodEnd: invoice.period_end,
          recurringPayment: true,
          monthYear,
        } as Prisma.InputJsonValue,
      },
    })

    // Create ONLY recurring tasks (meetings) - plans are one-time and already delivered
    await createTasksForDelivery(
      delivery.id,
      ServiceType.COACHING_COMPLETE,
      true, // isRecurringPayment = true -> only creates meeting tasks
    )

    console.info(
      `✅ Created recurring service delivery for ${monthYear}: ${delivery.id} (Client: ${subscription.userId}, Trainer: ${subscription.trainerId})`,
    )
  } catch (error) {
    console.error('Failed to create recurring service delivery:', error)
  }
}

/**
 * Notify trainer about successful subscription payment
 * Sends email, push notification, and in-app notification
 */
async function notifyTrainerAboutSubscriptionPayment({
  trainerId,
  clientId,
  subscription,
  invoice,
}: {
  trainerId: string
  clientId: string
  subscription: UserSubscription
  invoice: Stripe.Invoice
}) {
  try {
    // Get trainer and client details
    const [trainer, client, packageTemplate] = await Promise.all([
      prisma.user.findUnique({
        where: { id: trainerId },
        include: { profile: true },
      }),
      prisma.user.findUnique({
        where: { id: clientId },
        include: { profile: true },
      }),
      prisma.packageTemplate.findUnique({
        where: { id: subscription.packageId },
      }),
    ])

    if (!trainer || !client || !packageTemplate) {
      console.error('Missing trainer, client, or package data for notification')
      return
    }

    const trainerName =
      trainer.profile?.firstName && trainer.profile?.lastName
        ? `${trainer.profile.firstName} ${trainer.profile.lastName}`
        : trainer.name || 'Trainer'

    const clientName =
      client.profile?.firstName && client.profile?.lastName
        ? `${client.profile.firstName} ${client.profile.lastName}`
        : client.name || client.email

    // Format amount
    const amount = invoice.amount_paid
      ? (invoice.amount_paid / 100).toFixed(2)
      : '0.00'
    const currency = invoice.currency || 'usd'

    // Determine billing period
    const billingPeriod = packageTemplate.stripeLookupKey?.includes('yearly')
      ? 'yearly'
      : 'monthly'

    // Calculate next billing date
    const nextBillingDate = invoice.period_end
      ? new Date(invoice.period_end * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'Unknown'

    // Client profile URL
    const clientProfileUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/trainer/clients/${clientId}`

    // Send email notification
    await sendEmail.subscriptionPaymentReceived(trainer.email, {
      trainerName,
      clientName,
      clientEmail: client.email,
      subscriptionType: packageTemplate.name,
      amount,
      currency,
      billingPeriod,
      nextBillingDate,
      clientProfileUrl,
    })

    // Send push notification
    await notifyTrainerSubscriptionPayment(
      trainerId,
      clientName,
      packageTemplate.name,
      clientId,
    )

    // Create in-app notification
    await prisma.notification.create({
      data: {
        userId: trainerId,
        createdBy: clientId,
        type: GQLNotificationType.SubscriptionPaymentReceived,
        message: `${clientName}'s ${packageTemplate.name} subscription has been renewed - ${amount} ${currency.toUpperCase()}`,
        link: `/trainer/clients/${clientId}`,
        relatedItemId: subscription.id,
      },
    })

    console.info(
      `✅ Trainer ${trainerName} notified about subscription payment from ${clientName}`,
    )
  } catch (error) {
    console.error('Failed to notify trainer about subscription payment:', error)
    // Don't throw - payment is already complete
  }
}
