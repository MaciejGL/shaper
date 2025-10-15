import {
  NavigationDay,
  NavigationPlan,
  NavigationWeek,
} from './workout-page.client'

/**
 * Checks if a plan is a Quick Workout (uses scheduledAt on weeks)
 */
export function isQuickWorkout(plan: NavigationPlan): boolean {
  return plan.weeks.some((week) => week.scheduledAt !== null)
}

/**
 * Checks if a date falls within a week's date range
 */
export function isDateInWeek(date: Date, weekStart: Date): boolean {
  const dateTime = date.getTime()
  const weekStartTime = weekStart.getTime()
  const weekEndTime = weekStartTime + 7 * 24 * 60 * 60 * 1000 // +7 days

  return dateTime >= weekStartTime && dateTime < weekEndTime
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
  const dateTime = date.getTime()

  const weeksWithDates = weeks.filter((w) => w.scheduledAt)

  if (weeksWithDates.length === 0) return undefined

  return weeksWithDates.reduce((closest, current) => {
    const closestDiff = Math.abs(
      dateTime - new Date(closest.scheduledAt!).getTime(),
    )
    const currentDiff = Math.abs(
      dateTime - new Date(current.scheduledAt!).getTime(),
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
  if (exactWeek) return exactWeek

  // Fallback to closest week
  return findClosestWeek(weeks, now)
}

/**
 * Calculates which week index to use for trainer-assigned plans
 */
export function calculateTrainerPlanWeekIndex(
  planStartDate: Date,
  now: Date,
): number {
  const daysSinceStart = Math.floor(
    (now.getTime() - planStartDate.getTime()) / (1000 * 60 * 60 * 24),
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
  const isPastPlanEnd = weekIndex >= weeks.length

  return {
    week:
      weeks[Math.min(weekIndex, weeks.length - 1)] || weeks[weeks.length - 1],
    isPastPlanEnd,
  }
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
