import Stripe from 'stripe'

export async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent,
) {
  try {
    // Handle failed one-time payments
    console.info(`❌ Payment intent ${paymentIntent.id} failed`)

    // TODO: Notify user of failed payment
    // TODO: Retry logic if needed
  } catch (error) {
    console.error('Error handling payment intent failed:', error)
  }
}
