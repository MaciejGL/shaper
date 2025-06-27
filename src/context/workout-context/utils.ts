import { WorkoutExercise } from '@/app/(protected)/fitspace/workout/[trainingId]/components/workout-page.client'

import { WorkoutContextPlan } from './workout-context'

// Helper function to find week number by week ID
export const getWeekNumberById = (plan?: WorkoutContextPlan, weekId?: string) =>
  plan?.weeks.find((week) => week.id === weekId)?.weekNumber

// Helper function to check if exercise matches criteria
export const isMatchingExercise = (
  exercise: WorkoutExercise,
  targetExercise: WorkoutExercise,
  weekNumber: number,
  activeWeekNumber: number,
) =>
  exercise.name === targetExercise.name &&
  exercise.id !== targetExercise.id &&
  weekNumber < activeWeekNumber

// Helper function to transform exercise with additional metadata
export const addExerciseMetadata = (
  exercise: WorkoutExercise,
  weekNumber: number,
  dayOfWeek: number,
) => ({
  ...exercise,
  performedOnWeekNumber: weekNumber,
  performedOnDayNumber: dayOfWeek,
})

// Main function to get previous exercise logs
export const getPreviousLogsByExercise = (
  exercise: WorkoutExercise,
  plan?: WorkoutContextPlan | null,
  activeWeekId?: string | null,
): (WorkoutExercise & {
  performedOnWeekNumber: number
  performedOnDayNumber: number
})[] => {
  if (!plan || !activeWeekId) return []
  // Get current week number for filtering
  const activeWeekNumber = getWeekNumberById(plan, activeWeekId) ?? 0

  // Early return if no plan data
  if (!plan?.weeks) return []

  // Process all weeks and days to find matching exercises
  return plan.weeks.flatMap((week) =>
    week.days.flatMap((day) =>
      day.exercises
        .filter((e) =>
          isMatchingExercise(e, exercise, week.weekNumber, activeWeekNumber),
        )
        .map((e) => addExerciseMetadata(e, week.weekNumber, day.dayOfWeek)),
    ),
  )
}
