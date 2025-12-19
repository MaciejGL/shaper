/**
 * External Transaction Reporting
 *
 * Reports Premium subscription transactions to Apple/Google
 * for external payment compliance.
 */
import {
  PAYMENT_RULES,
  getCountryCodeFromTimezone,
  getRegionFromTimezone,
} from '@/config/payment-rules'
import prisma from '@/lib/db'
import { ServerEvent, captureServerEvent } from '@/lib/posthog-server'
import { STRIPE_LOOKUP_KEYS } from '@/lib/stripe/lookup-keys'

import { reportToApple } from './apple'
import { reportToGoogle } from './google'
import { ReportTransactionParams } from './types'

const REPORTABLE_PRODUCTS = [
  STRIPE_LOOKUP_KEYS.PREMIUM_MONTHLY,
  STRIPE_LOOKUP_KEYS.PREMIUM_YEARLY,
] as const

/**
 * Report a transaction to the appropriate platform.
 *
 * Only reports if:
 * 1. Product is Premium (monthly/yearly)
 * 2. Platform is iOS or Android (not web)
 * 3. Platform is in "full" mode for user's region
 * 4. For Android: country code is known (Google requires ISO country code)
 */
export async function reportTransaction(
  params: ReportTransactionParams,
): Promise<void> {
  const { stripeLookupKey, platform } = params

  console.info('[REPORTING] Starting report check:', {
    stripeLookupKey,
    platform,
    transactionType: params.transactionType,
    hasToken: !!params.externalOfferToken,
  })

  // Only Premium subscriptions
  if (
    !REPORTABLE_PRODUCTS.includes(
      stripeLookupKey as (typeof REPORTABLE_PRODUCTS)[number],
    )
  ) {
    console.info('[REPORTING] Skipped - not a reportable product')
    return
  }

  // Web never needs reporting
  if (!platform || platform === 'web') {
    console.info('[REPORTING] Skipped - platform is web or null:', platform)
    return
  }

  // Get user's region
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { profile: { select: { timezone: true } } },
  })

  if (!user) {
    console.error('[REPORTING] User not found:', params.userId)
    return
  }

  const region = getRegionFromTimezone(user.profile?.timezone)
  const rules = PAYMENT_RULES[region] || PAYMENT_RULES.DEFAULT
  const platformRules = rules[platform]

  console.info('[REPORTING] Region check:', {
    timezone: user.profile?.timezone,
    region,
    paymentModel: platformRules.paymentModel,
  })

  // Only "full" mode requires reporting
  if (platformRules.paymentModel !== 'full') {
    console.info('[REPORTING] Skipped - not in full mode')
    return
  }

  console.info('[REPORTING]', {
    type: params.transactionType,
    platform,
    region,
    amount: `${params.amount / 100} ${params.currency.toUpperCase()}`,
  })

  try {
    if (platform === 'ios') {
      await reportToApple()
    } else {
      // For Android, we need an actual ISO country code
      const countryCode = getCountryCodeFromTimezone(user.profile?.timezone)
      if (!countryCode) {
        console.warn(
          '[REPORTING] Skipping - no country code for timezone:',
          user.profile?.timezone,
        )
        captureServerEvent({
          distinctId: params.userId,
          event: ServerEvent.GOOGLE_REPORT_SKIPPED,
          properties: {
            reason: 'no_country_code',
            timezone: user.profile?.timezone,
            transactionType: params.transactionType,
          },
        })
        return
      }

      await reportToGoogle({
        externalTransactionId: params.stripeTransactionId,
        transactionType: params.transactionType,
        amount: params.amount,
        currency: params.currency,
        countryCode,
        externalOfferToken: params.externalOfferToken,
        initialExternalTransactionId: params.initialExternalTransactionId,
      })

      // Success event
      captureServerEvent({
        distinctId: params.userId,
        event: ServerEvent.GOOGLE_REPORT_SUCCESS,
        properties: {
          transactionType: params.transactionType,
          transactionId: params.stripeTransactionId,
          amount: params.amount,
          currency: params.currency,
          countryCode,
        },
      })
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    console.error('[REPORTING] Failed:', error)

    // Error event
    captureServerEvent({
      distinctId: params.userId,
      event: ServerEvent.GOOGLE_REPORT_ERROR,
      properties: {
        transactionType: params.transactionType,
        transactionId: params.stripeTransactionId,
        error: errorMessage,
      },
    })
  }
}
