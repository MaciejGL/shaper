import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

import { STRIPE_WEBHOOK_EVENTS } from '@/lib/stripe/config'
import { stripe } from '@/lib/stripe/stripe'

import { handleChargeRefunded } from './handlers/charge-refunded'
import { handleCheckoutCompleted } from './handlers/checkout-completed'
import { handleCheckoutExpired } from './handlers/checkout-expired'
import { handleCustomerDeleted } from './handlers/customer-deleted'
import { handleDisputeCreated } from './handlers/dispute-created'
import { handlePaymentFailed } from './handlers/payment-failed'
import { handlePaymentSucceeded } from './handlers/payment-succeeded'
import { handleSubscriptionCreated } from './handlers/subscription-created'
import { handleSubscriptionDeleted } from './handlers/subscription-deleted'
import { handleSubscriptionPaused } from './handlers/subscription-paused'
import { handleSubscriptionResumed } from './handlers/subscription-resumed'
import { handleSubscriptionUpdated } from './handlers/subscription-updated'
import { handleTrialWillEnd } from './handlers/trial-will-end'

export async function POST(request: NextRequest) {
  const requestId = `webhook-${Date.now()}`
  console.info(`[${requestId}] 🔔 Webhook request received`)

  try {
    const signature = request.headers.get('stripe-signature')
    const body = await request.text()

    console.info(
      `[${requestId}] Body length: ${body.length}, Has signature: ${!!signature}`,
    )

    if (!signature) {
      console.error(`[${requestId}] ❌ Missing stripe-signature header`)
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!endpointSecret) {
      console.error(
        `[${requestId}] ❌ Missing STRIPE_WEBHOOK_SECRET environment variable`,
      )
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 },
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
      console.info(`[${requestId}] ✅ Signature verified successfully`)
    } catch (err) {
      console.error(
        `[${requestId}] ❌ Webhook signature verification failed:`,
        err,
      )
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // ALWAYS log webhook events in all environments
    console.info(
      `[${requestId}] ✅ [STRIPE-WEBHOOK] Received: ${event.type} (${event.id})`,
    )

    // Handle the event
    try {
      switch (event.type) {
        case STRIPE_WEBHOOK_EVENTS.SUBSCRIPTION_CREATED:
          console.info(`[WEBHOOK] Processing subscription.created`)
          await handleSubscriptionCreated(event.data.object)
          console.info(`[WEBHOOK] ✅ subscription.created processed`)
          break

        case STRIPE_WEBHOOK_EVENTS.SUBSCRIPTION_UPDATED:
          console.info(`[WEBHOOK] Processing subscription.updated`)
          await handleSubscriptionUpdated(event.data.object)
          console.info(`[WEBHOOK] ✅ subscription.updated processed`)
          break

        case STRIPE_WEBHOOK_EVENTS.SUBSCRIPTION_DELETED:
          console.info(`[WEBHOOK] Processing subscription.deleted`)
          await handleSubscriptionDeleted(event.data.object)
          console.info(`[WEBHOOK] ✅ subscription.deleted processed`)
          break

        case STRIPE_WEBHOOK_EVENTS.SUBSCRIPTION_PAUSED:
          console.info(`[WEBHOOK] Processing subscription.paused`)
          await handleSubscriptionPaused(event.data.object)
          console.info(`[WEBHOOK] ✅ subscription.paused processed`)
          break

        case STRIPE_WEBHOOK_EVENTS.SUBSCRIPTION_RESUMED:
          console.info(`[WEBHOOK] Processing subscription.resumed`)
          await handleSubscriptionResumed(event.data.object)
          console.info(`[WEBHOOK] ✅ subscription.resumed processed`)
          break

        case STRIPE_WEBHOOK_EVENTS.PAYMENT_SUCCEEDED:
          console.info(`[WEBHOOK] Processing invoice.payment_succeeded`)
          await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
          console.info(`[WEBHOOK] ✅ invoice.payment_succeeded processed`)
          break

        case STRIPE_WEBHOOK_EVENTS.PAYMENT_FAILED:
          console.info(`[WEBHOOK] Processing invoice.payment_failed`)
          await handlePaymentFailed(event.data.object)
          console.info(`[WEBHOOK] ✅ invoice.payment_failed processed`)
          break

        case STRIPE_WEBHOOK_EVENTS.CHECKOUT_COMPLETED:
          console.info(`[WEBHOOK] Processing checkout.session.completed`)
          await handleCheckoutCompleted(event.data.object)
          console.info(`[WEBHOOK] ✅ checkout.session.completed processed`)
          break

        case STRIPE_WEBHOOK_EVENTS.CHECKOUT_EXPIRED:
          console.info(`[WEBHOOK] Processing checkout.session.expired`)
          await handleCheckoutExpired(event.data.object)
          console.info(`[WEBHOOK] ✅ checkout.session.expired processed`)
          break

        case STRIPE_WEBHOOK_EVENTS.TRIAL_WILL_END:
          console.info(`[WEBHOOK] Processing subscription.trial_will_end`)
          await handleTrialWillEnd(event.data.object)
          console.info(`[WEBHOOK] ✅ subscription.trial_will_end processed`)
          break

        case STRIPE_WEBHOOK_EVENTS.CUSTOMER_DELETED:
          console.info(`[WEBHOOK] Processing customer.deleted`)
          await handleCustomerDeleted(event.data.object)
          console.info(`[WEBHOOK] ✅ customer.deleted processed`)
          break

        case STRIPE_WEBHOOK_EVENTS.CHARGE_REFUNDED:
          console.info(`[WEBHOOK] Processing charge.refunded`)
          await handleChargeRefunded(event.data.object)
          console.info(`[WEBHOOK] ✅ charge.refunded processed`)
          break

        case STRIPE_WEBHOOK_EVENTS.DISPUTE_CREATED:
          console.info(`[WEBHOOK] Processing charge.dispute.created`)
          await handleDisputeCreated(event.data.object)
          console.info(`[WEBHOOK] ✅ charge.dispute.created processed`)
          break

        default:
          console.info(`[WEBHOOK] ⚠️ Unhandled event type: ${event.type}`)
      }
    } catch (handlerError) {
      // Log handler error but still return 200 to prevent Stripe retries
      console.error(
        `[${requestId}] ❌ Handler error for ${event.type}:`,
        handlerError,
      )
      // You might want to send this to an error tracking service
    }

    console.info(`[${requestId}] ✅ Webhook processed successfully`)
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error(`[${requestId}] ❌ Webhook error:`, error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 },
    )
  }
}
