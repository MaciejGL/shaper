import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'

import {
  cancelClientCoachingSubscription,
  checkPremiumAccess,
  getActivePackageTemplates,
  getAllUsersWithSubscriptions,
  getMyServiceDeliveries,
  getSubscriptionStats,
  getTrainerDeliveries,
  giveLifetimePremium,
  pauseClientCoachingSubscription,
  removeUserSubscription,
  resumeClientCoachingSubscription,
  undoCancelClientCoachingSubscription,
  updateServiceDelivery,
} from './factory'
import {
  getFreezeEligibility,
  pauseSubscription,
  resumeSubscription,
} from './freeze-service'

export const Query: GQLQueryResolvers = {
  checkPremiumAccess: async (_, __, context) => checkPremiumAccess(context),

  getActivePackageTemplates: async (_, args, context) =>
    getActivePackageTemplates(args, context),

  getMyServiceDeliveries: async (_, args, context) =>
    getMyServiceDeliveries(args, context),

  getTrainerDeliveries: async (_, args, context) =>
    getTrainerDeliveries(args, context),

  // Admin subscription management
  getAllUsersWithSubscriptions: async (_, args) =>
    getAllUsersWithSubscriptions(args),

  getSubscriptionStats: async () => getSubscriptionStats(),

  // Subscription freeze (Premium Yearly only)
  getFreezeEligibility: async (_, __, context) => {
    const userId = context.user?.user?.id
    if (!userId) {
      throw new Error('Authentication required')
    }
    const eligibility = await getFreezeEligibility(userId)
    return {
      ...eligibility,
      availableFrom: eligibility.availableFrom?.toISOString() ?? null,
      pauseEndsAt: eligibility.pauseEndsAt?.toISOString() ?? null,
    }
  },
}

export const Mutation: GQLMutationResolvers = {
  updateServiceDelivery: async (_, args, context) =>
    updateServiceDelivery(args.deliveryId, args.status, args.notes, context),

  // Coaching subscription management
  pauseClientCoachingSubscription: async (_, args, context) =>
    pauseClientCoachingSubscription(args.clientId, context),

  resumeClientCoachingSubscription: async (_, args, context) =>
    resumeClientCoachingSubscription(args.clientId, context),

  cancelClientCoachingSubscription: async (_, args, context) =>
    cancelClientCoachingSubscription(args.clientId, args.cancelAt, context),

  undoCancelClientCoachingSubscription: async (_, args, context) =>
    undoCancelClientCoachingSubscription(args.clientId, context),

  // Admin subscription management
  giveLifetimePremium: async (_, args, context) =>
    giveLifetimePremium(args.userId, context),

  removeUserSubscription: async (_, args) =>
    removeUserSubscription(args.userId),

  // Subscription freeze (Premium Yearly only)
  pauseMySubscription: async (_, args, context) => {
    const userId = context.user?.user?.id
    if (!userId) {
      throw new Error('Authentication required')
    }
    const result = await pauseSubscription(userId, args.days)
    return {
      ...result,
      pauseEndsAt: result.pauseEndsAt?.toISOString() ?? null,
    }
  },

  resumeMySubscription: async (_, __, context) => {
    const userId = context.user?.user?.id
    if (!userId) {
      throw new Error('Authentication required')
    }
    const result = await resumeSubscription(userId)
    return {
      ...result,
      pauseEndsAt: result.pauseEndsAt?.toISOString() ?? null,
    }
  },
}
