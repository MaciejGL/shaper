import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

import {
  Prisma,
  ServiceType,
  SubscriptionStatus,
} from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email/send-mail'
import { STRIPE_WEBHOOK_EVENTS, SUBSCRIPTION_CONFIG } from '@/lib/stripe/config'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('stripe-signature')
    const body = await request.text()

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

    if (process.env.NODE_ENV === 'development') {
      console.info(`✅ Received webhook event: ${event.type}`)
    }

    // Handle the event
    switch (event.type) {
      case STRIPE_WEBHOOK_EVENTS.SUBSCRIPTION_CREATED:
        await handleSubscriptionCreated(event.data.object)
        break

      case STRIPE_WEBHOOK_EVENTS.SUBSCRIPTION_UPDATED:
        await handleSubscriptionUpdated(event.data.object)
        break

      case STRIPE_WEBHOOK_EVENTS.SUBSCRIPTION_DELETED:
        await handleSubscriptionDeleted(event.data.object)
        break

      case STRIPE_WEBHOOK_EVENTS.PAYMENT_SUCCEEDED:
        await handlePaymentSucceeded(event.data.object)
        break

      case STRIPE_WEBHOOK_EVENTS.PAYMENT_FAILED:
        await handlePaymentFailed(event.data.object)
        break

      case STRIPE_WEBHOOK_EVENTS.CHECKOUT_COMPLETED:
        await handleCheckoutCompleted(event.data.object)
        break

      case STRIPE_WEBHOOK_EVENTS.CHECKOUT_EXPIRED:
        await handleCheckoutExpired(event.data.object)
        break

      case STRIPE_WEBHOOK_EVENTS.PAYMENT_INTENT_SUCCEEDED:
        await handlePaymentIntentSucceeded(event.data.object)
        break

      case STRIPE_WEBHOOK_EVENTS.PAYMENT_INTENT_FAILED:
        await handlePaymentIntentFailed(event.data.object)
        break

      case STRIPE_WEBHOOK_EVENTS.TRIAL_WILL_END:
        await handleTrialWillEnd(event.data.object)
        break

      case STRIPE_WEBHOOK_EVENTS.CUSTOMER_DELETED:
        await handleCustomerDeleted(event.data.object)
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
    include: { profile: true },
  })
}

async function findPackageByStripePriceId(priceId: string) {
  return await prisma.packageTemplate.findFirst({
    where: {
      stripePriceId: priceId,
    },
  })
}

// Subscription Events
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string
    const priceId = subscription.items.data[0]?.price.id
    const startDate = new Date(
      subscription.items.data[0].current_period_start * 1000,
    )
    const endDate = new Date(
      subscription.items.data[0].current_period_end * 1000,
    )

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
        },
      })
    }

    // Handle trainer assignment from offers
    const offerToken = subscription.metadata?.offerToken
    const trainerIdFromOffer = subscription.metadata?.trainerId
    let assignedTrainerId = packageTemplate.trainerId

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

    // Create new subscription record
    await prisma.userSubscription.create({
      data: {
        userId: user.id,
        packageId: packageTemplate.id,
        trainerId: assignedTrainerId, // Use assigned trainer (from package or offer)
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

    // Mark customer as having used a trial in Stripe (prevents future trial abuse)
    if (isTrial) {
      await stripe.customers.update(customerId, {
        metadata: { hasUsedTrial: 'true' },
      })
    }

    // Send welcome email
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
  } catch (error) {
    console.error('Error handling subscription created:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
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
        endDate: new Date(subscription.items.data[0].current_period_end * 1000),
      },
    })

    console.info(`✅ Subscription ${subscription.id} updated to ${status}`)
  } catch (error) {
    console.error('Error handling subscription updated:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
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

    // Immediately disable access by setting endDate to now and clearing all access periods
    const now = new Date()

    await prisma.userSubscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
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

    console.info(
      `✅ Subscription ${subscription.id} deleted - immediate access revoked for user ${userSubscription.user.email}`,
    )

    // Send cancellation email
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
  } catch (error) {
    console.error('Error handling subscription deleted:', error)
  }
}

// Payment Events
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    // Handle subscription reference from invoice using proper Stripe types
    const subscriptionId = invoice.id

    if (subscriptionId) {
      // Update subscription status and clear grace period
      const subscription = await prisma.userSubscription.findFirst({
        where: { stripeSubscriptionId: subscriptionId },
      })

      if (subscription) {
        // Prepare update data
        const updateData: Prisma.UserSubscriptionUpdateInput = {
          status: SubscriptionStatus.ACTIVE,

          // Clear grace period and reset retry count
          isInGracePeriod: false,
          gracePeriodEnd: null,
          failedPaymentRetries: 0,
          lastPaymentAttempt: new Date(),
        }

        // DON'T update endDate for trial subscriptions
        // Trial invoice period_end is the same as period_start (setup date)
        // The subscription.created webhook already set the correct trial endDate
        const invoicePeriodEnd = invoice.period_end
        if (!subscription.isTrialActive && invoicePeriodEnd) {
          updateData.endDate = new Date(invoicePeriodEnd * 1000)
        }

        await prisma.userSubscription.update({
          where: { id: subscription.id },
          data: updateData,
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

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    // Handle subscription reference from invoice using proper Stripe types
    const subscriptionId = invoice.id

    if (subscriptionId) {
      // Find the subscription and implement grace period + dunning logic
      const subscription = await prisma.userSubscription.findFirst({
        where: { stripeSubscriptionId: subscriptionId },
        include: { package: true },
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

        // Failed payment records now tracked in Stripe directly

        // Dunning management: Cancel subscription after too many failures
        if (newRetryCount >= SUBSCRIPTION_CONFIG.MAX_PAYMENT_RETRIES) {
          console.warn(
            `❌ Subscription ${subscriptionId} exceeded max retries (${newRetryCount}), will be cancelled after grace period`,
          )
        }

        // Send payment failed email
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

          // Send grace period ending warning if close to end and max retries reached
          if (newRetryCount >= SUBSCRIPTION_CONFIG.MAX_PAYMENT_RETRIES) {
            const gracePeriodEnd = subscription.gracePeriodEnd
            if (gracePeriodEnd) {
              const daysUntilCancellation = Math.max(
                0,
                Math.ceil(
                  (gracePeriodEnd.getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24),
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
                  console.info(
                    `📧 Grace period ending email sent to ${user.email}`,
                  )
                } catch (emailError) {
                  console.error(
                    'Failed to send grace period ending email:',
                    emailError,
                  )
                }
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}

// Simplified payment processing - uses Stripe as source of truth
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    // Handle one-time package purchases (supports bundles)
    if (session.mode === 'payment' && session.customer) {
      const customerId = session.customer as string
      const user = await findUserByStripeCustomerId(customerId)

      if (!user) {
        console.error(`User not found for checkout session: ${session.id}`)
        return
      }

      // Get payment intent for reference
      const paymentIntent = await stripe.paymentIntents.retrieve(
        session.payment_intent as string,
      )

      const offerToken = session.metadata?.offerToken
      const trainerId = session.metadata?.trainerId

      // Get all line items for service delivery creation
      const lineItems = session.line_items?.data || []

      if (lineItems.length === 0) {
        console.error('No line items found in checkout session')
        return
      }

      console.info(
        `📦 Processing ${lineItems.length} items in checkout session ${session.id}`,
      )

      // Create service delivery tasks for each line item
      const deliveryTasks = []

      for (const lineItem of lineItems) {
        const priceId = lineItem.price?.id
        const quantity = lineItem.quantity || 1

        if (!priceId) {
          console.error(`No price ID found for line item`)
          continue
        }

        const packageTemplate = await findPackageByStripePriceId(priceId)

        if (!packageTemplate) {
          console.error(`Package not found for price: ${priceId}`)
          continue
        }

        // Determine trainer ID (from offer or package)
        const finalTrainerId = trainerId || packageTemplate.trainerId
        console.log(
          'finalTrainerId',
          trainerId,
          packageTemplate.trainerId,
          packageTemplate,
        )

        if (finalTrainerId) {
          // Get service types from package metadata (simplified approach)
          const metadata = packageTemplate.metadata as Record<string, unknown>
          const serviceType =
            (metadata?.service_type as ServiceType) ||
            ServiceType.COACHING_COMPLETE // Default service type

          // Create a single delivery task for the package
          const deliveryTask = await prisma.serviceDelivery.create({
            data: {
              stripePaymentIntentId: paymentIntent.id,
              trainerId: finalTrainerId,
              clientId: user.id,
              serviceType: serviceType,
              packageName: packageTemplate.name,
              quantity: quantity, // Line item quantity
              status: 'PENDING',
              metadata: {
                checkoutSessionId: session.id,
                offerToken: offerToken || null,
                stripePriceId: priceId,
                lineItemIndex: lineItems.indexOf(lineItem),
              },
            },
          })

          deliveryTasks.push(deliveryTask)

          console.info(
            `📋 Created delivery task: ${quantity}x ${serviceType} for ${packageTemplate.name} (Trainer: ${finalTrainerId})`,
          )
        }
      }

      // If this is from a trainer offer, mark offer as completed and link to Stripe
      if (offerToken) {
        await prisma.trainerOffer.update({
          where: { token: offerToken },
          data: {
            status: 'PAID',
            completedAt: new Date(),
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId: paymentIntent.id,
          },
        })

        console.info(
          `🎯 Marked trainer offer ${offerToken} as PAID and linked to Stripe`,
        )
      }

      console.info(
        `✅ Payment processed: ${user.email} → ${deliveryTasks.length} delivery tasks created (${paymentIntent.amount / 100} ${paymentIntent.currency.toUpperCase()})`,
      )
    }
  } catch (error) {
    console.error('Error handling checkout completed:', error)
  }
}

// Handle checkout session expired - reset offer status to allow retry
async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  try {
    const offerToken = session.metadata?.offerToken

    if (!offerToken) {
      console.info('No offer token found in expired checkout session metadata')
      return
    }

    // Find the offer that was being processed
    const offer = await prisma.trainerOffer.findUnique({
      where: { token: offerToken },
    })

    if (!offer) {
      console.warn(`Offer not found for token: ${offerToken}`)
      return
    }

    // Only reset if the offer is currently in processing status
    if (offer.status === 'PROCESSING') {
      console.info(
        `🔄 Resetting offer ${offerToken} back to PENDING after checkout session expired`,
      )
      await prisma.trainerOffer.update({
        where: { id: offer.id },
        data: {
          status: 'PENDING',
          updatedAt: new Date(),
        },
      })

      console.info(
        `🔄 Reset offer ${offerToken} back to PENDING after checkout session expired`,
      )
    } else {
      console.info(
        `Offer ${offerToken} status is ${offer.status}, no reset needed`,
      )
    }
  } catch (error) {
    console.error('Error handling checkout expired:', error)
  }
}

async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
) {
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
  console.info('\n\n⏰ Trial will end:\n\n', subscription)

  try {
    // Find the subscription in our database
    const userSubscription = await prisma.userSubscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
      include: { user: { include: { profile: true } } },
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

    // Get package information for email
    const packageTemplate = await prisma.packageTemplate.findUnique({
      where: { id: userSubscription.packageId },
    })

    if (packageTemplate && userSubscription.user.email) {
      // Calculate days remaining in trial
      const trialEnd = userSubscription.trialEnd
      const daysRemaining = trialEnd
        ? Math.max(
            0,
            Math.ceil(
              (trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
            ),
          )
        : 3

      try {
        await sendEmail.trialEnding(userSubscription.user.email, {
          userName: userSubscription.user.profile?.firstName,
          daysRemaining,
          packageName: packageTemplate.name,
          upgradeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/fitspace/settings`,
        })
        console.info(
          `📧 Trial ending email sent to ${userSubscription.user.email}`,
        )
      } catch (emailError) {
        console.error('Failed to send trial ending email:', emailError)
      }
    }
  } catch (error) {
    console.error('Error handling trial will end:', error)
  }
}

// Customer Events
async function handleCustomerDeleted(customer: Stripe.Customer) {
  console.info('🗑️ Customer deleted:', customer.id)

  try {
    // Find the user associated with this Stripe customer
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: customer.id },
      include: {
        profile: true,
        subscriptions: {
          include: {
            package: true,
          },
        },
      },
    })

    if (!user) {
      console.warn(`No user found for deleted Stripe customer: ${customer.id}`)
      return
    }

    console.info(`Found user ${user.id} for deleted customer ${customer.id}`)

    // Cancel all active subscriptions for this user
    const activeSubscriptions = user.subscriptions.filter(
      (sub) =>
        sub.status === SubscriptionStatus.ACTIVE ||
        sub.status === SubscriptionStatus.PENDING,
    )

    if (activeSubscriptions.length > 0) {
      await prisma.userSubscription.updateMany({
        where: {
          userId: user.id,
          status: {
            in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING],
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

    // Clear the Stripe customer ID from the user record
    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripeCustomerId: null,
      },
    })

    console.info(`✅ Cleared Stripe customer ID for user ${user.id}`)

    // Billing records for cancellations now tracked in Stripe directly

    // Send notification email to user about account changes
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
          reactivateUrl: `${process.env.NEXT_PUBLIC_APP_URL}/fitspace/settings`,
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

    console.info(
      `🗑️ Successfully processed customer deletion for user ${user.id} (${user.email})`,
    )
  } catch (error) {
    console.error('Error handling customer deleted:', error)
  }
}

// Helper functions removed - service types now come directly from PackageService relations
