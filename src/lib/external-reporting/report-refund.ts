/**
 * Refund Reporting Helper
 *
 * Looks up subscription details and reports refund.
 */
import prisma from '@/lib/db'
import { STRIPE_LOOKUP_KEYS } from '@/lib/stripe/lookup-keys'
import { stripe } from '@/lib/stripe/stripe'

import { reportTransaction } from './report-transaction'

interface ReportRefundParams {
  userId: string
  chargeId: string
  amount: number
  currency: string
}

/**
 * Report a refund - looks up subscription details automatically
 */
export async function reportRefund(params: ReportRefundParams): Promise<void> {
  const { userId, chargeId, amount, currency } = params

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

    const stripeSub = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId,
    )
    const platform = (stripeSub.metadata?.platform as 'ios' | 'android') || null

    await reportTransaction({
      userId,
      stripeTransactionId: chargeId,
      amount,
      currency,
      stripeLookupKey: subscription.package
        .stripeLookupKey as (typeof STRIPE_LOOKUP_KEYS)[keyof typeof STRIPE_LOOKUP_KEYS],
      transactionType: 'refund',
      platform,
    })
  } catch (error) {
    console.error('[REPORTING] Refund failed:', error)
  }
}
