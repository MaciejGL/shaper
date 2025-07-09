import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

import TrainingPlanCollaborator from './model'

// Helper function to check if user can manage collaborators for a training plan
async function canManageCollaborators(userId: string, trainingPlanId: string) {
  const plan = await prisma.trainingPlan.findUnique({
    where: { id: trainingPlanId },
    include: {
      collaborators: {
        where: { collaboratorId: userId },
      },
    },
  })

  if (!plan) {
    return false
  }

  // User can manage if they're the creator or have ADMIN permission
  if (plan.createdById === userId) {
    return true
  }

  const collaboration = plan.collaborators.find(
    (c) => c.collaboratorId === userId,
  )
  return collaboration?.permission === 'ADMIN'
}

// Helper function to check if user can access a training plan
async function canAccessTrainingPlan(userId: string, trainingPlanId: string) {
  const plan = await prisma.trainingPlan.findUnique({
    where: { id: trainingPlanId },
    include: {
      collaborators: {
        where: { collaboratorId: userId },
      },
    },
  })

  if (!plan) {
    return false
  }

  // User can access if they're the creator, assigned to, or a collaborator
  return (
    plan.createdById === userId ||
    plan.assignedToId === userId ||
    plan.collaborators.length > 0
  )
}

export const Query: GQLQueryResolvers<GQLContext> = {
  trainingPlanCollaborators: async (_, { trainingPlanId }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    // Check if user can access this training plan
    if (!(await canAccessTrainingPlan(user.user.id, trainingPlanId))) {
      throw new Error('Not authorized to view this training plan')
    }

    const collaborators = await prisma.trainingPlanCollaborator.findMany({
      where: { trainingPlanId },
      include: {
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
        trainingPlan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return collaborators.map(
      (collaboration) => new TrainingPlanCollaborator(collaboration, context),
    )
  },

  myTrainingPlanCollaborations: async (_, __, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    const collaborations = await prisma.trainingPlanCollaborator.findMany({
      where: { collaboratorId: user.user.id },
      include: {
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
        trainingPlan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return collaborations.map(
      (collaboration) => new TrainingPlanCollaborator(collaboration, context),
    )
  },
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  addTrainingPlanCollaborator: async (_, { input }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    const { trainingPlanId, collaboratorEmail, permission } = input

    // Check if user can manage collaborators for this plan
    if (!(await canManageCollaborators(user.user.id, trainingPlanId))) {
      throw new Error(
        'Not authorized to manage collaborators for this training plan',
      )
    }

    // Find the collaborator by email
    const collaborator = await prisma.user.findUnique({
      where: { email: collaboratorEmail },
    })

    if (!collaborator) {
      throw new Error('User with this email not found')
    }

    if (collaborator.role !== 'TRAINER') {
      throw new Error('Can only add trainers as collaborators')
    }

    // Check if they have an accepted collaboration invitation
    const hasAcceptedInvitation =
      await prisma.collaborationInvitation.findFirst({
        where: {
          OR: [
            { senderId: user.user.id, recipientId: collaborator.id },
            { senderId: collaborator.id, recipientId: user.user.id },
          ],
          status: 'ACCEPTED',
        },
      })

    if (!hasAcceptedInvitation) {
      throw new Error(
        'You must have an accepted collaboration invitation with this user',
      )
    }

    // Check if already a collaborator
    const existingCollaboration =
      await prisma.trainingPlanCollaborator.findUnique({
        where: {
          trainingPlanId_collaboratorId: {
            trainingPlanId,
            collaboratorId: collaborator.id,
          },
        },
      })

    if (existingCollaboration) {
      throw new Error('User is already a collaborator on this training plan')
    }

    // Create the collaboration
    const collaboration = await prisma.trainingPlanCollaborator.create({
      data: {
        trainingPlanId,
        collaboratorId: collaborator.id,
        addedById: user.user.id,
        permission,
      },
      include: {
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
        trainingPlan: true,
      },
    })

    // Create notification for the collaborator
    await prisma.notification.create({
      data: {
        userId: collaborator.id,
        createdBy: user.user.id,
        type: 'TRAINING_PLAN_COLLABORATION',
        message: `${user.user.name || user.user.email} added you as a collaborator to training plan "${collaboration.trainingPlan.title}"`,
        relatedItemId: trainingPlanId,
        link: `/trainer/trainings/${trainingPlanId}`,
      },
    })

    return new TrainingPlanCollaborator(collaboration, context)
  },

  updateTrainingPlanCollaboratorPermission: async (_, { input }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    const { collaboratorId, permission } = input

    const collaboration = await prisma.trainingPlanCollaborator.findUnique({
      where: { id: collaboratorId },
      include: {
        trainingPlan: true,
      },
    })

    if (!collaboration) {
      throw new Error('Collaboration not found')
    }

    // Check if user can manage collaborators for this plan
    if (
      !(await canManageCollaborators(
        user.user.id,
        collaboration.trainingPlanId,
      ))
    ) {
      throw new Error(
        'Not authorized to manage collaborators for this training plan',
      )
    }

    const updatedCollaboration = await prisma.trainingPlanCollaborator.update({
      where: { id: collaboratorId },
      data: { permission },
      include: {
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
        trainingPlan: true,
      },
    })

    return new TrainingPlanCollaborator(updatedCollaboration, context)
  },

  removeTrainingPlanCollaborator: async (_, { input }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    const { collaboratorId } = input

    const collaboration = await prisma.trainingPlanCollaborator.findUnique({
      where: { id: collaboratorId },
      include: {
        trainingPlan: true,
        collaborator: true,
      },
    })

    if (!collaboration) {
      throw new Error('Collaboration not found')
    }

    // Check if user can manage collaborators for this plan
    if (
      !(await canManageCollaborators(
        user.user.id,
        collaboration.trainingPlanId,
      ))
    ) {
      throw new Error(
        'Not authorized to manage collaborators for this training plan',
      )
    }

    await prisma.trainingPlanCollaborator.delete({
      where: { id: collaboratorId },
    })

    // Create notification for the removed collaborator
    await prisma.notification.create({
      data: {
        userId: collaboration.collaboratorId,
        createdBy: user.user.id,
        type: 'TRAINING_PLAN_COLLABORATION_REMOVED',
        message: `${user.user.name || user.user.email} removed you as a collaborator from training plan "${collaboration.trainingPlan.title}"`,
        relatedItemId: collaboration.trainingPlanId,
      },
    })

    return true
  },
}
