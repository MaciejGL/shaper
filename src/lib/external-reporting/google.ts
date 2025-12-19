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
    countryCode,
    externalOfferToken,
    initialExternalTransactionId,
  } = params

  const androidPublisher = getAndroidPublisher()
  const parent = `applications/${PACKAGE_NAME}`

  // Convert cents to micros ($1 = 1,000,000 micros, 1 cent = 10,000 micros)
  const priceMicros = String(amount * 10000)

  if (transactionType === 'refund') {
    // For refunds, use the initial transaction ID to reference the original purchase
    const refundTarget = initialExternalTransactionId || externalTransactionId
    const name = `${parent}/externalTransactions/${refundTarget}`
    await androidPublisher.externaltransactions.refundexternaltransaction({
      name,
      requestBody: {
        fullRefund: {},
        refundTime: new Date().toISOString(),
      },
    })
    console.info('[GOOGLE] Refund reported:', refundTarget)
    return
  }

  // Build request body for purchase or renewal
  const preTaxAmount = {
    priceMicros,
    currency: currency.toUpperCase(),
  }
  const requestBody: Record<string, unknown> = {
    transactionTime: new Date().toISOString(),
    userTaxAddress: { regionCode: countryCode.toUpperCase() },
    originalPreTaxAmount: preTaxAmount,
    currentPreTaxAmount: preTaxAmount,
  }

  // Use recurringTransaction structure for subscriptions
  if (transactionType === 'purchase' && externalOfferToken) {
    // Initial purchase: requires the token from Android app
    requestBody.recurringTransaction = {
      externalTransactionToken: externalOfferToken,
      externalSubscription: { subscriptionType: 'RECURRING' },
    }
  } else if (transactionType === 'renewal' && initialExternalTransactionId) {
    // Renewal: references the initial purchase
    requestBody.recurringTransaction = {
      initialExternalTransactionId,
      externalSubscription: { subscriptionType: 'RECURRING' },
    }
  } else {
    // Missing required data - can't report
    const reason =
      transactionType === 'purchase'
        ? 'Missing externalOfferToken for initial purchase'
        : 'Missing initialExternalTransactionId for renewal'
    console.error('[GOOGLE][SKIP_MISSING_DATA]', {
      externalTransactionId,
      transactionType,
      reason,
      hasToken: !!externalOfferToken,
      hasInitialId: !!initialExternalTransactionId,
    })
    throw new Error(reason)
  }

  console.info('[GOOGLE][API_CALL] Creating external transaction:', {
    externalTransactionId,
    transactionType,
    amount: `${amount / 100} ${currency.toUpperCase()}`,
    priceMicros,
    countryCode,
    hasToken: !!externalOfferToken,
    hasInitialId: !!initialExternalTransactionId,
  })

  try {
    const response =
      await androidPublisher.externaltransactions.createexternaltransaction({
        parent,
        externalTransactionId,
        requestBody,
      })

    console.info('[GOOGLE][API_SUCCESS] Transaction reported:', {
      externalTransactionId,
      responseStatus: response.status,
    })
  } catch (error) {
    // Treat "already exists" as success to keep webhook processing idempotent
    const err = error as { code?: number; message?: string }
    if (err.code === 409) {
      console.info('[GOOGLE][API_ALREADY_EXISTS]', externalTransactionId)
      return
    }
    console.error('[GOOGLE][API_ERROR]', {
      externalTransactionId,
      code: err.code,
      message: err.message,
    })
    throw error
  }
}
