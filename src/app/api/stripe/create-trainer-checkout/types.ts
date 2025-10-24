import { PackageTemplate, User } from '@/generated/prisma/client'

export interface CheckoutRequest {
  offerToken: string
  clientEmail: string
  successUrl?: string
  cancelUrl?: string
}

export interface OfferWithTrainer {
  id: string
  token: string
  trainerId: string
  clientEmail: string
  status: string
  expiresAt: Date
  packageSummary: unknown
  trainer: {
    id: string
    name: string
    profile: {
      firstName: string | null
    } | null
  }
}

export interface BundleItem {
  packageId: string
  quantity: number
  package: PackageTemplate
}

export interface CheckoutPreparation {
  checkoutItems: BundleItem[]
  hasPremiumCoaching: boolean
  mode: 'subscription' | 'payment'
}

export interface SubscriptionUpgradeResult {
  upgraded: boolean
  subscriptionId?: string
}

export interface CheckoutResult {
  checkoutUrl: string | null
  sessionId: string
  mode: 'subscription' | 'payment'
  bundleDescription: string
  itemCount: number
  originalItemCount: number
  hasCoachingCombo: boolean
  premiumIncluded: boolean
  trainerName: string
  inPersonDiscount: number
  hasDiscountCoupon: boolean
  discountDescription: string | null
}
