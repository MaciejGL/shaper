import { MealPlan, TrainingPlan } from '@prisma/client'
import { GraphQLError } from 'graphql'

import { GQLCollaborationPermission } from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

export enum CollaborationAction {
  VIEW = 'VIEW',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
  MANAGE_COLLABORATORS = 'MANAGE_COLLABORATORS',
  SHARE = 'SHARE',
}

export interface CollaborationPermissionCheck {
  hasPermission: boolean
  reason?: string
  userPermission?: GQLCollaborationPermission
  isCreator?: boolean
}

/**
 * Collaboration permissions utility
 * Provides centralized permission checking for training plans and meal plans
 */
export class CollaborationPermissions {
  constructor(private context: GQLContext) {}

  /**
   * Check if user has permission to perform action on training plan
   */
  async checkTrainingPlanPermission(
    userId: string,
    trainingPlanId: string,
    action: CollaborationAction,
  ): Promise<CollaborationPermissionCheck> {
    try {
      // Load training plan with collaborators
      const trainingPlan = await prisma.trainingPlan.findUnique({
        where: { id: trainingPlanId },
        include: {
          collaborators: {
            where: { collaboratorId: userId },
            take: 1,
          },
        },
      })

      if (!trainingPlan) {
        return {
          hasPermission: false,
          reason: 'Training plan not found',
        }
      }

      if (trainingPlan.assignedToId === userId) {
        return {
          hasPermission: true,
          isCreator: true,
          reason: 'Assigned to user',
          userPermission: GQLCollaborationPermission.Edit,
        }
      }

      return this.evaluateTrainingPlanPermission(userId, trainingPlan, action)
    } catch (error) {
      console.error('Error checking training plan permission:', error)
      return {
        hasPermission: false,
        reason: 'Error checking permissions',
      }
    }
  }

  /**
   * Check if user has permission to perform action on meal plan
   */
  async checkMealPlanPermission(
    userId: string,
    mealPlanId: string,
    action: CollaborationAction,
  ): Promise<CollaborationPermissionCheck> {
    try {
      // Load meal plan with collaborators
      const mealPlan = await prisma.mealPlan.findUnique({
        where: { id: mealPlanId },
        include: {
          collaborators: {
            where: { collaboratorId: userId },
            take: 1,
          },
        },
      })

      if (!mealPlan) {
        return {
          hasPermission: false,
          reason: 'Meal plan not found',
        }
      }

      return this.evaluateMealPlanPermission(userId, mealPlan, action)
    } catch (error) {
      console.error('Error checking meal plan permission:', error)
      return {
        hasPermission: false,
        reason: 'Error checking permissions',
      }
    }
  }

  /**
   * Evaluate training plan permission based on creator status and collaboration
   */
  private evaluateTrainingPlanPermission(
    userId: string,
    trainingPlan: TrainingPlan & {
      collaborators: {
        collaboratorId: string
        permission: string
      }[]
    },
    action: CollaborationAction,
  ): CollaborationPermissionCheck {
    const isCreator = trainingPlan.createdById === userId
    const collaborator = trainingPlan.collaborators[0]

    // Creator has full permissions
    if (isCreator) {
      return {
        hasPermission: true,
        isCreator: true,
      }
    }

    // Not a collaborator
    if (!collaborator) {
      // Public plans can be viewed by anyone
      if (action === CollaborationAction.VIEW && trainingPlan.isPublic) {
        return {
          hasPermission: true,
          reason: 'Public plan',
        }
      }

      return {
        hasPermission: false,
        reason: 'Not a collaborator',
      }
    }

    const permission = collaborator.permission as GQLCollaborationPermission

    return {
      hasPermission: this.hasPermissionForAction(permission, action),
      userPermission: permission,
      reason: this.hasPermissionForAction(permission, action)
        ? undefined
        : `Insufficient permission: ${permission} for action: ${action}`,
    }
  }

  /**
   * Evaluate meal plan permission based on creator status and collaboration
   */
  private evaluateMealPlanPermission(
    userId: string,
    mealPlan: MealPlan & {
      collaborators: {
        collaboratorId: string
        permission: string
      }[]
    },
    action: CollaborationAction,
  ): CollaborationPermissionCheck {
    const isCreator = mealPlan.createdById === userId
    const collaborator = mealPlan.collaborators[0]

    // Creator has full permissions
    if (isCreator) {
      return {
        hasPermission: true,
        isCreator: true,
      }
    }

    // Not a collaborator
    if (!collaborator) {
      // Public plans can be viewed by anyone
      if (action === CollaborationAction.VIEW && mealPlan.isPublic) {
        return {
          hasPermission: true,
          reason: 'Public plan',
        }
      }

      return {
        hasPermission: false,
        reason: 'Not a collaborator',
      }
    }

    const permission = collaborator.permission as GQLCollaborationPermission

    return {
      hasPermission: this.hasPermissionForAction(permission, action),
      userPermission: permission,
      reason: this.hasPermissionForAction(permission, action)
        ? undefined
        : `Insufficient permission: ${permission} for action: ${action}`,
    }
  }

  /**
   * Check if permission level allows specific action
   */
  private hasPermissionForAction(
    permission: GQLCollaborationPermission,
    action: CollaborationAction,
  ): boolean {
    switch (action) {
      case CollaborationAction.VIEW:
        return [
          GQLCollaborationPermission.View,
          GQLCollaborationPermission.Edit,
          GQLCollaborationPermission.Admin,
        ].includes(permission)

      case CollaborationAction.EDIT:
        return [
          GQLCollaborationPermission.Edit,
          GQLCollaborationPermission.Admin,
        ].includes(permission)

      case CollaborationAction.DELETE:
        // Only plan creators can delete plans
        return false

      case CollaborationAction.MANAGE_COLLABORATORS:
        return permission === GQLCollaborationPermission.Admin

      case CollaborationAction.SHARE:
        return [
          GQLCollaborationPermission.Edit,
          GQLCollaborationPermission.Admin,
        ].includes(permission)

      default:
        return false
    }
  }

  /**
   * Check if user can invite collaborators (must be trainer and have existing collaboration)
   */
  async canInviteCollaborators(
    inviterId: string,
    recipientId: string,
  ): Promise<CollaborationPermissionCheck> {
    try {
      // Check if both users are trainers
      const [inviter, recipient] = await Promise.all([
        prisma.user.findUnique({
          where: { id: inviterId },
          select: { role: true },
        }),
        prisma.user.findUnique({
          where: { id: recipientId },
          select: { role: true },
        }),
      ])

      if (!inviter || !recipient) {
        return {
          hasPermission: false,
          reason: 'User not found',
        }
      }

      if (inviter.role !== 'TRAINER' || recipient.role !== 'TRAINER') {
        return {
          hasPermission: false,
          reason: 'Only trainers can collaborate',
        }
      }

      // Check if they already have an accepted collaboration
      const existingCollaboration =
        await prisma.collaborationInvitation.findFirst({
          where: {
            OR: [
              {
                senderId: inviterId,
                recipientId: recipientId,
                status: 'ACCEPTED',
              },
              {
                senderId: recipientId,
                recipientId: inviterId,
                status: 'ACCEPTED',
              },
            ],
          },
        })

      if (!existingCollaboration) {
        return {
          hasPermission: false,
          reason: 'No accepted collaboration between users',
        }
      }

      return {
        hasPermission: true,
      }
    } catch (error) {
      console.error(
        'Error checking collaboration invitation permission:',
        error,
      )
      return {
        hasPermission: false,
        reason: 'Error checking permissions',
      }
    }
  }

  /**
   * Batch check permissions for multiple training plans
   */
  async batchCheckTrainingPlanPermissions(
    userId: string,
    trainingPlanIds: string[],
    action: CollaborationAction,
  ): Promise<Record<string, CollaborationPermissionCheck>> {
    const results: Record<string, CollaborationPermissionCheck> = {}

    await Promise.all(
      trainingPlanIds.map(async (planId) => {
        results[planId] = await this.checkTrainingPlanPermission(
          userId,
          planId,
          action,
        )
      }),
    )

    return results
  }

  /**
   * Batch check permissions for multiple meal plans
   */
  async batchCheckMealPlanPermissions(
    userId: string,
    mealPlanIds: string[],
    action: CollaborationAction,
  ): Promise<Record<string, CollaborationPermissionCheck>> {
    const results: Record<string, CollaborationPermissionCheck> = {}

    await Promise.all(
      mealPlanIds.map(async (planId) => {
        results[planId] = await this.checkMealPlanPermission(
          userId,
          planId,
          action,
        )
      }),
    )

    return results
  }

  /**
   * Get user's effective permission level for a training plan
   */
  async getUserTrainingPlanPermission(
    userId: string,
    trainingPlanId: string,
  ): Promise<{
    permission: GQLCollaborationPermission | 'CREATOR' | 'NONE'
    isCreator: boolean
  }> {
    const result = await this.checkTrainingPlanPermission(
      userId,
      trainingPlanId,
      CollaborationAction.VIEW,
    )

    if (!result.hasPermission) {
      return { permission: 'NONE', isCreator: false }
    }

    if (result.isCreator) {
      return { permission: 'CREATOR', isCreator: true }
    }

    return {
      permission: result.userPermission || GQLCollaborationPermission.View,
      isCreator: false,
    }
  }

  /**
   * Get user's effective permission level for a meal plan
   */
  async getUserMealPlanPermission(
    userId: string,
    mealPlanId: string,
  ): Promise<{
    permission: GQLCollaborationPermission | 'CREATOR' | 'NONE'
    isCreator: boolean
  }> {
    const result = await this.checkMealPlanPermission(
      userId,
      mealPlanId,
      CollaborationAction.VIEW,
    )

    if (!result.hasPermission) {
      return { permission: 'NONE', isCreator: false }
    }

    if (result.isCreator) {
      return { permission: 'CREATOR', isCreator: true }
    }

    return {
      permission: result.userPermission || GQLCollaborationPermission.View,
      isCreator: false,
    }
  }
}

/**
 * Helper function to create permissions instance
 */
export const createCollaborationPermissions = (context: GQLContext) => {
  return new CollaborationPermissions(context)
}

/**
 * Helper function to throw permission error
 */
export const throwPermissionError = (
  result: CollaborationPermissionCheck,
  action: string,
) => {
  if (!result.hasPermission) {
    throw new GraphQLError(
      `Permission denied: ${result.reason || 'Insufficient permissions'} for action: ${action}`,
    )
  }
}

/**
 * Convenience function to check training plan permission and throw error if denied
 */
export const checkTrainingPlanPermission = async (
  context: GQLContext,
  userId: string,
  planId: string,
  action: CollaborationAction,
  actionDescription: string,
) => {
  const permissions = createCollaborationPermissions(context)
  const permissionCheck = await permissions.checkTrainingPlanPermission(
    userId,
    planId,
    action,
  )
  throwPermissionError(permissionCheck, actionDescription)
}

/**
 * Convenience function to check meal plan permission and throw error if denied
 */
export const checkMealPlanPermission = async (
  context: GQLContext,
  userId: string,
  planId: string,
  action: CollaborationAction,
  actionDescription: string,
) => {
  const permissions = createCollaborationPermissions(context)
  const permissionCheck = await permissions.checkMealPlanPermission(
    userId,
    planId,
    action,
  )
  throwPermissionError(permissionCheck, actionDescription)
}
