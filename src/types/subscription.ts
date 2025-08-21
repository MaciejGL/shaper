/**
 * Subscription System Types and Enums
 *
 * These enums and types define the subscription and package system structure.
 * They should match exactly with the Prisma schema enums.
 */

// Service types that can be included in packages
export enum ServiceType {
  TRAINING_PLAN = 'TRAINING_PLAN',
  MEAL_PLAN = 'MEAL_PLAN',
  COACHING = 'COACHING',
  IN_PERSON_MEETING = 'IN_PERSON_MEETING',
  PREMIUM_ACCESS = 'PREMIUM_ACCESS',
}

// Package duration types
export enum SubscriptionDuration {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

// Subscription status
export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  PENDING = 'PENDING',
}

// Package template interface for UI/API
export interface PackageTemplateWithServices {
  id: string
  name: string
  description?: string
  priceNOK: number
  duration: SubscriptionDuration
  isActive: boolean
  trainerId?: string
  trainer?: {
    id: string
    name?: string
    email: string
  }
  services: {
    id: string
    serviceType: ServiceType
    quantity: number
  }[]
  createdAt: Date
  updatedAt: Date
}

// User subscription with package and usage details
export interface UserSubscriptionWithDetails {
  id: string
  userId: string
  packageId: string
  trainerId?: string
  status: SubscriptionStatus
  startDate: Date
  endDate: Date
  // Payment fields to match Prisma type
  stripeSubscriptionId?: string | null
  stripePriceId?: string | null
  mockPaymentStatus?: string | null
  mockTransactionId?: string | null
  package: PackageTemplateWithServices
  trainer?: {
    id: string
    name?: string
    email: string
  }
  usedServices: {
    id: string
    serviceType: ServiceType
    quantity: number
    usedAt: Date
    metadata?: Record<string, unknown>
  }[]
  createdAt: Date
  updatedAt: Date
}

// Service usage tracking
export interface ServiceUsageTracker {
  serviceType: ServiceType
  usedThisMonth: number
  allowedPerMonth: number
  remainingUsage: number
  nextResetDate: Date
}

// Helper functions for formatting
export const formatPrice = (priceNOK: number): string => {
  return `${(priceNOK / 100).toFixed(0)} NOK`
}

export const formatPriceDetailed = (priceNOK: number): string => {
  return `${(priceNOK / 100).toFixed(2)} NOK`
}
