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
  removeUserSubscription,
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
  getAllUsersWithSubscriptions: async (_, args, context) =>
    getAllUsersWithSubscriptions(args, context),

  getSubscriptionStats: async () => getSubscriptionStats(),
}

export const Mutation: GQLMutationResolvers = {
  updateServiceDelivery: async (_, args, context) =>
    updateServiceDelivery(args.deliveryId, args.status, args.notes, context),

  // Admin subscription management
  giveLifetimePremium: async (_, args, context) =>
    giveLifetimePremium(args.userId, context),

  removeUserSubscription: async (_, args) =>
    removeUserSubscription(args.userId),
}
