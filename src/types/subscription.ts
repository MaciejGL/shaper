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

// Service type display labels
export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  [ServiceType.TRAINING_PLAN]: 'Training Plan',
  [ServiceType.MEAL_PLAN]: 'Meal Plan',
  [ServiceType.COACHING]: 'Coaching Support',
  [ServiceType.IN_PERSON_MEETING]: 'In-Person Meeting',
  [ServiceType.PREMIUM_ACCESS]: 'Premium Access',
}

// Duration display labels
export const DURATION_LABELS: Record<SubscriptionDuration, string> = {
  [SubscriptionDuration.MONTHLY]: 'Monthly',
  [SubscriptionDuration.YEARLY]: 'Yearly',
}

// Status display labels
export const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.ACTIVE]: 'Active',
  [SubscriptionStatus.EXPIRED]: 'Expired',
  [SubscriptionStatus.CANCELLED]: 'Cancelled',
  [SubscriptionStatus.PENDING]: 'Pending',
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

// Access validation result
export interface AccessValidationResult {
  hasAccess: boolean
  reason?: string
  subscription?: UserSubscriptionWithDetails
  remainingUsage?: number
  totalAllowed?: number
}

// Service usage tracking
export interface ServiceUsageTracker {
  serviceType: ServiceType
  usedThisMonth: number
  allowedPerMonth: number
  remainingUsage: number
  nextResetDate: Date
}

// Subscription creation input
export interface CreateSubscriptionInput {
  userId: string
  packageId: string
  trainerId?: string
  startDate?: Date
  duration?: number // Custom duration in days, overrides package duration
}

// Package service creation input
export interface PackageServiceInput {
  serviceType: ServiceType
  quantity: number
}

// Package template creation input
export interface CreatePackageTemplateInput {
  name: string
  description?: string
  priceNOK: number
  duration: SubscriptionDuration
  trainerId?: string
  services: PackageServiceInput[]
}

// Predefined package templates (for seeding)
export const PREDEFINED_PACKAGES = {
  // General Premium Subscription
  PREMIUM: {
    name: 'FitSpace Premium',
    description: 'Access to premium features and content',
    priceNOK: 15900, // 159 NOK monthly
    duration: SubscriptionDuration.MONTHLY,
    trainerId: null,
    services: [{ serviceType: ServiceType.PREMIUM_ACCESS, quantity: 1 }],
  },

  // Trainer Packages
  TRAINING_COACHING: {
    name: 'Training Plan + Coaching',
    description: 'Personalized training plan with coaching support',
    priceNOK: 80000, // 800 NOK
    duration: SubscriptionDuration.MONTHLY,
    services: [
      { serviceType: ServiceType.TRAINING_PLAN, quantity: 1 },
      { serviceType: ServiceType.COACHING, quantity: 1 },
      { serviceType: ServiceType.PREMIUM_ACCESS, quantity: 1 },
    ],
  },

  MEAL_COACHING: {
    name: 'Meal Plan + Coaching',
    description: 'Custom meal plan with nutritional coaching',
    priceNOK: 60000, // 600 NOK
    duration: SubscriptionDuration.MONTHLY,
    services: [
      { serviceType: ServiceType.MEAL_PLAN, quantity: 1 },
      { serviceType: ServiceType.COACHING, quantity: 1 },
      { serviceType: ServiceType.PREMIUM_ACCESS, quantity: 1 },
    ],
  },

  TRAINING_MEAL_COACHING: {
    name: 'Training + Meal + Coaching',
    description: 'Complete fitness package with training and meal plans',
    priceNOK: 130000, // 1300 NOK
    duration: SubscriptionDuration.MONTHLY,
    services: [
      { serviceType: ServiceType.TRAINING_PLAN, quantity: 1 },
      { serviceType: ServiceType.MEAL_PLAN, quantity: 1 },
      { serviceType: ServiceType.COACHING, quantity: 1 },
      { serviceType: ServiceType.PREMIUM_ACCESS, quantity: 1 },
    ],
  },

  EXTRA_MEETING: {
    name: 'Extra Gym Meeting',
    description: 'Additional in-person training session',
    priceNOK: 90000, // 900 NOK
    duration: SubscriptionDuration.MONTHLY,
    services: [{ serviceType: ServiceType.IN_PERSON_MEETING, quantity: 1 }],
  },

  FULL_COMBO: {
    name: 'Full Combo + Meeting',
    description: 'Complete package with everything included',
    priceNOK: 210000, // 2100 NOK
    duration: SubscriptionDuration.MONTHLY,
    services: [
      { serviceType: ServiceType.TRAINING_PLAN, quantity: 1 },
      { serviceType: ServiceType.MEAL_PLAN, quantity: 1 },
      { serviceType: ServiceType.COACHING, quantity: 1 },
      { serviceType: ServiceType.IN_PERSON_MEETING, quantity: 1 },
      { serviceType: ServiceType.PREMIUM_ACCESS, quantity: 1 },
    ],
  },
} as const

// Helper functions for formatting
export const formatPrice = (priceNOK: number): string => {
  return `${(priceNOK / 100).toFixed(0)} NOK`
}

export const formatPriceDetailed = (priceNOK: number): string => {
  return `${(priceNOK / 100).toFixed(2)} NOK`
}

export const isSubscriptionActive = (
  subscription: UserSubscriptionWithDetails,
): boolean => {
  return (
    subscription.status === SubscriptionStatus.ACTIVE &&
    subscription.endDate > new Date()
  )
}

export const getDaysUntilExpiry = (
  subscription: UserSubscriptionWithDetails,
): number => {
  const now = new Date()
  const expiry = new Date(subscription.endDate)
  const diffTime = expiry.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

export const getServiceIcon = (serviceType: ServiceType): string => {
  switch (serviceType) {
    case ServiceType.TRAINING_PLAN:
      return '💪'
    case ServiceType.MEAL_PLAN:
      return '🥗'
    case ServiceType.COACHING:
      return '👨‍🏫'
    case ServiceType.IN_PERSON_MEETING:
      return '🤝'
    case ServiceType.PREMIUM_ACCESS:
      return '⭐'
    default:
      return '📦'
  }
}
