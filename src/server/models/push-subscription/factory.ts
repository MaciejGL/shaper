import {
  GQLCreatePushSubscriptionInput,
  GQLUpdatePushSubscriptionInput,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

import PushSubscription from './model'

// Get all push subscriptions for a user
export async function getPushSubscriptions(
  userId: string,
  context: GQLContext,
) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
  return subscriptions.map((sub) => new PushSubscription(sub, context))
}

// Get a specific push subscription by endpoint
export async function getPushSubscriptionByEndpoint(
  endpoint: string,
  context: GQLContext,
) {
  const subscription = await prisma.pushSubscription.findUnique({
    where: { endpoint },
  })
  return subscription ? new PushSubscription(subscription, context) : null
}

// Create a new push subscription
export async function createPushSubscription(
  input: GQLCreatePushSubscriptionInput,
  userId: string,
  context: GQLContext,
) {
  // Check if subscription already exists for this user/endpoint
  const existing = await prisma.pushSubscription.findUnique({
    where: { endpoint: input.endpoint },
  })

  if (existing) {
    // Update existing subscription
    const updated = await prisma.pushSubscription.update({
      where: { endpoint: input.endpoint },
      data: {
        p256dh: input.p256dh,
        auth: input.auth,
        userAgent: input.userAgent,
        updatedAt: new Date(),
      },
    })
    return new PushSubscription(updated, context)
  }

  // Create new subscription
  const subscription = await prisma.pushSubscription.create({
    data: {
      userId,
      endpoint: input.endpoint,
      p256dh: input.p256dh,
      auth: input.auth,
      userAgent: input.userAgent,
    },
  })
  return new PushSubscription(subscription, context)
}

// Update a push subscription
export async function updatePushSubscription(
  input: GQLUpdatePushSubscriptionInput,
  context: GQLContext,
) {
  const subscription = await prisma.pushSubscription.update({
    where: { id: input.id },
    data: {
      userAgent: input.userAgent,
      updatedAt: new Date(),
    },
  })
  return new PushSubscription(subscription, context)
}

// Delete a push subscription by endpoint
export async function deletePushSubscription(endpoint: string) {
  await prisma.pushSubscription.delete({
    where: { endpoint },
  })
  return true
}

// Delete all push subscriptions for a user
export async function deletePushSubscriptionsForUser(userId: string) {
  await prisma.pushSubscription.deleteMany({
    where: { userId },
  })
  return true
}

// Get all push subscriptions for notification sending
export async function getAllPushSubscriptionsForNotification(
  userIds?: string[],
) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: userIds ? { userId: { in: userIds } } : {},
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
  })

  return subscriptions.map((sub) => ({
    endpoint: sub.endpoint,
    keys: {
      p256dh: sub.p256dh,
      auth: sub.auth,
    },
    userId: sub.userId,
    pushNotificationsEnabled: sub.user.profile?.pushNotifications ?? false,
  }))
}
