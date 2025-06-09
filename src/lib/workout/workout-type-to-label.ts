import { GQLWorkoutType } from '@/generated/graphql-client'

/**
 * Formats a workout type string by adding spaces before capital letters
 * @param workoutType - The workout type enum member value (e.g., "UpperBody")
 * @returns Formatted workout type string with proper spacing (e.g., "Upper Body")
 */
export const formatWorkoutType = (
  workoutType?: GQLWorkoutType | null,
): string => {
  return workoutType?.replace(/([A-Z])/g, ' $1').trim() || ''
}
