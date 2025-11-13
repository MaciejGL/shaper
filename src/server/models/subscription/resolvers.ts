import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'

import {
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
  updateServiceDelivery,
} from './factory'

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
}

export const Mutation: GQLMutationResolvers = {
  updateServiceDelivery: async (_, args, context) =>
    updateServiceDelivery(args.deliveryId, args.status, args.notes, context),

  // Coaching subscription management
  pauseClientCoachingSubscription: async (_, args, context) =>
    pauseClientCoachingSubscription(args.clientId, context),

  resumeClientCoachingSubscription: async (_, args, context) =>
    resumeClientCoachingSubscription(args.clientId, context),

  // Admin subscription management
  giveLifetimePremium: async (_, args, context) =>
    giveLifetimePremium(args.userId, context),

  removeUserSubscription: async (_, args) =>
    removeUserSubscription(args.userId),
}
