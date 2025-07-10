import type { BadgeProps } from '@/components/ui/badge'

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
