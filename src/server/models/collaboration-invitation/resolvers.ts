import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

import CollaborationInvitation from './model'

export const Query: GQLQueryResolvers<GQLContext> = {
  myCollaborationInvitations: async (_, __, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    const invitations = await prisma.collaborationInvitation.findMany({
      where: {
        recipientId: user.user.id,
      },
      include: {
        sender: {
          include: {
            profile: true,
          },
        },
        recipient: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return invitations.map(
      (invitation) => new CollaborationInvitation(invitation, context),
    )
  },

  sentCollaborationInvitations: async (_, __, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    const invitations = await prisma.collaborationInvitation.findMany({
      where: {
        senderId: user.user.id,
      },
      include: {
        sender: {
          include: {
            profile: true,
          },
        },
        recipient: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return invitations.map(
      (invitation) => new CollaborationInvitation(invitation, context),
    )
  },
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  sendCollaborationInvitation: async (_, { input }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    const { recipientEmail, message } = input
    const senderId = user.user.id

    // Check if recipient exists and is a trainer
    const recipient = await prisma.user.findUnique({
      where: { email: recipientEmail },
    })

    if (!recipient) {
      throw new Error('User with this email not found')
    }

    if (recipient.role !== 'TRAINER') {
      throw new Error('Can only send collaboration invitations to trainers')
    }

    if (recipient.id === senderId) {
      throw new Error('Cannot send invitation to yourself')
    }

    // Check if invitation already exists
    const existingInvitation = await prisma.collaborationInvitation.findFirst({
      where: {
        senderId,
        recipientId: recipient.id,
        status: 'PENDING',
      },
    })

    if (existingInvitation) {
      throw new Error('Invitation already sent to this user')
    }

    // Create the invitation
    const invitation = await prisma.collaborationInvitation.create({
      data: {
        senderId,
        recipientId: recipient.id,
        message,
      },
      include: {
        sender: {
          include: {
            profile: true,
          },
        },
        recipient: {
          include: {
            profile: true,
          },
        },
      },
    })

    // Create notification for recipient
    await prisma.notification.create({
      data: {
        userId: recipient.id,
        createdBy: senderId,
        type: 'COLLABORATION_INVITATION',
        message: `${user.user.name || user.user.email} sent you a collaboration invitation`,
        relatedItemId: invitation.id,
        link: `/collaboration/invitations`,
      },
    })

    return new CollaborationInvitation(invitation, context)
  },

  respondToCollaborationInvitation: async (_, { input }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    const { invitationId, action } = input
    const userId = user.user.id

    const invitation = await prisma.collaborationInvitation.findUnique({
      where: { id: invitationId },
      include: {
        sender: {
          include: {
            profile: true,
          },
        },
        recipient: {
          include: {
            profile: true,
          },
        },
      },
    })

    if (!invitation) {
      throw new Error('Invitation not found')
    }

    if (invitation.recipientId !== userId) {
      throw new Error('Not authorized to respond to this invitation')
    }

    if (invitation.status !== 'PENDING') {
      throw new Error('Invitation has already been responded to')
    }

    // Update invitation status
    const updatedInvitation = await prisma.collaborationInvitation.update({
      where: { id: invitationId },
      data: {
        status: action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED',
      },
      include: {
        sender: {
          include: {
            profile: true,
          },
        },
        recipient: {
          include: {
            profile: true,
          },
        },
      },
    })

    // Create notification for sender
    const message =
      action === 'ACCEPT'
        ? `${user.user.name || user.user.email} accepted your collaboration invitation`
        : `${user.user.name || user.user.email} rejected your collaboration invitation`

    await prisma.notification.create({
      data: {
        userId: invitation.senderId,
        createdBy: userId,
        type: 'COLLABORATION_RESPONSE',
        message,
        relatedItemId: invitation.id,
        link: `/collaboration/invitations`,
      },
    })

    return new CollaborationInvitation(updatedInvitation, context)
  },
}
