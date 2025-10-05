import Stripe from 'stripe'

import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email/send-mail'
import { stripe } from '@/lib/stripe/stripe'

/**
 * Handles charge.dispute.created webhook
 * When a client disputes/chargebacks a payment, this tracks it in our database
 * and alerts admins to respond in Stripe Dashboard
 */
export async function handleDisputeCreated(dispute: Stripe.Dispute) {
  try {
    const chargeId =
      typeof dispute.charge === 'string' ? dispute.charge : dispute.charge.id

    if (!chargeId) {
      console.warn('No charge ID found in dispute')
      return
    }

    // Get the charge to find payment intent
    const charge = await stripe.charges.retrieve(chargeId)

    const paymentIntentId =
      typeof charge.payment_intent === 'string'
        ? charge.payment_intent
        : charge.payment_intent?.id

    if (!paymentIntentId) {
      console.warn(`No payment intent found for disputed charge: ${chargeId}`)
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
        `No service deliveries found for disputed payment: ${paymentIntentId}`,
      )
      return
    }

    // Update all associated deliveries
    for (const delivery of deliveries) {
      await prisma.serviceDelivery.update({
        where: { id: delivery.id },
        data: {
          disputedAt: new Date(),
          disputeStatus: dispute.status,
        },
      })

      console.info(
        `⚠️ Marked service delivery ${delivery.id} as disputed (Reason: ${dispute.reason})`,
      )
    }

    // Get admin emails for notification
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true, name: true },
    })

    // Send alert to admins
    const disputeAmount = dispute.amount
    const currency = dispute.currency.toUpperCase()
    const evidenceDueBy = dispute.evidence_details?.due_by
      ? new Date(dispute.evidence_details.due_by * 1000)
      : null

    for (const admin of admins) {
      try {
        await sendEmail.disputeAlert(admin.email, {
          adminName: admin.name,
          disputeId: dispute.id,
          chargeId,
          amount: (disputeAmount / 100).toFixed(2),
          currency,
          reason: formatDisputeReason(dispute.reason),
          evidenceDueBy: evidenceDueBy?.toLocaleDateString() || 'N/A',
          trainerName:
            deliveries[0]?.trainer.profile?.firstName ||
            deliveries[0]?.trainer.name ||
            undefined,
          clientName:
            deliveries[0]?.client.profile?.firstName ||
            deliveries[0]?.client.name ||
            undefined,
          stripeDashboardUrl: `https://dashboard.stripe.com/disputes/${dispute.id}`,
        })
        console.info(`📧 Dispute alert sent to admin: ${admin.email}`)
      } catch (emailError) {
        console.error('Failed to send dispute alert email:', emailError)
      }
    }

    console.info(
      `⚠️ Processed dispute ${dispute.id}: ${disputeAmount / 100} ${currency} (Reason: ${dispute.reason})`,
    )
  } catch (error) {
    console.error('Error handling dispute created:', error)
  }
}

/**
 * Format dispute reason for display
 */
function formatDisputeReason(reason: string): string {
  const reasons: Record<string, string> = {
    bank_cannot_process: 'Bank cannot process',
    check_returned: 'Check returned',
    credit_not_processed: 'Credit not processed',
    customer_initiated: 'Customer initiated',
    debit_not_authorized: 'Debit not authorized',
    duplicate: 'Duplicate charge',
    fraudulent: 'Fraudulent',
    general: 'General dispute',
    incorrect_account_details: 'Incorrect account details',
    insufficient_funds: 'Insufficient funds',
    product_not_received: 'Product not received',
    product_unacceptable: 'Product unacceptable',
    subscription_canceled: 'Subscription canceled',
    unrecognized: 'Unrecognized charge',
  }
  return reasons[reason] || reason.replace(/_/g, ' ')
}
