import Stripe from 'stripe'

import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email/send-mail'
import { reportRefund } from '@/lib/external-reporting'

/**
 * Handles charge.refunded webhook
 * When admin issues refund in Stripe Dashboard, this updates our database
 * and notifies the trainer
 */
export async function handleChargeRefunded(charge: Stripe.Charge) {
  try {
    const paymentIntentId =
      typeof charge.payment_intent === 'string'
        ? charge.payment_intent
        : charge.payment_intent?.id

    if (!paymentIntentId) {
      console.warn('No payment intent found in refunded charge')
      return
    }

    // Find service deliveries associated with this payment
    const deliveries = await prisma.serviceDelivery.findMany({
      where: { stripePaymentIntentId: paymentIntentId },
      include: {
        trainer: { include: { profile: true } },
        client: { include: { profile: true } },
      },
    })

    if (deliveries.length === 0) {
      console.info(
        `No service deliveries found for refunded payment: ${paymentIntentId}`,
      )
      return
    }

    // Get refund details
    const refund = charge.refunds?.data[0]
    const refundReason = refund?.reason || 'requested_by_customer'
    const refundAmount = charge.amount_refunded
    const currency = charge.currency.toUpperCase()

    // Update all associated deliveries
    for (const delivery of deliveries) {
      await prisma.serviceDelivery.update({
        where: { id: delivery.id },
        data: {
          refundedAt: new Date(),
          refundReason,
        },
      })

      console.info(
        `✅ Marked service delivery ${delivery.id} as refunded (${refundAmount / 100} ${currency})`,
      )

      // Notify trainer about the refund
      if (delivery.trainer.email) {
        try {
          await sendEmail.refundNotification(delivery.trainer.email, {
            trainerName:
              delivery.trainer.profile?.firstName ||
              delivery.trainer.name ||
              'Trainer',
            clientName:
              delivery.client.profile?.firstName ||
              delivery.client.name ||
              'Client',
            packageName: delivery.packageName,
            refundAmount: (refundAmount / 100).toFixed(2),
            currency,
            refundReason: formatRefundReason(refundReason),
          })
          console.info(
            `📧 Refund notification sent to trainer: ${delivery.trainer.email}`,
          )
        } catch (emailError) {
          console.error('Failed to send refund notification email:', emailError)
        }
      }
    }

    console.info(
      `✅ Processed refund for charge ${charge.id}: ${refundAmount / 100} ${currency} refunded`,
    )

    // Report refund to Apple/Google for Premium subscriptions
    if (deliveries[0]?.client.id) {
      await reportRefund({
        userId: deliveries[0].client.id,
        chargeId: charge.id,
        amount: refundAmount,
        currency,
      })
    }
  } catch (error) {
    console.error('Error handling charge refunded:', error)
  }
}

/**
 * Format refund reason for display
 */
function formatRefundReason(reason: string): string {
  const reasons: Record<string, string> = {
    requested_by_customer: 'Requested by customer',
    duplicate: 'Duplicate payment',
    fraudulent: 'Fraudulent transaction',
    other: 'Other reason',
  }
  return reasons[reason] || 'Refund processed'
}
