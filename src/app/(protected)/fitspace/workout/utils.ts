import {
  WorkoutDay,
  WorkoutPlan,
  WorkoutWeek,
} from './[trainingId]/components/workout-page.client'

export const getExpectedDayDate = (
  day: WorkoutDay,
  plan: WorkoutPlan,
  activeWeek: WorkoutWeek,
) => {
  if (!plan.startDate) return null

  const trainingStartDate = new Date(plan.startDate)
  const currentWeekIndex = plan.weeks.findIndex(
    (week) => week.id === activeWeek.id,
  )
  if (currentWeekIndex === -1) return null

  // Calculate the start date of the current week
  const weekStartDate = new Date(trainingStartDate)
  weekStartDate.setDate(trainingStartDate.getDate() + currentWeekIndex * 7)

  // Calculate the date for the specific day of the week
  const dayOffset = day.dayOfWeek - trainingStartDate.getDay()
  const expectedDate = new Date(weekStartDate)
  expectedDate.setDate(weekStartDate.getDate() + dayOffset)

  return expectedDate
}
