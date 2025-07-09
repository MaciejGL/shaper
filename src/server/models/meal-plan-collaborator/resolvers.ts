import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

import MealPlanCollaborator from './model'

// Helper function to check if user can manage collaborators for a meal plan
async function canManageCollaborators(userId: string, mealPlanId: string) {
  const plan = await prisma.mealPlan.findUnique({
    where: { id: mealPlanId },
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

// Helper function to check if user can access a meal plan
async function canAccessMealPlan(userId: string, mealPlanId: string) {
  const plan = await prisma.mealPlan.findUnique({
    where: { id: mealPlanId },
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
  mealPlanCollaborators: async (_, { mealPlanId }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    // Check if user can access this meal plan
    if (!(await canAccessMealPlan(user.user.id, mealPlanId))) {
      throw new Error('Not authorized to view this meal plan')
    }

    const collaborators = await prisma.mealPlanCollaborator.findMany({
      where: { mealPlanId },
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
        mealPlan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return collaborators.map(
      (collaboration) => new MealPlanCollaborator(collaboration, context),
    )
  },

  myMealPlanCollaborations: async (_, __, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    const collaborations = await prisma.mealPlanCollaborator.findMany({
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
        mealPlan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return collaborations.map(
      (collaboration) => new MealPlanCollaborator(collaboration, context),
    )
  },
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  addMealPlanCollaborator: async (_, { input }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    const { mealPlanId, collaboratorEmail, permission } = input

    // Check if user can manage collaborators for this plan
    if (!(await canManageCollaborators(user.user.id, mealPlanId))) {
      throw new Error(
        'Not authorized to manage collaborators for this meal plan',
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
    const existingCollaboration = await prisma.mealPlanCollaborator.findUnique({
      where: {
        mealPlanId_collaboratorId: {
          mealPlanId,
          collaboratorId: collaborator.id,
        },
      },
    })

    if (existingCollaboration) {
      throw new Error('User is already a collaborator on this meal plan')
    }

    // Create the collaboration
    const collaboration = await prisma.mealPlanCollaborator.create({
      data: {
        mealPlanId,
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
        mealPlan: true,
      },
    })

    // Create notification for the collaborator
    await prisma.notification.create({
      data: {
        userId: collaborator.id,
        createdBy: user.user.id,
        type: 'MEAL_PLAN_COLLABORATION',
        message: `${user.user.name || user.user.email} added you as a collaborator to meal plan "${collaboration.mealPlan.title}"`,
        relatedItemId: mealPlanId,
        link: `/trainer/meal-plans/${mealPlanId}`,
      },
    })

    return new MealPlanCollaborator(collaboration, context)
  },

  updateMealPlanCollaboratorPermission: async (_, { input }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    const { collaboratorId, permission } = input

    const collaboration = await prisma.mealPlanCollaborator.findUnique({
      where: { id: collaboratorId },
      include: {
        mealPlan: true,
      },
    })

    if (!collaboration) {
      throw new Error('Collaboration not found')
    }

    // Check if user can manage collaborators for this plan
    if (
      !(await canManageCollaborators(user.user.id, collaboration.mealPlanId))
    ) {
      throw new Error(
        'Not authorized to manage collaborators for this meal plan',
      )
    }

    const updatedCollaboration = await prisma.mealPlanCollaborator.update({
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
        mealPlan: true,
      },
    })

    return new MealPlanCollaborator(updatedCollaboration, context)
  },

  removeMealPlanCollaborator: async (_, { input }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    const { collaboratorId } = input

    const collaboration = await prisma.mealPlanCollaborator.findUnique({
      where: { id: collaboratorId },
      include: {
        mealPlan: true,
        collaborator: true,
      },
    })

    if (!collaboration) {
      throw new Error('Collaboration not found')
    }

    // Check if user can manage collaborators for this plan
    if (
      !(await canManageCollaborators(user.user.id, collaboration.mealPlanId))
    ) {
      throw new Error(
        'Not authorized to manage collaborators for this meal plan',
      )
    }

    await prisma.mealPlanCollaborator.delete({
      where: { id: collaboratorId },
    })

    // Create notification for the removed collaborator
    await prisma.notification.create({
      data: {
        userId: collaboration.collaboratorId,
        createdBy: user.user.id,
        type: 'MEAL_PLAN_COLLABORATION_REMOVED',
        message: `${user.user.name || user.user.email} removed you as a collaborator from meal plan "${collaboration.mealPlan.title}"`,
        relatedItemId: collaboration.mealPlanId,
      },
    })

    return true
  },
}
