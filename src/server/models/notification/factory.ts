import {
  GQLCreateNotificationInput,
  GQLQueryNotificationArgs,
  GQLQueryNotificationsArgs,
  GQLUpdateNotificationInput,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

import Notification from './model'

// Fetch notifications for a user with optional filters and pagination
export async function getNotifications(
  { userId, read, type, skip = 0, take = 20 }: GQLQueryNotificationsArgs,
  context: GQLContext,
) {
  // Single optimized query - let the database handle sorting and pagination
  const notifications = await prisma.notification.findMany({
    where: {
      userId,
      read: read ?? undefined,
      type: type ?? undefined,
    },
    orderBy: { createdAt: 'desc' },
    skip: skip || 0,
    take: take || 20,
  })

  return notifications.map((n) => new Notification(n, context))
}

// Fetch a single notification by ID
export async function getNotificationById(
  { id }: Pick<GQLQueryNotificationArgs, 'id'>,
  context: GQLContext,
) {
  const notification = await prisma.notification.findUnique({ where: { id } })
  return notification ? new Notification(notification, context) : null
}

// Create a new notification
export async function createNotification(
  input: GQLCreateNotificationInput,
  context: GQLContext,
) {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      createdBy: input.createdBy,
      message: input.message,
      type: input.type,
      link: input.link,
      relatedItemId: input.relatedItemId,
    },
  })

  return new Notification(notification, context)
}

// Update a notification
export async function updateNotification(
  input: GQLUpdateNotificationInput,
  context: GQLContext,
) {
  const notification = await prisma.notification.update({
    where: { id: input.id },
    data: {
      read: input.read ?? undefined,
      message: input.message ?? undefined,
      type: input.type ?? undefined,
      link: input.link ?? undefined,
    },
  })
  return new Notification(notification, context)
}

// Mark a notification as read
export async function markNotificationRead(id: string, context: GQLContext) {
  const notification = await prisma.notification.update({
    where: { id },
    data: { read: true },
  })

  return new Notification(notification, context)
}

// Mark all notifications as read for a user
export async function markAllNotificationsRead(
  userId: string,
  context: GQLContext,
) {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  })

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
  return notifications.map((n) => new Notification(n, context))
}

// Delete a notification
export async function deleteNotification(id: string) {
  await prisma.notification.delete({ where: { id } })
  return true
}
