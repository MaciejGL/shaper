import { dayNames, normalizeDay } from '@/lib/date-utils'

import type { PlanDay, PlanWeek, TodayWorkoutResult } from './types'

export { dayNames as DAY_NAMES }

function calculateWeekIndex(planStartDate: Date, now: Date): number {
  const daysSinceStart = Math.floor(
    (now.getTime() - planStartDate.getTime()) / (1000 * 60 * 60 * 24),
  )
  return Math.max(0, Math.floor(daysSinceStart / 7))
}

export function findTodaysWorkout(
  weeks: PlanWeek[],
  startDate: string | null,
): TodayWorkoutResult {
  if (!weeks.length) {
    return { day: null, nextWorkoutDay: null }
  }

  const now = new Date()
  const planStartDate = startDate ? new Date(startDate) : now
  const weekIndex = calculateWeekIndex(planStartDate, now)

  const currentWeek = weeks[Math.min(weekIndex, weeks.length - 1)]
  if (!currentWeek) {
    return { day: null, nextWorkoutDay: null }
  }

  const trainingDay = normalizeDay(now.getDay())
  const todaysDay = currentWeek.days.find((d) => d.dayOfWeek === trainingDay)

  let nextWorkoutDay: PlanDay | null = null
  if (todaysDay?.isRestDay || !todaysDay) {
    const remainingDays = currentWeek.days
      .filter((d) => d.dayOfWeek > trainingDay && !d.isRestDay)
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
    nextWorkoutDay = remainingDays[0] || null

    if (!nextWorkoutDay && weekIndex + 1 < weeks.length) {
      const nextWeek = weeks[weekIndex + 1]
      const nextWeekDays = nextWeek.days
        .filter((d) => !d.isRestDay)
        .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
      nextWorkoutDay = nextWeekDays[0] || null
    }
  }

  return { day: todaysDay || null, nextWorkoutDay }
}

