/**
 * Refund Reporting Helper
 *
 * Looks up subscription details and reports refund.
 */
import prisma from '@/lib/db'
import { STRIPE_LOOKUP_KEYS } from '@/lib/stripe/lookup-keys'

import { reportTransaction } from './report-transaction'

interface ReportRefundParams {
  userId: string
  chargeId: string
  amount: number
  currency: string
  invoiceId?: string
}

/**
 * Report a refund - looks up subscription details automatically
 * Uses stored originPlatform and initialStripeInvoiceId for correct Google reporting
 */
export async function reportRefund(params: ReportRefundParams): Promise<void> {
  const { userId, chargeId, amount, currency, invoiceId } = params

  try {
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId,
        stripeSubscriptionId: { not: null },
        package: {
          stripeLookupKey: {
            in: [
              STRIPE_LOOKUP_KEYS.PREMIUM_MONTHLY,
              STRIPE_LOOKUP_KEYS.PREMIUM_YEARLY,
            ],
          },
        },
      },
      include: { package: true },
    })

    if (
      !subscription?.stripeSubscriptionId ||
      !subscription.package.stripeLookupKey
    ) {
      return
    }

    // Use stored originPlatform instead of fetching from Stripe metadata
    const storedPlatform = subscription.originPlatform
    const platform =
      storedPlatform === 'ios' || storedPlatform === 'android'
        ? storedPlatform
        : null

    // Use invoice ID if provided, otherwise fall back to charge ID
    // For Google reporting, we need the initialStripeInvoiceId to reference the original transaction
    const transactionId = invoiceId || chargeId

    await reportTransaction({
      userId,
      stripeTransactionId: transactionId,
      amount,
      currency,
      stripeLookupKey: subscription.package
        .stripeLookupKey as (typeof STRIPE_LOOKUP_KEYS)[keyof typeof STRIPE_LOOKUP_KEYS],
      transactionType: 'refund',
      platform,
      initialExternalTransactionId:
        subscription.initialStripeInvoiceId || undefined,
    })
  } catch (error) {
    console.error('[REPORTING] Refund failed:', error)
  }
}
