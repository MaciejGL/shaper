import Stripe from 'stripe'

export async function handlePaymentIntentSucceeded(
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
