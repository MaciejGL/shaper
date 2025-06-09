import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import {
  createNotification,
  deleteNotification,
  getNotificationById,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotification,
} from './factory'

export const Query: GQLQueryResolvers<GQLContext> = {
  notifications: (_, args, context) => getNotifications(args, context),
  notification: (_, args, context) => getNotificationById(args, context),
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  createNotification: (_, { input }, context) =>
    createNotification(input, context),
  updateNotification: (_, { input }, context) =>
    updateNotification(input, context),
  markNotificationRead: (_, { id }, context) =>
    markNotificationRead(id, context),
  markAllNotificationsRead: (_, { userId }, context) =>
    markAllNotificationsRead(userId, context),
  deleteNotification: (_, { id }) => deleteNotification(id),
}
