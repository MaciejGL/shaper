import {
  GQLCreateNotificationInput,
  GQLQueryNotificationArgs,
  GQLQueryNotificationsArgs,
  GQLUpdateNotificationInput,
} from '@/generated/graphql-server'
import { Notification as PrismaNotification } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { deleteFromCache, getFromCache, setInCache } from '@/lib/redis'
import { GQLContext } from '@/types/gql-context'

import Notification from './model'

// Cache TTL: 30 days for older notifications
const CACHE_TTL_DAYS = 30 * 24 * 60 * 60

// Fetch notifications for a user with optional filters and pagination
export async function getNotifications(
  { userId, read, type, skip = 0, take = 20 }: GQLQueryNotificationsArgs,
  context: GQLContext,
) {
  const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  // Get fresh notifications from DB (last 10 days)
  const freshNotifications = await prisma.notification.findMany({
    where: {
      userId,
      read: read ?? undefined,
      type: type ?? undefined,
      createdAt: { gte: tenDaysAgo },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Get cached older notifications (10-30 days old)
  const cacheKey = `notifications:${userId}:${read ?? 'all'}:${type ?? 'all'}`
  let olderNotifications: PrismaNotification[] = []

  try {
    olderNotifications =
      (await getFromCache<PrismaNotification[]>(cacheKey)) || []
  } catch {
    // Cache miss - fetch from DB and cache
    const dbOlderNotifications = await prisma.notification.findMany({
      where: {
        userId,
        read: read ?? undefined,
        type: type ?? undefined,
        createdAt: { gte: oneMonthAgo, lt: tenDaysAgo },
      },
      orderBy: { createdAt: 'desc' },
    })
    await setInCache(cacheKey, dbOlderNotifications, CACHE_TTL_DAYS)
    olderNotifications = dbOlderNotifications
  }

  // Combine, sort, and paginate
  const allNotifications = [...freshNotifications, ...olderNotifications]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(skip || 0, (skip || 0) + (take || 20))

  return allNotifications.map((n) => new Notification(n, context))
}

// Helper function to invalidate notification cache for a user
async function invalidateNotificationCache(userId: string): Promise<void> {
  try {
    // Clear all possible cache combinations for this user
    const cacheKeys = [
      `notifications:${userId}:all:all`,
      `notifications:${userId}:true:all`,
      `notifications:${userId}:false:all`,
    ]

    for (const key of cacheKeys) {
      await deleteFromCache(key)
    }
  } catch (error) {
    console.error('[CACHE] Failed to invalidate notification cache:', error)
  }
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

  await invalidateNotificationCache(input.userId)
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

  await invalidateNotificationCache(notification.userId)
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

  await invalidateNotificationCache(userId)

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
