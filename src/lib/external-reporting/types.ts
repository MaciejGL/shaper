import { Platform } from '@/config/payment-rules'
import { STRIPE_LOOKUP_KEYS } from '@/lib/stripe/lookup-keys'

export type TransactionType = 'purchase' | 'renewal' | 'refund'

export interface ReportTransactionParams {
  userId: string
  stripeTransactionId: string
  amount: number
  currency: string
  stripeLookupKey: (typeof STRIPE_LOOKUP_KEYS)[keyof typeof STRIPE_LOOKUP_KEYS]
  transactionType: TransactionType
  platform: Platform | null
  externalOfferToken?: string
  initialExternalTransactionId?: string
}

export interface GoogleReportParams {
  externalTransactionId: string
  transactionType: TransactionType
  amount: number
  currency: string
  countryCode: string
  externalOfferToken?: string
  initialExternalTransactionId?: string
}
