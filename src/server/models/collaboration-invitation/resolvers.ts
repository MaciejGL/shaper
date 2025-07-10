import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import {
  sendCollaborationInvitationNotification,
  sendCollaborationResponseNotification,
} from '@/lib/notifications/collaboration-notifications'
import UserPublic from '@/server/models/user-public/model'
import { GQLContext } from '@/types/gql-context'

import CollaborationInvitation, {
  AvailablePlan,
  PlanCollaboratorSummary,
  PlanWithPermissions,
  TeamMember,
} from './model'

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

  myTeamMembers: async (_, __, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    // Get all accepted collaboration invitations where current user is sender or recipient
    const acceptedCollaborations =
      await prisma.collaborationInvitation.findMany({
        where: {
          OR: [
            {
              senderId: user.user.id,
              status: 'ACCEPTED',
            },
            {
              recipientId: user.user.id,
              status: 'ACCEPTED',
            },
          ],
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
          updatedAt: 'desc',
        },
      })

    // Transform to TeamMember format
    const teammates = acceptedCollaborations.map((invitation) => {
      // Determine who the teammate is (the other person in the collaboration)
      const isCurrentUserSender = invitation.senderId === user.user.id
      const teammate = isCurrentUserSender
        ? invitation.recipient
        : invitation.sender
      const addedBy = invitation.sender

      return new TeamMember(
        {
          id: invitation.id,
          user: teammate,
          addedBy: addedBy,
          isCurrentUserSender,
          createdAt: invitation.createdAt,
          updatedAt: invitation.updatedAt,
        },
        context,
      )
    })

    return teammates
  },

  myPlanCollaborators: async (_, __, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    // Get all plan collaborators for plans owned by the current user
    const [trainingPlanCollaborators, mealPlanCollaborators, teamMembers] =
      await Promise.all([
        // Training plan collaborators
        prisma.trainingPlanCollaborator.findMany({
          where: {
            trainingPlan: {
              createdById: user.user.id,
            },
          },
          include: {
            trainingPlan: true,
            collaborator: {
              include: {
                profile: true,
              },
            },
            addedBy: {
              include: {
                profile: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        // Meal plan collaborators
        prisma.mealPlanCollaborator.findMany({
          where: {
            mealPlan: {
              createdById: user.user.id,
            },
          },
          include: {
            mealPlan: true,
            collaborator: {
              include: {
                profile: true,
              },
            },
            addedBy: {
              include: {
                profile: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        // Team members (accepted collaboration invitations)
        prisma.collaborationInvitation.findMany({
          where: {
            OR: [
              {
                senderId: user.user.id,
                status: 'ACCEPTED',
              },
              {
                recipientId: user.user.id,
                status: 'ACCEPTED',
              },
            ],
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
        }),
      ])

    // Transform plan collaborations to PlanCollaboratorSummary format
    const planCollaborators = [
      ...trainingPlanCollaborators.map(
        (collab) =>
          new PlanCollaboratorSummary(
            {
              id: collab.id,
              collaborator: new UserPublic(collab.collaborator, context),
              addedBy: new UserPublic(collab.addedBy, context),
              permission: collab.permission,
              planType: 'TRAINING',
              planId: collab.trainingPlanId,
              planTitle: collab.trainingPlan.title,
              createdAt: collab.createdAt,
              updatedAt: collab.updatedAt,
            },
            context,
          ),
      ),
      ...mealPlanCollaborators.map(
        (collab) =>
          new PlanCollaboratorSummary(
            {
              id: collab.id,
              collaborator: new UserPublic(collab.collaborator, context),
              addedBy: new UserPublic(collab.addedBy, context),
              permission: collab.permission,
              planType: 'MEAL',
              planId: collab.mealPlanId,
              planTitle: collab.mealPlan.title,
              createdAt: collab.createdAt,
              updatedAt: collab.updatedAt,
            },
            context,
          ),
      ),
    ]

    // Get user IDs who already have plan collaborations
    const collaboratorIds = new Set(
      planCollaborators.map((collab) => collab.collaborator.id),
    )

    // Extract team member users and find those without plan permissions
    const teammates = teamMembers.map((invitation) => {
      const isCurrentUserSender = invitation.senderId === user.user.id
      return isCurrentUserSender ? invitation.recipient : invitation.sender
    })

    // Create placeholder entries for team members without plan permissions
    const teamMembersWithoutPlanAccess = teammates
      .filter((teammate) => !collaboratorIds.has(teammate.id))
      .map(
        (teammate) =>
          new PlanCollaboratorSummary(
            {
              id: `placeholder-${teammate.id}`, // Unique placeholder ID
              collaborator: new UserPublic(teammate, context),
              addedBy: new UserPublic(user.user, context),
              permission: 'VIEW', // Placeholder permission
              planType: 'PLACEHOLDER', // Special type to indicate no actual plan
              planId: '',
              planTitle: '',
              createdAt: new Date(), // Current date
              updatedAt: new Date(),
            },
            context,
          ),
      )

    // Combine all collaborators (with and without plan permissions)
    const allCollaborators = [
      ...planCollaborators,
      ...teamMembersWithoutPlanAccess,
    ]

    // Sort by creation date (newest first)
    return allCollaborators.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  },

  availablePlansForTeamMember: async (_, { userId }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    // Verify that the requested user is actually a team member
    const isTeamMember = await prisma.collaborationInvitation.findFirst({
      where: {
        OR: [
          { senderId: user.user.id, recipientId: userId },
          { senderId: userId, recipientId: user.user.id },
        ],
        status: 'ACCEPTED',
      },
    })

    if (!isTeamMember) {
      throw new Error('User is not a team member')
    }

    // Get current user's plans that the team member is NOT already assigned to
    const [trainingPlans, mealPlans] = await Promise.all([
      // Training plans owned by current user
      prisma.trainingPlan.findMany({
        where: {
          createdById: user.user.id,
          assignedTo: null,
          active: false,
          NOT: {
            collaborators: {
              some: {
                collaboratorId: userId,
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      // Meal plans owned by current user
      prisma.mealPlan.findMany({
        where: {
          createdById: user.user.id,
          assignedTo: null,
          active: false,
          NOT: {
            collaborators: {
              some: {
                collaboratorId: userId,
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ])

    // Transform to AvailablePlan format
    const availablePlans = [
      ...trainingPlans.map(
        (plan) =>
          new AvailablePlan(
            {
              id: plan.id,
              title: plan.title,
              planType: 'TRAINING' as const,
              description: plan.description,
              isTemplate: plan.isTemplate,
              createdAt: plan.createdAt,
            },
            context,
          ),
      ),
      ...mealPlans.map(
        (plan) =>
          new AvailablePlan(
            {
              id: plan.id,
              title: plan.title,
              planType: 'MEAL' as const,
              description: plan.description,
              isTemplate: plan.isTemplate,
              createdAt: plan.createdAt,
            },
            context,
          ),
      ),
    ]

    // Sort by creation date (newest first)
    return availablePlans.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  },

  allPlansWithPermissions: async (_, { userId }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    // Verify that the requested user is actually a team member
    const isTeamMember = await prisma.collaborationInvitation.findFirst({
      where: {
        OR: [
          { senderId: user.user.id, recipientId: userId },
          { senderId: userId, recipientId: user.user.id },
        ],
        status: 'ACCEPTED',
      },
    })

    if (!isTeamMember) {
      throw new Error('User is not a team member')
    }

    // Get all plans owned by current user with their current permissions for the team member
    const [
      trainingPlans,
      mealPlans,
      trainingCollaborations,
      mealCollaborations,
    ] = await Promise.all([
      // All training plans owned by current user
      prisma.trainingPlan.findMany({
        where: {
          createdById: user.user.id,
          assignedTo: null,
          active: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      // All meal plans owned by current user
      prisma.mealPlan.findMany({
        where: {
          createdById: user.user.id,
          assignedTo: null,
          active: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      // Existing training plan collaborations for this user
      prisma.trainingPlanCollaborator.findMany({
        where: {
          collaboratorId: userId,
          trainingPlan: {
            createdById: user.user.id,
          },
        },
      }),
      // Existing meal plan collaborations for this user
      prisma.mealPlanCollaborator.findMany({
        where: {
          collaboratorId: userId,
          mealPlan: {
            createdById: user.user.id,
          },
        },
      }),
    ])

    // Create lookup maps for current permissions
    const trainingPermissions = new Map(
      trainingCollaborations.map((collab) => [
        collab.trainingPlanId,
        collab.permission,
      ]),
    )
    const mealPermissions = new Map(
      mealCollaborations.map((collab) => [
        collab.mealPlanId,
        collab.permission,
      ]),
    )

    // Transform to PlanWithPermissions format
    const plansWithPermissions = [
      ...trainingPlans.map(
        (plan) =>
          new PlanWithPermissions(
            {
              id: plan.id,
              title: plan.title,
              planType: 'TRAINING' as const,
              description: plan.description,
              isTemplate: plan.isTemplate,
              createdAt: plan.createdAt,
              currentPermission: trainingPermissions.get(plan.id) || null,
              hasAccess: trainingPermissions.has(plan.id),
            },
            context,
          ),
      ),
      ...mealPlans.map(
        (plan) =>
          new PlanWithPermissions(
            {
              id: plan.id,
              title: plan.title,
              planType: 'MEAL' as const,
              description: plan.description,
              isTemplate: plan.isTemplate,
              createdAt: plan.createdAt,
              currentPermission: mealPermissions.get(plan.id) || null,
              hasAccess: mealPermissions.has(plan.id),
            },
            context,
          ),
      ),
    ]

    // Sort by creation date (newest first)
    return plansWithPermissions.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
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
      where: { email: recipientEmail, role: 'TRAINER' },
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
    await sendCollaborationInvitationNotification(
      senderId,
      recipient.id,
      invitation.id,
      context,
    )

    return new CollaborationInvitation(invitation, context)
  },

  respondToCollaborationInvitation: async (_, { input }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    const { invitationId, action } = input
    const userId = user.user.id

    // First try to find the invitation by ID
    let invitation = await prisma.collaborationInvitation.findUnique({
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

    // If not found, assume invitationId is actually a userId and find the invitation
    if (!invitation) {
      invitation = await prisma.collaborationInvitation.findFirst({
        where: {
          OR: [
            { senderId: userId, recipientId: invitationId },
            { senderId: invitationId, recipientId: userId },
          ],
          status: 'ACCEPTED',
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
    }

    if (!invitation) {
      throw new Error('Invitation not found')
    }

    // Allow both sender and recipient to reject/remove the collaboration
    const isRecipient = invitation.recipientId === userId
    const isSender = invitation.senderId === userId

    if (!isRecipient && !isSender) {
      throw new Error('Not authorized to respond to this invitation')
    }

    // For pending invitations, only the recipient can respond
    if (invitation.status === 'PENDING' && !isRecipient) {
      throw new Error('Only the recipient can respond to a pending invitation')
    }

    // For accepted invitations, either party can "reject" to remove the collaboration
    if (invitation.status === 'ACCEPTED' && action === 'REJECT') {
      // This is a team member removal - remove all plan collaborations
      await prisma.$transaction(async (tx) => {
        // Get the other user ID (the one being removed from perspective of current user)
        const otherUserId = isRecipient
          ? invitation.senderId
          : invitation.recipientId

        // Remove all training plan collaborations where current user owns the plan
        // and the other user is a collaborator
        await tx.trainingPlanCollaborator.deleteMany({
          where: {
            collaboratorId: otherUserId,
            trainingPlan: {
              createdById: userId,
            },
          },
        })

        // Remove all meal plan collaborations where current user owns the plan
        // and the other user is a collaborator
        await tx.mealPlanCollaborator.deleteMany({
          where: {
            collaboratorId: otherUserId,
            mealPlan: {
              createdById: userId,
            },
          },
        })

        // Also remove collaborations where the other user owns the plan
        // and current user is a collaborator (mutual cleanup)
        await tx.trainingPlanCollaborator.deleteMany({
          where: {
            collaboratorId: userId,
            trainingPlan: {
              createdById: otherUserId,
            },
          },
        })

        await tx.mealPlanCollaborator.deleteMany({
          where: {
            collaboratorId: userId,
            mealPlan: {
              createdById: otherUserId,
            },
          },
        })

        // Update invitation status to rejected
        await tx.collaborationInvitation.update({
          where: { id: invitation.id },
          data: {
            status: 'REJECTED',
          },
        })
      })
    } else if (invitation.status === 'PENDING') {
      // Regular invitation response
      await prisma.collaborationInvitation.update({
        where: { id: invitation.id },
        data: {
          status: action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED',
        },
      })
    } else {
      throw new Error('Invalid action for current invitation status')
    }

    // Get updated invitation
    const updatedInvitation = await prisma.collaborationInvitation.findUnique({
      where: { id: invitation.id },
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

    if (!updatedInvitation) {
      throw new Error('Failed to retrieve updated invitation')
    }

    // Create notification for the other party
    const notificationRecipientId = isRecipient
      ? invitation.senderId
      : invitation.recipientId
    await sendCollaborationResponseNotification(
      userId,
      notificationRecipientId,
      invitation.id,
      action,
      context,
    )

    return new CollaborationInvitation(updatedInvitation, context)
  },

  bulkUpdatePlanPermissions: async (_, { input }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    const { userId, planUpdates } = input

    // Verify that the target user is actually a team member
    const isTeamMember = await prisma.collaborationInvitation.findFirst({
      where: {
        OR: [
          { senderId: user.user.id, recipientId: userId },
          { senderId: userId, recipientId: user.user.id },
        ],
        status: 'ACCEPTED',
      },
    })

    if (!isTeamMember) {
      throw new Error('User is not a team member')
    }

    // Verify that all plans are owned by the current user
    const planIds = planUpdates.map((update) => update.planId)
    const [trainingPlans, mealPlans] = await Promise.all([
      prisma.trainingPlan.findMany({
        where: {
          id: { in: planIds },
          createdById: user.user.id,
        },
      }),
      prisma.mealPlan.findMany({
        where: {
          id: { in: planIds },
          createdById: user.user.id,
        },
      }),
    ])

    const ownedPlanIds = [
      ...trainingPlans.map((p) => p.id),
      ...mealPlans.map((p) => p.id),
    ]

    // Check if all requested plans are owned by the current user
    const unauthorizedPlans = planIds.filter((id) => !ownedPlanIds.includes(id))
    if (unauthorizedPlans.length > 0) {
      throw new Error(
        `You don't have permission to update plans: ${unauthorizedPlans.join(', ')}`,
      )
    }

    // Process each plan update
    const updatedCollaborations = await Promise.all(
      planUpdates.map(async (update) => {
        const { planId, planType, permission, removeAccess } = update

        if (planType === 'TRAINING') {
          // Check if collaboration exists
          const existing = await prisma.trainingPlanCollaborator.findFirst({
            where: {
              trainingPlanId: planId,
              collaboratorId: userId,
            },
          })

          if (removeAccess) {
            // Remove collaboration if it exists
            if (existing) {
              await prisma.trainingPlanCollaborator.delete({
                where: { id: existing.id },
              })
            }
            return null
          }

          if (existing) {
            // Update existing collaboration
            const updated = await prisma.trainingPlanCollaborator.update({
              where: { id: existing.id },
              data: { permission: permission as string },
              include: {
                trainingPlan: true,
                collaborator: {
                  include: { profile: true },
                },
                addedBy: {
                  include: { profile: true },
                },
              },
            })
            return updated
          } else {
            // Create new collaboration
            const created = await prisma.trainingPlanCollaborator.create({
              data: {
                trainingPlanId: planId,
                collaboratorId: userId,
                addedById: user.user.id,
                permission: permission as string,
              },
              include: {
                trainingPlan: true,
                collaborator: {
                  include: { profile: true },
                },
                addedBy: {
                  include: { profile: true },
                },
              },
            })
            return created
          }
        } else if (planType === 'MEAL') {
          // Check if collaboration exists
          const existing = await prisma.mealPlanCollaborator.findFirst({
            where: {
              mealPlanId: planId,
              collaboratorId: userId,
            },
          })

          if (removeAccess) {
            // Remove collaboration if it exists
            if (existing) {
              await prisma.mealPlanCollaborator.delete({
                where: { id: existing.id },
              })
            }
            return null
          }

          if (existing) {
            // Update existing collaboration
            const updated = await prisma.mealPlanCollaborator.update({
              where: { id: existing.id },
              data: { permission: permission as string },
              include: {
                mealPlan: true,
                collaborator: {
                  include: { profile: true },
                },
                addedBy: {
                  include: { profile: true },
                },
              },
            })
            return updated
          } else {
            // Create new collaboration
            const created = await prisma.mealPlanCollaborator.create({
              data: {
                mealPlanId: planId,
                collaboratorId: userId,
                addedById: user.user.id,
                permission: permission as string,
              },
              include: {
                mealPlan: true,
                collaborator: {
                  include: { profile: true },
                },
                addedBy: {
                  include: { profile: true },
                },
              },
            })
            return created
          }
        }

        return null
      }),
    )

    // Filter out null results and transform to PlanCollaboratorSummary
    const validCollaborations = updatedCollaborations.filter(
      (collab) => collab !== null,
    )

    return validCollaborations.map((collab) => {
      if ('trainingPlan' in collab) {
        return new PlanCollaboratorSummary(
          {
            id: collab.id,
            collaborator: new UserPublic(collab.collaborator, context),
            addedBy: new UserPublic(collab.addedBy, context),
            permission: collab.permission,
            planType: 'TRAINING' as const,
            planId: collab.trainingPlanId,
            planTitle: collab.trainingPlan.title,
            createdAt: collab.createdAt,
            updatedAt: collab.updatedAt,
          },
          context,
        )
      } else {
        return new PlanCollaboratorSummary(
          {
            id: collab.id,
            collaborator: new UserPublic(collab.collaborator, context),
            addedBy: new UserPublic(collab.addedBy, context),
            permission: collab.permission,
            planType: 'MEAL' as const,
            planId: collab.mealPlanId,
            planTitle: collab.mealPlan.title,
            createdAt: collab.createdAt,
            updatedAt: collab.updatedAt,
          },
          context,
        )
      }
    })
  },
}
