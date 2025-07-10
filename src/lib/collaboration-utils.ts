import type { BadgeProps } from '@/components/ui/badge'
import { GQLCollaborationPermission } from '@/generated/graphql-client'

// Type definitions for plans with collaborators
export interface CollaboratorInfo {
  id: string
  collaborator: {
    id: string
    firstName?: string | null
    lastName?: string | null
    email: string
  }
  permission: GQLCollaborationPermission
}

export interface PlanWithCollaborators {
  id: string
  collaborators?: CollaboratorInfo[] | null
  createdBy?: {
    id: string
    firstName?: string | null
    lastName?: string | null
  } | null
}

export interface UserInfo {
  id: string
  email: string
  name?: string | null
  // Add other user fields as needed
}

// Type for user from useUser hook - make it more flexible
export type UserFromContext =
  | {
      id: string
      email: string
      [key: string]: unknown // Allow additional properties
    }
  | null
  | undefined

/**
 * Gets the current user's collaboration record for a specific plan
 */
export function getUserCollaboration(
  plan: PlanWithCollaborators,
  userId: string,
): CollaboratorInfo | null {
  if (!plan.collaborators) return null

  return (
    plan.collaborators.find(
      (collaboration) => collaboration.collaborator.id === userId,
    ) || null
  )
}

/**
 * Gets the current user's permission level for a specific plan
 */
export function getUserPermission(
  plan: PlanWithCollaborators,
  userId: string,
): GQLCollaborationPermission | null {
  const collaboration = getUserCollaboration(plan, userId)
  return collaboration?.permission || null
}

/**
 * Checks if user has a specific permission level (or higher) on a plan
 */
export function hasPermission(
  plan: PlanWithCollaborators,
  userId: string,
  requiredPermission: GQLCollaborationPermission,
): boolean {
  const userPermission = getUserPermission(plan, userId)
  if (!userPermission) return false

  // Permission hierarchy: ADMIN > EDIT > VIEW
  const permissionHierarchy = {
    [GQLCollaborationPermission.View]: 1,
    [GQLCollaborationPermission.Edit]: 2,
    [GQLCollaborationPermission.Admin]: 3,
  }

  return (
    permissionHierarchy[userPermission] >=
    permissionHierarchy[requiredPermission]
  )
}

/**
 * Checks if user has ADMIN permission on a plan
 */
export function hasAdminPermission(
  plan: PlanWithCollaborators,
  userId: string,
): boolean {
  return hasPermission(plan, userId, GQLCollaborationPermission.Admin)
}

/**
 * Checks if user has EDIT permission (or higher) on a plan
 */
export function hasEditPermission(
  plan: PlanWithCollaborators,
  userId: string,
): boolean {
  return hasPermission(plan, userId, GQLCollaborationPermission.Edit)
}

/**
 * Checks if user has VIEW permission (or higher) on a plan
 */
export function hasViewPermission(
  plan: PlanWithCollaborators,
  userId: string,
): boolean {
  return hasPermission(plan, userId, GQLCollaborationPermission.View)
}

/**
 * Checks if user is the creator of a plan
 */
export function isCreator(
  plan: PlanWithCollaborators,
  userId: string,
): boolean {
  return plan.createdBy?.id === userId
}

/**
 * Checks if user has access to a plan (either as creator or collaborator)
 */
export function hasAccessToPlan(
  plan: PlanWithCollaborators,
  userId: string,
): boolean {
  return isCreator(plan, userId) || hasViewPermission(plan, userId)
}

/**
 * Gets display text for permission level
 */
export function getPermissionDisplayText(
  permission: GQLCollaborationPermission,
): string {
  switch (permission) {
    case GQLCollaborationPermission.Admin:
      return 'Admin'
    case GQLCollaborationPermission.Edit:
      return 'Edit'
    case GQLCollaborationPermission.View:
      return 'View'
    default:
      return 'Unknown'
  }
}

/**
 * Hook-like utility for getting user permissions (to be used in components)
 */
export function useUserPermissions(
  plan: PlanWithCollaborators,
  user: UserFromContext,
) {
  if (!user || user === undefined) {
    return {
      hasAdmin: false,
      hasEdit: false,
      hasView: false,
      isCreator: false,
      hasAccess: false,
      permission: null,
      collaboration: null,
    }
  }

  const collaboration = getUserCollaboration(plan, user.id)
  const permission = getUserPermission(plan, user.id)

  return {
    hasAdmin: hasAdminPermission(plan, user.id),
    hasEdit: hasEditPermission(plan, user.id),
    hasView: hasViewPermission(plan, user.id),
    isCreator: isCreator(plan, user.id),
    hasAccess: hasAccessToPlan(plan, user.id),
    permission,
    collaboration,
  }
}

// Legacy functions that were previously in this file
/**
 * Get the appropriate badge variant for a collaboration permission level
 */
export function getPermissionColor(permission: string): BadgeProps['variant'] {
  switch (permission) {
    case 'ADMIN':
      return 'destructive'
    case 'EDIT':
      return 'primary'
    case 'VIEW':
      return 'secondary'
    case 'TEAM_MEMBER':
      return 'success'
    default:
      return 'outline'
  }
}

/**
 * Get the appropriate CSS classes for plan type badges
 */
export function getPlanTypeColor(planType: string): string {
  switch (planType) {
    case 'TRAINING':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
    case 'MEAL':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
    case 'COLLABORATION':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
  }
}

/**
 * Get human-readable plan type label
 */
export function getPlanTypeLabel(planType: string): string {
  switch (planType) {
    case 'TRAINING':
      return 'Training Plan'
    case 'MEAL':
      return 'Meal Plan'
    case 'COLLABORATION':
      return 'Team Member'
    default:
      return planType
  }
}
