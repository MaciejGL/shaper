import { getDay } from 'date-fns'

import {
  NavigationPlan,
  NavigationWeek,
  WorkoutDayData,
} from './training/components/workout-day'

export const getExpectedDayDate = (
  day: WorkoutDayData,
  plan?: NavigationPlan,
  activeWeek?: NavigationWeek,
) => {
  if (!plan?.startDate || !activeWeek) return null

  const trainingStartDate = new Date(plan.startDate)
  const currentWeekIndex = plan.weeks.findIndex(
    (week) => week.id === activeWeek.id,
  )
  if (currentWeekIndex === -1) return null

  // Calculate the start date of the current week
  const weekStartDate = new Date(trainingStartDate)
  weekStartDate.setDate(trainingStartDate.getDate() + currentWeekIndex * 7)

  // Calculate the date for the specific day of the week
  // Convert trainingStartDate day from Sunday=0 to Monday=0 system to match day.dayOfWeek
  const trainingStartDayOfWeek = (getDay(trainingStartDate) + 6) % 7
  const dayOffset = day.dayOfWeek - trainingStartDayOfWeek + 1
  const expectedDate = new Date(weekStartDate)
  expectedDate.setDate(weekStartDate.getDate() + dayOffset)

  return expectedDate
}

export const getWeekRange = (week: NavigationWeek, plan: NavigationPlan) => {
  if (!plan.startDate) return null

  const trainingStartDate = new Date(plan.startDate)
  const currentWeekIndex = plan.weeks.findIndex((w) => w.id === week.id)
  if (currentWeekIndex === -1) return null

  // Calculate the start date of the current week
  const weekStart = new Date(trainingStartDate)
  weekStart.setDate(trainingStartDate.getDate() + currentWeekIndex * 7)

  // Calculate the end date of the week (6 days after start)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  return { weekStart, weekEnd }
}

export const getSetRange = (set?: {
  minReps?: number | null
  maxReps?: number | null
  reps?: number | null
}) => {
  if (!set) return null
  switch (true) {
    case typeof set.minReps === 'number' &&
      typeof set.maxReps === 'number' &&
      set.minReps === set.maxReps:
      return `${set.minReps}`
    case typeof set.minReps === 'number' && typeof set.maxReps === 'number':
      return `${set.minReps}-${set.maxReps}`
    case typeof set.minReps === 'number':
      return `${set.minReps}`
    case typeof set.maxReps === 'number':
      return `${set.maxReps}`
    default:
      return set.reps
  }
}
