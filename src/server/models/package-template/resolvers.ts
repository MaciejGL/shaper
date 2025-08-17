import {
  GQLMutationResolvers,
  GQLPackageTemplateResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import {
  createPackageTemplate,
  deletePackageTemplate,
  getActivePackageTemplates,
  getPackageTemplate,
  getPackageTemplates,
  updatePackageTemplate,
} from './factory'

export const Query: GQLQueryResolvers<GQLContext> = {
  getPackageTemplates: async (_, args, context) => {
    return getPackageTemplates(args, context)
  },
  getActivePackageTemplates: async (_, args, context) => {
    return getActivePackageTemplates(args, context)
  },
  getPackageTemplate: async (_, args, context) => {
    return getPackageTemplate(args, context)
  },
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  createPackageTemplate: async (_, { input }, context) => {
    return createPackageTemplate(input, context)
  },
  updatePackageTemplate: async (_, { input }, context) => {
    return updatePackageTemplate(input.id, input, context)
  },
  deletePackageTemplate: async (_, { id }) => {
    return deletePackageTemplate(id)
  },
}

export const PackageTemplate: GQLPackageTemplateResolvers<GQLContext> = {
  // Most fields are handled by the model class
  // Add any complex field resolvers here if needed
}
