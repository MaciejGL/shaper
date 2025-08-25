import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

import { STRIPE_WEBHOOK_EVENTS } from '@/lib/stripe/config'
import { stripe } from '@/lib/stripe/stripe'

import { handleCheckoutCompleted } from './handlers/checkout-completed'
import { handleCheckoutExpired } from './handlers/checkout-expired'
import { handleCustomerDeleted } from './handlers/customer-deleted'
import { handlePaymentFailed } from './handlers/payment-failed'
import { handlePaymentIntentFailed } from './handlers/payment-intent-failed'
import { handlePaymentIntentSucceeded } from './handlers/payment-intent-succeeded'
import { handlePaymentSucceeded } from './handlers/payment-succeeded'
import { handleSubscriptionCreated } from './handlers/subscription-created'
import { handleSubscriptionDeleted } from './handlers/subscription-deleted'
import { handleSubscriptionUpdated } from './handlers/subscription-updated'
import { handleTrialWillEnd } from './handlers/trial-will-end'

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
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
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
