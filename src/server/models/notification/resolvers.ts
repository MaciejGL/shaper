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
  notifications: (_, args) => getNotifications(args),
  notification: (_, args) => getNotificationById(args),
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  createNotification: (_, { input }) => createNotification(input),
  updateNotification: (_, { input }) => updateNotification(input),
  markNotificationRead: (_, { id }) => markNotificationRead(id),
  markAllNotificationsRead: (_, { userId }) => markAllNotificationsRead(userId),
  deleteNotification: (_, { id }) => deleteNotification(id),
}
