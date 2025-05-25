import { GraphQLError } from 'graphql'

import {
  GQLCoachingRequestStatus,
  GQLNotificationType,
  GQLUserRole,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { UserWithSession } from '@/types/UserWithSession'

import { createNotification } from '../notification/factory'

import CoachingRequest from './model'

export async function getCoachingRequest({
  id,
  user,
}: {
  id: string
  user: UserWithSession
}) {
  const coachingRequest = await prisma.coachingRequest.findUnique({
    where: {
      id,
      OR: [{ senderId: user?.user?.id }, { recipientId: user?.user?.id }],
    },
  })

  return coachingRequest ? new CoachingRequest(coachingRequest) : null
}

export async function getCoachingRequests({ user }: { user: UserWithSession }) {
  const coachingRequests = await prisma.coachingRequest.findMany({
    where: {
      OR: [{ senderId: user?.user?.id }, { recipientId: user?.user?.id }],
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return coachingRequests.map((coachingRequest) => {
    return new CoachingRequest(coachingRequest)
  })
}

export async function upsertCoachingRequest({
  senderId,
  recipientEmail,
  message,
}: {
  senderId: string
  recipientEmail: string
  message?: string | null
}) {
  const existingCoachingRequest = await prisma.coachingRequest.findFirst({
    where: {
      recipient: { email: recipientEmail },
      senderId,
    },
    include: {
      recipient: {
        select: {
          profile: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  })

  if (existingCoachingRequest) {
    if (existingCoachingRequest.status === GQLCoachingRequestStatus.Accepted) {
      throw new GraphQLError(
        `You already have been connected with this person.`,
      )
    }

    if (existingCoachingRequest.status === GQLCoachingRequestStatus.Rejected) {
      throw new GraphQLError(
        `Your request has been rejected by this person. You can't send another request to them. They will need to send you a new request.`,
      )
    }

    try {
      const updatedCoachingRequest = await prisma.coachingRequest.update({
        where: {
          id: existingCoachingRequest.id,
          OR: [
            { status: GQLCoachingRequestStatus.Pending },
            { status: GQLCoachingRequestStatus.Cancelled },
          ],
        },
        data: {
          message,
          status: GQLCoachingRequestStatus.Pending,
        },
      })

      return new CoachingRequest(updatedCoachingRequest)
    } catch (error) {
      console.error(
        `[CoachingRequest] Error updating coaching request: ${error}`,
      )
      throw new GraphQLError(
        'Something went wrong with updating your request. Please try again.',
      )
    }
  } else {
    const recipient = await prisma.user.findUnique({
      where: { email: recipientEmail },
    })

    // TODO: Maybe send an email to the recipient with template to download the app.

    if (!recipient) {
      console.error(
        `[CoachingRequest] User with email: ${recipientEmail} does not exist.`,
      )
      throw new GraphQLError(
        `User with email: ${recipientEmail} does not exist.`,
      )
    }

    try {
      const coachingRequest = await prisma.coachingRequest.create({
        data: {
          recipientId: recipient.id,
          senderId,
          message,
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
        sender?.profile?.firstName &&
        sender?.profile?.lastName &&
        `${sender?.profile?.firstName} ${sender?.profile?.lastName}`

      await createNotification({
        userId: recipient.id,
        message: `You have a new coaching request${
          senderName ? ` from ${senderName}.` : '.'
        }`,
        type: GQLNotificationType.CoachingRequest,
        createdBy: senderId,
        relatedItemId: coachingRequest.id,
      })
      return new CoachingRequest(coachingRequest)
    } catch (error) {
      console.error(
        `[CoachingRequest] Error creating coaching request: ${error}`,
      )
      throw new GraphQLError(
        'Something went wrong with creating your request. Please try again.',
      )
    }
  }
}

export async function acceptCoachingRequest({
  id,
  recipientId,
  recipientRole,
}: {
  id: string
  recipientId: string
  recipientRole: GQLUserRole
}) {
  try {
    const coachingRequest = await prisma.coachingRequest.update({
      where: {
        id,
        status: GQLCoachingRequestStatus.Pending,
        recipientId,
      },
      include: {
        sender: {
          select: {
            name: true,
          },
        },
      },
      data: {
        status: GQLCoachingRequestStatus.Accepted,
      },
    })

    // If Sender is a Coach, connect Client to Coach.
    if (recipientRole === GQLUserRole.Trainer) {
      await prisma.user.update({
        where: { id: recipientId },
        data: {
          clients: {
            connect: { id: coachingRequest.senderId },
          },
        },
      })
      await prisma.user.update({
        where: { id: coachingRequest.senderId },
        data: {
          trainer: {
            connect: { id: recipientId },
          },
        },
      })
    }

    // If Sender is a Client, connect Coach to Client.
    if (recipientRole === GQLUserRole.Client) {
      await prisma.user.update({
        where: { id: recipientId },
        data: {
          trainer: { connect: { id: coachingRequest.senderId } },
        },
      })
      await prisma.user.update({
        where: { id: coachingRequest.senderId },
        data: {
          clients: {
            connect: { id: recipientId },
          },
        },
      })
    }

    await createNotification({
      userId: coachingRequest.senderId,
      message: `${coachingRequest.sender?.name ?? 'Someone'} has accepted your request to start coaching.`,
      type: GQLNotificationType.CoachingRequestAccepted,
      createdBy: recipientId,
      relatedItemId: coachingRequest.id,
    })

    return coachingRequest ? new CoachingRequest(coachingRequest) : null
  } catch (error) {
    console.error(
      `[CoachingRequest] Error accepting coaching request: ${error}`,
    )
    throw new GraphQLError(
      'Something went wrong with accepting your request. Please try again.',
    )
  }
}

export async function cancelCoachingRequest({
  id,
  senderId,
}: {
  id: string
  senderId: string
}) {
  try {
    const coachingRequest = await prisma.coachingRequest.update({
      where: { id, senderId, status: GQLCoachingRequestStatus.Pending },
      data: { status: GQLCoachingRequestStatus.Cancelled },
    })

    return coachingRequest ? new CoachingRequest(coachingRequest) : null
  } catch (error) {
    console.error(
      `[CoachingRequest] Error cancelling coaching request: ${error}`,
    )
    throw new GraphQLError(
      'Something went wrong with cancelling your request. Please try again.',
    )
  }
}

export async function rejectCoachingRequest({
  id,
  recipientId,
}: {
  id: string
  recipientId: string
}) {
  try {
    const coachingRequest = await prisma.coachingRequest.update({
      where: { id, recipientId, status: GQLCoachingRequestStatus.Pending },
      include: {
        sender: {
          select: {
            name: true,
          },
        },
      },
      data: { status: GQLCoachingRequestStatus.Rejected },
    })

    await createNotification({
      userId: coachingRequest.senderId,
      message: `${coachingRequest.sender?.name ?? 'Someone'} has rejected your request to start coaching.`,
      type: GQLNotificationType.CoachingRequestRejected,
      createdBy: recipientId,
      relatedItemId: coachingRequest.id,
    })

    return coachingRequest ? new CoachingRequest(coachingRequest) : null
  } catch (error) {
    console.error(
      `[CoachingRequest] Error rejecting coaching request: ${error}`,
    )
    throw new GraphQLError('Something went wrong with rejecting your request.')
  }
}
