import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'

import {
  createNotification,
  deleteNotification,
  getNotificationById,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotification,
} from './factory'

export const Query: GQLQueryResolvers = {
  notifications: (_, args) => getNotifications(args),
  notification: (_, args) => getNotificationById(args),
}

export const Mutation: GQLMutationResolvers = {
  createNotification: (_, { input }) => createNotification(input),
  updateNotification: (_, { input }) => updateNotification(input),
  markNotificationRead: (_, { id }) => markNotificationRead(id),
  markAllNotificationsRead: (_, { userId }) => markAllNotificationsRead(userId),
  deleteNotification: (_, { id }) => deleteNotification(id),
}
