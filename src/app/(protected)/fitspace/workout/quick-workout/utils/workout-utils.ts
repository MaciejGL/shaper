import { isToday } from 'date-fns'

import { GQLFitspaceGetUserQuickWorkoutPlanQuery } from '@/generated/graphql-client'

/**
 * Check if today's workout has exercises in the quick workout plan
 * Uses scheduledAt dates for accurate comparison
 */
export function hasTodaysWorkoutExercises(
  quickWorkoutPlan?: GQLFitspaceGetUserQuickWorkoutPlanQuery['getQuickWorkoutPlan'],
): boolean {
  if (!quickWorkoutPlan?.weeks) {
    return false
  }

  // Find today's day using scheduledAt
  const todaysDay = quickWorkoutPlan.weeks
    .flatMap((week) => week.days)
    .find((day) => day.scheduledAt && isToday(new Date(day.scheduledAt)))

  return !!(todaysDay?.exercises && todaysDay.exercises.length > 0)
}

/**
 * Get today's workout exercises from the quick workout plan
 * Uses scheduledAt dates for accurate comparison
 */
export function getTodaysWorkoutExercises(
  quickWorkoutPlan?: GQLFitspaceGetUserQuickWorkoutPlanQuery['getQuickWorkoutPlan'],
) {
  if (!quickWorkoutPlan?.weeks) {
    return null
  }

  // Find today's day using scheduledAt
  const todaysDay = quickWorkoutPlan.weeks
    .flatMap((week) => week.days)
    .find((day) => day.scheduledAt && isToday(new Date(day.scheduledAt)))

  if (!todaysDay?.exercises || todaysDay.exercises.length === 0) {
    return null
  }

  return {
    day: todaysDay,
    exercises: todaysDay.exercises,
  }
}
