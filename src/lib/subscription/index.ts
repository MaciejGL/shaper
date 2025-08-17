/**
 * Subscription System - Main Export File
 *
 * This file exports all the main subscription system components for easy importing.
 */

// Core types and enums
export * from '@/types/subscription'

// Subscription validator (main business logic)
export {
  SubscriptionValidator,
  subscriptionValidator,
  checkPremiumAccess,
  checkServiceAccess,
  trackServiceUsage,
} from './subscription-validator'

// Database seeder functions
export {
  seedSubscriptionSystem,
  seedPackageTemplates,
  createTrainerPackagesFromTemplates,
  createPackagesForAllTrainers,
  cleanupSubscriptionData,
} from './database-seeder'

// GraphQL Models (for use in resolvers)
export { default as PackageTemplate } from '@/server/models/package-template/model'
export { default as UserSubscription } from '@/server/models/user-subscription/model'
