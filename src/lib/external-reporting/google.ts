/**
 * Google Play External Transaction Reporting
 *
 * Reports transactions to Google Play for External Offers program compliance.
 * API Reference: https://developer.android.com/google/play/billing/outside-gpb-backend
 */
import { PACKAGE_NAME, getAndroidPublisher } from '@/lib/google-play/client'

import { GoogleReportParams } from './types'

/**
 * Report transaction to Google Play
 */
export async function reportToGoogle(
  params: GoogleReportParams,
): Promise<void> {
  const {
    externalTransactionId,
    transactionType,
    amount,
    currency,
    regionCode,
    originalTransactionId,
  } = params

  const androidPublisher = getAndroidPublisher()
  const parent = `applications/${PACKAGE_NAME}`

  // Convert cents to micros ($1 = 1,000,000 micros, 1 cent = 10,000 micros)
  const priceMicros = String(amount * 10000)

  if (transactionType === 'refund') {
    const name = `${parent}/externalTransactions/${originalTransactionId || externalTransactionId}`
    await androidPublisher.externaltransactions.refundexternaltransaction({
      name,
      requestBody: {
        fullRefund: {},
        refundTime: new Date().toISOString(),
      },
    })
    console.info('[GOOGLE] Refund reported:', externalTransactionId)
    return
  }

  // Purchase or renewal
  const requestBody: Record<string, unknown> = {
    transactionTime: new Date().toISOString(),
    userTaxAddress: { regionCode: regionCode.toUpperCase() },
    currentPreTaxAmount: {
      priceMicros,
      currency: currency.toUpperCase(),
    },
  }

  if (transactionType === 'renewal' && originalTransactionId) {
    requestBody.originalTransactionId = originalTransactionId
  }

  await androidPublisher.externaltransactions.createexternaltransaction({
    parent,
    externalTransactionId,
    requestBody,
  })

  console.info('[GOOGLE] Transaction reported:', externalTransactionId)
}
