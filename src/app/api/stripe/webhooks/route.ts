import { BillingStatus, Currency, SubscriptionStatus } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

import { prisma } from '@/lib/db'
import { STRIPE_WEBHOOK_EVENTS, SUBSCRIPTION_CONFIG } from '@/lib/stripe/config'

// Extended interfaces for Stripe webhook events
interface ExpandedSubscription
  extends Omit<Stripe.Subscription, 'current_period_end' | 'trial_end'> {
  current_period_end: number
  trial_end?: number | null
}

interface ExpandedInvoice
  extends Omit<
    Stripe.Invoice,
    | 'subscription'
    | 'period_start'
    | 'period_end'
    | 'amount_paid'
    | 'amount_due'
  > {
  subscription?: string | Stripe.Subscription
  period_start?: number
  period_end?: number
  amount_paid?: number
  amount_due?: number
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('stripe-signature')
    const body = await request.text()

    // Basic webhook info
    console.info(`🔗 Webhook received: ${body.length} bytes`)

    if (!signature) {
      console.error('Missing stripe-signature header')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    if (!endpointSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET environment variable')
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 },
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    } catch (err) {
      console.error(`Webhook signature verification failed:`, err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.info(`✅ Received webhook event: ${event.type}`)

    // Handle the event
    switch (event.type) {
      case STRIPE_WEBHOOK_EVENTS.SUBSCRIPTION_CREATED:
        await handleSubscriptionCreated(
          event.data.object as Stripe.Subscription,
        )
        break

      case STRIPE_WEBHOOK_EVENTS.SUBSCRIPTION_UPDATED:
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
        )
        break

      case STRIPE_WEBHOOK_EVENTS.SUBSCRIPTION_DELETED:
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        )
        break

      case STRIPE_WEBHOOK_EVENTS.PAYMENT_SUCCEEDED:
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case STRIPE_WEBHOOK_EVENTS.PAYMENT_FAILED:
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case STRIPE_WEBHOOK_EVENTS.CHECKOUT_COMPLETED:
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        )
        break

      case STRIPE_WEBHOOK_EVENTS.PAYMENT_INTENT_SUCCEEDED:
        await handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent,
        )
        break

      case STRIPE_WEBHOOK_EVENTS.PAYMENT_INTENT_FAILED:
        await handlePaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent,
        )
        break

      case STRIPE_WEBHOOK_EVENTS.TRIAL_WILL_END:
        await handleTrialWillEnd(event.data.object as Stripe.Subscription)
        break

      default:
        console.info(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 },
    )
  }
}

// Helper Functions
async function findUserByStripeCustomerId(customerId: string) {
  return await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  })
}

async function findPackageByStripePriceId(priceId: string) {
  return await prisma.packageTemplate.findFirst({
    where: {
      OR: [
        { stripePriceIdNOK: priceId },
        { stripePriceIdEUR: priceId },
        { stripePriceIdUSD: priceId },
      ],
    },
  })
}

// Subscription Events
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.info('🎉 Subscription created:', subscription.id)

  try {
    const customerId = subscription.customer as string
    const priceId = subscription.items.data[0]?.price.id

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

    // Check if subscription has a trial
    const hasTrialPeriod =
      subscription.trial_end != null &&
      subscription.trial_end > subscription.created
    const trialStart = hasTrialPeriod
      ? new Date(subscription.created * 1000)
      : null
    const trialEnd =
      hasTrialPeriod && subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null

    // Check if this is a reactivation
    const isReactivation = subscription.metadata?.isReactivation === 'true'
    const previousSubscriptionId = subscription.metadata?.previousSubscriptionId

    if (isReactivation && previousSubscriptionId) {
      // Mark the previous subscription as superseded
      await prisma.userSubscription.updateMany({
        where: {
          id: previousSubscriptionId,
          userId: user.id,
        },
        data: {
          status: SubscriptionStatus.CANCELLED,
          // Add a note that this was superseded by reactivation
        },
      })

      console.info(
        `🔄 Marked previous subscription ${previousSubscriptionId} as superseded by reactivation`,
      )
    }

    // Create new subscription record
    await prisma.userSubscription.create({
      data: {
        userId: user.id,
        packageId: packageTemplate.id,
        trainerId: packageTemplate.trainerId,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(subscription.created * 1000),
        endDate: new Date(
          (subscription as ExpandedSubscription).current_period_end * 1000,
        ),
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,

        // Trial period setup (14 days)
        trialStart,
        trialEnd,
        isTrialActive: hasTrialPeriod || false,
      },
    })

    console.info(
      `✅ ${isReactivation ? 'Reactivated' : 'New'} subscription record created for user ${user.id}`,
    )
  } catch (error) {
    console.error('Error handling subscription created:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.info('📝 Subscription updated:', subscription.id)

  try {
    const status =
      subscription.status === 'active'
        ? SubscriptionStatus.ACTIVE
        : subscription.status === 'canceled'
          ? SubscriptionStatus.CANCELLED
          : subscription.status === 'past_due'
            ? SubscriptionStatus.PENDING
            : SubscriptionStatus.ACTIVE

    await prisma.userSubscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status,
        endDate: new Date(
          (subscription as ExpandedSubscription).current_period_end * 1000,
        ),
      },
    })

    console.info(`✅ Subscription ${subscription.id} updated to ${status}`)
  } catch (error) {
    console.error('Error handling subscription updated:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.info('❌ Subscription deleted:', subscription.id)

  try {
    await prisma.userSubscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: SubscriptionStatus.CANCELLED,
        // Keep endDate as is - user retains access until period end
      },
    })

    console.info(`✅ Subscription ${subscription.id} marked as CANCELLED`)
  } catch (error) {
    console.error('Error handling subscription deleted:', error)
  }
}

// Payment Events
async function handlePaymentSucceeded(invoice: ExpandedInvoice) {
  console.info('💰 Payment succeeded:', invoice.id)

  try {
    // Handle both expanded and non-expanded subscription references
    const subscriptionId =
      typeof invoice.subscription === 'string'
        ? invoice.subscription
        : invoice.subscription?.id

    if (subscriptionId) {
      // Update subscription status, extend period, and clear grace period
      const subscription = await prisma.userSubscription.findFirst({
        where: { stripeSubscriptionId: subscriptionId },
      })

      if (subscription) {
        await prisma.userSubscription.update({
          where: { id: subscription.id },
          data: {
            status: SubscriptionStatus.ACTIVE,
            endDate: new Date((invoice.period_end ?? Date.now() / 1000) * 1000),

            // Clear grace period and reset retry count
            isInGracePeriod: false,
            gracePeriodEnd: null,
            failedPaymentRetries: 0,
            lastPaymentAttempt: new Date(),
          },
        })

        // Create billing record
        await prisma.billingRecord.create({
          data: {
            subscriptionId: subscription.id,
            amount: invoice.amount_paid ?? 0,
            currency:
              (invoice.currency?.toUpperCase() as Currency) ?? Currency.USD,
            status: BillingStatus.SUCCEEDED,
            stripeInvoiceId: invoice.id,
            periodStart: new Date(
              (invoice.period_start ?? Date.now() / 1000) * 1000,
            ),
            periodEnd: new Date(
              (invoice.period_end ?? Date.now() / 1000) * 1000,
            ),
            description: `Payment for ${invoice.description || 'subscription'}`,
          },
        })

        console.info(`✅ Payment processed for subscription ${subscriptionId}`)
      }
    }

    // TODO: Send confirmation email to user
    // TODO: Track revenue metrics
  } catch (error) {
    console.error('Error handling payment succeeded:', error)
  }
}

async function handlePaymentFailed(invoice: ExpandedInvoice) {
  console.info('💸 Payment failed:', invoice.id)

  try {
    // Handle both expanded and non-expanded subscription references
    const subscriptionId =
      typeof invoice.subscription === 'string'
        ? invoice.subscription
        : invoice.subscription?.id

    if (subscriptionId) {
      // Find the subscription and implement grace period + dunning logic
      const subscription = await prisma.userSubscription.findFirst({
        where: { stripeSubscriptionId: subscriptionId },
      })

      if (subscription) {
        const now = new Date()
        const gracePeriodEnd = new Date(
          now.getTime() + SUBSCRIPTION_CONFIG.GRACE_PERIOD_MS,
        )
        const newRetryCount = subscription.failedPaymentRetries + 1

        await prisma.userSubscription.update({
          where: { id: subscription.id },
          data: {
            status: SubscriptionStatus.PENDING,

            // Activate 3-day grace period
            isInGracePeriod: true,
            gracePeriodEnd,

            // Track retry attempts for dunning management
            failedPaymentRetries: newRetryCount,
            lastPaymentAttempt: now,
          },
        })

        // Create billing record for failed payment
        await prisma.billingRecord.create({
          data: {
            subscriptionId: subscription.id,
            amount: invoice.amount_due ?? 0,
            currency:
              (invoice.currency?.toUpperCase() as Currency) ?? Currency.USD,
            status: BillingStatus.FAILED,
            stripeInvoiceId: invoice.id,
            periodStart: new Date(
              (invoice.period_start ?? Date.now() / 1000) * 1000,
            ),
            periodEnd: new Date(
              (invoice.period_end ?? Date.now() / 1000) * 1000,
            ),
            description: `Failed payment for ${invoice.description || 'subscription'}`,
            failureReason: `Payment attempt ${newRetryCount} failed`,
          },
        })

        console.info(
          `⚠️ Subscription ${subscriptionId} set to PENDING with 3-day grace period (attempt ${newRetryCount})`,
        )

        // Dunning management: Cancel subscription after too many failures
        if (newRetryCount >= SUBSCRIPTION_CONFIG.MAX_PAYMENT_RETRIES) {
          console.warn(
            `❌ Subscription ${subscriptionId} exceeded max retries (${newRetryCount}), will be cancelled after grace period`,
          )

          // TODO: Schedule subscription cancellation after grace period
          // TODO: Send final warning email
        }
      }
    }

    // TODO: Send payment failure notification
    // TODO: Implement retry logic and grace period
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}

// One-time Purchase Events
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.info('🛒 Checkout completed:', session.id)

  try {
    // Handle one-time package purchases (for trainer services)
    if (session.mode === 'payment' && session.customer) {
      const customerId = session.customer as string
      const user = await findUserByStripeCustomerId(customerId)

      if (!user) {
        console.error(`User not found for checkout session: ${session.id}`)
        return
      }

      // TODO: Implement one-time package purchase logic
      // This will handle trainer package purchases with commission splits
      console.info(`✅ One-time purchase completed for user ${user.id}`)
    }
  } catch (error) {
    console.error('Error handling checkout completed:', error)
  }
}

async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
) {
  console.info('✅ Payment intent succeeded:', paymentIntent.id)

  try {
    // Handle successful one-time payments
    // This complements checkout.session.completed for payment intent flows
    console.info(`✅ Payment intent ${paymentIntent.id} succeeded`)

    // TODO: Complete digital product delivery
    // TODO: Track commission splits for trainer packages
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error)
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.info('❌ Payment intent failed:', paymentIntent.id)

  try {
    // Handle failed one-time payments
    console.info(`❌ Payment intent ${paymentIntent.id} failed`)

    // TODO: Notify user of failed payment
    // TODO: Retry logic if needed
  } catch (error) {
    console.error('Error handling payment intent failed:', error)
  }
}

// Trial Events
async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  console.info('⏰ Trial will end:', subscription.id)

  try {
    // Find the subscription in our database
    const userSubscription = await prisma.userSubscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
      include: { user: true },
    })

    if (!userSubscription) {
      console.error(`Subscription not found: ${subscription.id}`)
      return
    }

    // Update trial status
    await prisma.userSubscription.update({
      where: { id: userSubscription.id },
      data: {
        isTrialActive: false,
      },
    })

    console.info(`⏰ Trial ending soon for user ${userSubscription.user.email}`)

    // TODO: Send trial expiration notification email
    // TODO: Prepare for conversion to paid subscription
  } catch (error) {
    console.error('Error handling trial will end:', error)
  }
}
