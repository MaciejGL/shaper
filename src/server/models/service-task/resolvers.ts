import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'

import {
  getServiceDeliveryTasks,
  getTrainerTasks,
  updateServiceTask,
} from './factory'

export const Query: GQLQueryResolvers = {
  getServiceDeliveryTasks: async (_, args, context) =>
    getServiceDeliveryTasks(args, context),

  getTrainerTasks: async (_, args, context) => getTrainerTasks(args, context),
}

export const Mutation: GQLMutationResolvers = {
  updateServiceTask: async (_, args, context) =>
    updateServiceTask(args, context),
}
