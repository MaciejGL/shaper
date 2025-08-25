import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import {
  getServiceDeliveryTasks,
  getTrainerTasks,
  updateServiceTask,
} from './factory'

export const Query: GQLQueryResolvers<GQLContext> = {
  getServiceDeliveryTasks: async (_, args, context) =>
    getServiceDeliveryTasks(args, context),

  getTrainerTasks: async (_, args, context) => getTrainerTasks(args, context),
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  updateServiceTask: async (_, args, context) =>
    updateServiceTask(args, context),
}
