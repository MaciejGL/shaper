import {
  addDays,
  differenceInMilliseconds,
  isAfter,
  isBefore,
  isEqual,
} from 'date-fns'

import { NavigationDay, NavigationPlan, NavigationWeek } from './workout-day'

/**
 * Checks if a plan is a Quick Workout (uses scheduledAt on weeks)
 */
export function isQuickWorkout(plan: NavigationPlan): boolean {
  return plan.isQuickWorkout
}

/**
 * Checks if a date falls within a week's date range
 */
export function isDateInWeek(date: Date, weekStart: Date): boolean {
  const weekEndExclusive = addDays(weekStart, 7)

  return (
    (isAfter(date, weekStart) || isEqual(date, weekStart)) &&
    isBefore(date, weekEndExclusive)
  )
}

/**
 * Finds the week that contains the given date based on scheduledAt
 */
export function findWeekByDate(
  weeks: NavigationWeek[],
  date: Date,
): NavigationWeek | undefined {
  return weeks.find((week) => {
    if (!week.scheduledAt) return false
    return isDateInWeek(date, new Date(week.scheduledAt))
  })
}

/**
 * Finds the closest week to the given date
 */
export function findClosestWeek(
  weeks: NavigationWeek[],
  date: Date,
): NavigationWeek | undefined {
  const weeksWithDates = weeks.filter((w) => w.scheduledAt)

  if (weeksWithDates.length === 0) return undefined

  return weeksWithDates.reduce((closest, current) => {
    const closestDiff = Math.abs(
      differenceInMilliseconds(date, new Date(closest.scheduledAt!)),
    )
    const currentDiff = Math.abs(
      differenceInMilliseconds(date, new Date(current.scheduledAt!)),
    )
    return currentDiff < closestDiff ? current : closest
  })
}

/**
 * Finds the appropriate week for Quick Workout based on current date
 */
export function findQuickWorkoutWeek(
  weeks: NavigationWeek[],
  now: Date,
): NavigationWeek | undefined {
  // Try exact match first
  const exactWeek = findWeekByDate(weeks, now)
  const closestWeek = exactWeek ? undefined : findClosestWeek(weeks, now)

  if (exactWeek) return exactWeek

  // Fallback to closest week
  return closestWeek
}

/**
 * Calculates which week index to use for trainer-assigned plans
 */
export function calculateTrainerPlanWeekIndex(
  planStartDate: Date,
  now: Date,
): number {
  const daysSinceStart = Math.floor(
    differenceInMilliseconds(now, planStartDate) / (1000 * 60 * 60 * 24),
  )
  return Math.max(0, Math.floor(daysSinceStart / 7))
}

/**
 * Finds the appropriate week for trainer-assigned plans based on start date
 * Returns both the week and whether we're past the plan end
 */
export function findTrainerPlanWeek(
  weeks: NavigationWeek[],
  planStartDate: string | null | undefined,
  now: Date,
): { week: NavigationWeek | undefined; isPastPlanEnd: boolean } {
  if (weeks.length === 0) return { week: undefined, isPastPlanEnd: false }

  const startDate = planStartDate ? new Date(planStartDate) : now
  const weekIndex = calculateTrainerPlanWeekIndex(startDate, now)
  let isPastPlanEnd = weekIndex >= weeks.length
  const safeWeekIndex = Math.min(weekIndex, weeks.length - 1)
  let selectedWeek = weeks[safeWeekIndex] || weeks[weeks.length - 1]

  const weeksWithScheduledAt = weeks.filter((week) => week.scheduledAt)
  if (weeksWithScheduledAt.length === weeks.length) {
    const weekByDate = findWeekByDate(weeksWithScheduledAt, now)
    const closestWeek = weekByDate
      ? undefined
      : findClosestWeek(weeksWithScheduledAt, now)
    selectedWeek = weekByDate ?? closestWeek ?? selectedWeek

    const latestWeek = weeksWithScheduledAt.reduce((latest, current) => {
      if (!latest) return current
      return isAfter(
        new Date(current.scheduledAt!),
        new Date(latest.scheduledAt!),
      )
        ? current
        : latest
    }, weeksWithScheduledAt[0])

    if (latestWeek?.scheduledAt) {
      const latestWeekEndExclusive = addDays(
        new Date(latestWeek.scheduledAt),
        7,
      )
      isPastPlanEnd =
        isAfter(now, latestWeekEndExclusive) ||
        isEqual(now, latestWeekEndExclusive)
    }
  }

  return { week: selectedWeek, isPastPlanEnd }
}

/**
 * Converts JavaScript day (0=Sunday) to training system day (0=Monday, 6=Sunday)
 */
export function jsDateToTrainingDay(date: Date): number {
  const jsDay = date.getDay()
  return jsDay === 0 ? 6 : jsDay - 1
}

/**
 * Finds a day in the week by dayOfWeek number
 */
export function findDayByDayOfWeek(
  days: NavigationDay[],
  dayOfWeek: number,
): NavigationDay | undefined {
  return days.find((day) => day.dayOfWeek === dayOfWeek)
}

/**
 * Finds the first non-completed day in the week
 */
export function findFirstNonCompletedDay(
  days: NavigationDay[],
): NavigationDay | undefined {
  return days.find((day) => !day.completedAt)
}

/**
 * Finds the last day with exercises in a week
 */
export function findLastDayWithExercises(
  days: NavigationDay[],
): NavigationDay | undefined {
  // Sort by dayOfWeek in descending order and find last non-rest day with exercises
  const sortedDays = [...days].sort((a, b) => b.dayOfWeek - a.dayOfWeek)
  return (
    sortedDays.find((day) => !day.isRestDay && day.exercisesCount > 0) ||
    sortedDays[0]
  )
}

/**
 * Finds the appropriate day in a week based on current date
 */
export function findDayInWeek(
  week: NavigationWeek,
  now: Date,
  isPastPlanEnd: boolean = false,
): NavigationDay | undefined {
  // If we're past the plan end, show the last day with exercises
  if (isPastPlanEnd) {
    return findLastDayWithExercises(week.days)
  }

  const trainingDay = jsDateToTrainingDay(now)

  // Try to find today's day
  let day = findDayByDayOfWeek(week.days, trainingDay)

  // Fallback to first non-completed day or first day
  if (!day) {
    day = findFirstNonCompletedDay(week.days) || week.days[0]
  }

  return day
}

/**
 * Main function to determine default week and day selection
 */
export function getDefaultSelection(plan?: NavigationPlan) {
  if (!plan || plan.weeks.length === 0) {
    return { weekId: null, dayId: null }
  }

  const now = new Date()
  let defaultWeek: NavigationWeek | undefined
  let isPastPlanEnd = false

  if (isQuickWorkout(plan)) {
    defaultWeek = findQuickWorkoutWeek(plan.weeks, now)
  } else {
    const result = findTrainerPlanWeek(plan.weeks, plan.startDate, now)
    defaultWeek = result.week
    isPastPlanEnd = result.isPastPlanEnd
  }

  if (!defaultWeek) {
    return { weekId: null, dayId: null }
  }

  const defaultDay = findDayInWeek(defaultWeek, now, isPastPlanEnd)

  return {
    weekId: defaultWeek.id,
    dayId: defaultDay?.id || null,
  }
}
