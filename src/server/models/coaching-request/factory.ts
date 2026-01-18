import { GraphQLError } from 'graphql'

import {
  GQLCoachingRequestStatus,
  GQLNotificationType,
  GQLUserRole,
} from '@/generated/graphql-server'
import {
  invalidateClientAccessCache,
  invalidateTrainerAccessCache,
} from '@/lib/access-control'
import { invalidateUserBasicCache } from '@/lib/cache/user-cache'
import { prisma } from '@/lib/db'
import { invalidateUserCache } from '@/lib/getUser'
import {
  notifyCoachingRequest,
  notifyCoachingRequestAccepted,
  notifyCoachingRequestRejected,
} from '@/lib/notifications/push-notification-service'
import { clearCachePattern } from '@/lib/redis'
import { UserWithSession } from '@/types/UserWithSession'
import { GQLContext } from '@/types/gql-context'

import { createNotification } from '../notification/factory'

import CoachingRequest from './model'

/**
 * Helper function to get the latest coaching request between two users
 * Checks both sender/receiver combinations
 */
async function getLatestCoachingRequestBetweenUsers(
  userId1: string,
  userId2: string,
) {
  return prisma.coachingRequest.findFirst({
    where: {
      OR: [
        { senderId: userId1, recipientId: userId2 },
        { senderId: userId2, recipientId: userId1 },
      ],
    },
    include: {
      sender: { select: { id: true, name: true, email: true } },
      recipient: { select: { id: true, name: true, email: true } },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function getCoachingRequest({
  id,
  user,
  context,
}: {
  id: string
  user: UserWithSession
  context: GQLContext
}) {
  const coachingRequest = await prisma.coachingRequest.findUnique({
    where: {
      id,
      OR: [{ senderId: user?.user?.id }, { recipientId: user?.user?.id }],
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: { select: { firstName: true, lastName: true } },
        },
      },
      recipient: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: { select: { firstName: true, lastName: true } },
        },
      },
    },
  })

  return coachingRequest ? new CoachingRequest(coachingRequest, context) : null
}

export async function getCoachingRequests({
  user,
  context,
}: {
  user: UserWithSession
  context: GQLContext
}) {
  const coachingRequests = await prisma.coachingRequest.findMany({
    where: {
      OR: [{ senderId: user?.user?.id }, { recipientId: user?.user?.id }],
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: { select: { firstName: true, lastName: true } },
        },
      },
      recipient: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: { select: { firstName: true, lastName: true } },
        },
      },
    },
  })

  return coachingRequests.map((coachingRequest) => {
    return new CoachingRequest(coachingRequest, context)
  })
}

export async function createCoachingRequest({
  senderId,
  recipientEmail,
  message,
  interestedServices,
  context,
}: {
  senderId: string
  recipientEmail: string
  message?: string | null
  interestedServices?: string[] | null
  context: GQLContext
}) {
  const recipient = await prisma.user.findUnique({
    where: { email: recipientEmail },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      profile: true,
    },
  })

  if (!recipient) {
    console.error(
      `[CoachingRequest] User with email: ${recipientEmail} does not exist.`,
    )
    throw new GraphQLError(`User with email: ${recipientEmail} does not exist.`)
  }

  // Check latest request between these users
  const latestRequest = await getLatestCoachingRequestBetweenUsers(
    senderId,
    recipient.id,
  )

  // Prevent creating new request if latest is pending
  if (latestRequest?.status === GQLCoachingRequestStatus.Pending) {
    throw new GraphQLError(
      `You already have a pending request with this person.`,
    )
  }

  // Prevent re-requesting if you were rejected (they need to initiate)
  if (
    latestRequest?.status === GQLCoachingRequestStatus.Rejected &&
    latestRequest.senderId === senderId
  ) {
    throw new GraphQLError(
      `Your request has been rejected. They will need to send you a new request.`,
    )
  }

  try {
    const coachingRequest = await prisma.coachingRequest.create({
      data: {
        recipientId: recipient.id,
        senderId,
        message,
        interestedServices: interestedServices || undefined,
        status: GQLCoachingRequestStatus.Pending,
      },
    })

    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      include: {
        profile: true,
      },
    })

    const senderName =
      (sender?.profile?.firstName &&
        sender?.profile?.lastName &&
        `${sender?.profile?.firstName} ${sender?.profile?.lastName}`) ||
      sender?.profile?.firstName ||
      sender?.name ||
      sender?.email?.split('@')[0] ||
      'User'

    // Determine the appropriate link based on recipient role
    const notificationLink =
      recipient.role === GQLUserRole.Trainer
        ? '/trainer/clients?tab=requests'
        : '/fitspace/my-trainer'

    console.info(
      `[CoachingRequest] Notification link for ${recipient.role}: ${notificationLink}`,
    )

    await createNotification(
      {
        userId: recipient.id,
        message: `You have a new coaching request${
          senderName ? ` from ${senderName}.` : '.'
        }`,
        type: GQLNotificationType.CoachingRequest,
        createdBy: senderId,
        relatedItemId: coachingRequest.id,
        link: notificationLink,
      },
      context,
    )

    // Send push notification
    await notifyCoachingRequest(recipient.id, senderName, notificationLink)

    return new CoachingRequest(coachingRequest, context)
  } catch (error) {
    console.error(`[CoachingRequest] Error creating coaching request: ${error}`)
    throw new GraphQLError(
      'Something went wrong with creating your request. Please try again.',
    )
  }
}

export async function acceptCoachingRequest({
  id,
  recipientId,
  recipientRole,
  context,
}: {
  id: string
  recipientId: string
  recipientRole: GQLUserRole
  context: GQLContext
}) {
  try {
    // Find the original request to validate
    const originalRequest = await prisma.coachingRequest.findUnique({
      where: { id },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        recipient: { select: { id: true, name: true, email: true } },
      },
    })

    if (!originalRequest) {
      throw new GraphQLError('Coaching request not found')
    }

    if (originalRequest.recipientId !== recipientId) {
      throw new GraphQLError('You are not the recipient of this request')
    }

    if (originalRequest.status !== GQLCoachingRequestStatus.Pending) {
      throw new GraphQLError('This request is no longer pending')
    }

    // Update existing request to accepted status
    const coachingRequest = await prisma.coachingRequest.update({
      where: { id },
      data: {
        status: GQLCoachingRequestStatus.Accepted,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
      },
    })

    // Get the recipient's name (the person who accepted the request)
    const recipientName =
      (coachingRequest.recipient?.profile?.firstName &&
        coachingRequest.recipient?.profile?.lastName &&
        `${coachingRequest.recipient?.profile?.firstName} ${coachingRequest.recipient?.profile?.lastName}`) ||
      coachingRequest.recipient?.profile?.firstName ||
      coachingRequest.recipient?.name ||
      coachingRequest.recipient?.email?.split('@')[0] ||
      'User'

    // Connect trainer and client relationship
    if (recipientRole === GQLUserRole.Trainer) {
      const [, client] = await Promise.all([
        prisma.user.update({
          where: { id: recipientId },
          data: { clients: { connect: { id: coachingRequest.senderId } } },
        }),
        prisma.user.update({
          where: { id: coachingRequest.senderId },
          data: { trainer: { connect: { id: recipientId } } },
          select: { email: true },
        }),
      ])

      // Invalidate client cache so they see new trainer immediately
      if (client.email) {
        invalidateUserCache(client.email)
      }
      await invalidateUserBasicCache(coachingRequest.senderId)
    }

    if (recipientRole === GQLUserRole.Client) {
      const [client] = await Promise.all([
        prisma.user.update({
          where: { id: recipientId },
          data: { trainer: { connect: { id: coachingRequest.senderId } } },
          select: { email: true },
        }),
        prisma.user.update({
          where: { id: coachingRequest.senderId },
          data: { clients: { connect: { id: recipientId } } },
        }),
      ])

      // Invalidate client cache so they see new trainer immediately
      if (client.email) {
        invalidateUserCache(client.email)
      }
      await invalidateUserBasicCache(recipientId)
    }

    await createNotification(
      {
        userId: coachingRequest.senderId,
        message: `${recipientName} accepted your coaching request.`,
        type: GQLNotificationType.CoachingRequestAccepted,
        createdBy: recipientId,
        relatedItemId: coachingRequest.id,
      },
      context,
    )

    await notifyCoachingRequestAccepted(coachingRequest.senderId, recipientName)

    // Invalidate access control cache and trainer cache for both users
    const trainerId =
      recipientRole === GQLUserRole.Trainer
        ? recipientId
        : coachingRequest.senderId
    const clientId =
      recipientRole === GQLUserRole.Client
        ? recipientId
        : coachingRequest.senderId

    await Promise.all([
      invalidateTrainerAccessCache(trainerId),
      invalidateClientAccessCache(clientId),
      // Invalidate getMyTrainer cache for the client - pattern match all keys
      clearCachePattern(`my-trainer:user-id:${clientId}:*`),
      // Subscription/premium state is derived from subscription status query on the client.
      // Clear any user subscription-related caches so UI can reflect access immediately.
      clearCachePattern(`user:${clientId}:subscription*`),
    ])

    return new CoachingRequest(coachingRequest, context)
  } catch (error) {
    console.error(
      `[CoachingRequest] Error accepting coaching request: ${error}`,
    )
    throw new GraphQLError(
      error instanceof GraphQLError
        ? error.message
        : 'Something went wrong with accepting your request. Please try again.',
    )
  }
}

export async function cancelCoachingRequest({
  id,
  senderId,
  context,
}: {
  id: string
  senderId: string
  context: GQLContext
}) {
  try {
    const originalRequest = await prisma.coachingRequest.findUnique({
      where: { id },
    })

    if (!originalRequest) {
      throw new GraphQLError('Coaching request not found')
    }

    if (originalRequest.senderId !== senderId) {
      throw new GraphQLError('You are not the sender of this request')
    }

    if (originalRequest.status !== GQLCoachingRequestStatus.Pending) {
      throw new GraphQLError('This request is no longer pending')
    }

    // Update existing request to cancelled status
    const coachingRequest = await prisma.coachingRequest.update({
      where: { id },
      data: {
        status: GQLCoachingRequestStatus.Cancelled,
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        recipient: { select: { id: true, name: true, email: true } },
      },
    })

    return new CoachingRequest(coachingRequest, context)
  } catch (error) {
    console.error(
      `[CoachingRequest] Error cancelling coaching request: ${error}`,
    )
    throw new GraphQLError(
      error instanceof GraphQLError
        ? error.message
        : 'Something went wrong with cancelling your request. Please try again.',
    )
  }
}

export async function rejectCoachingRequest({
  id,
  recipientId,
  context,
}: {
  id: string
  recipientId: string
  context: GQLContext
}) {
  try {
    const originalRequest = await prisma.coachingRequest.findUnique({
      where: { id },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        recipient: { select: { id: true, name: true, email: true } },
      },
    })

    if (!originalRequest) {
      throw new GraphQLError('Coaching request not found')
    }

    if (originalRequest.recipientId !== recipientId) {
      throw new GraphQLError('You are not the recipient of this request')
    }

    if (originalRequest.status !== GQLCoachingRequestStatus.Pending) {
      throw new GraphQLError('This request is no longer pending')
    }

    // Update existing request to rejected status
    const coachingRequest = await prisma.coachingRequest.update({
      where: { id },
      data: {
        status: GQLCoachingRequestStatus.Rejected,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
      },
    })

    const recipientName =
      (coachingRequest.recipient?.profile?.firstName &&
        coachingRequest.recipient?.profile?.lastName &&
        `${coachingRequest.recipient?.profile?.firstName} ${coachingRequest.recipient?.profile?.lastName}`) ||
      coachingRequest.recipient?.profile?.firstName ||
      coachingRequest.recipient?.name ||
      coachingRequest.recipient?.email?.split('@')[0] ||
      'User'
    await createNotification(
      {
        userId: coachingRequest.senderId,
        message: `${recipientName} has rejected your request to start coaching.`,
        type: GQLNotificationType.CoachingRequestRejected,
        createdBy: recipientId,
        relatedItemId: coachingRequest.id,
      },
      context,
    )

    await notifyCoachingRequestRejected(coachingRequest.senderId, recipientName)

    return new CoachingRequest(coachingRequest, context)
  } catch (error) {
    console.error(
      `[CoachingRequest] Error rejecting coaching request: ${error}`,
    )
    throw new GraphQLError(
      error instanceof GraphQLError
        ? error.message
        : 'Something went wrong with rejecting your request.',
    )
  }
}
