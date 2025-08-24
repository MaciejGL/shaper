import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'

import {
  checkPremiumAccess,
  getActivePackageTemplates,
  getMyServiceDeliveries,
  getTrainerDeliveries,
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
}

export const Mutation: GQLMutationResolvers = {
  updateServiceDelivery: async (_, args, context) =>
    updateServiceDelivery(args.deliveryId, args.status, args.notes, context),
}
