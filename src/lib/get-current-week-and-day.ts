import { isAfter, isToday } from 'date-fns'

import { GQLTrainingDay, GQLTrainingWeek } from '@/generated/graphql-client'
import { DEFAULT_WEEK_START, WeekStartDay, isThisWeek } from '@/lib/date-utils'

type GetCurrentWeekAndDay = Pick<GQLTrainingWeek, 'scheduledAt'> & {
  days: Pick<GQLTrainingDay, 'scheduledAt' | 'isRestDay'>[]
}
export const getCurrentWeekAndDay = <T extends GetCurrentWeekAndDay>(
  weeks: T[] | undefined,
  weekStartsOn: WeekStartDay = DEFAULT_WEEK_START,
): {
  currentWeek: T | undefined
  currentDay: T['days'][number] | undefined
  nextWorkout: T['days'][number] | undefined
} => {
  if (!weeks) {
    return {
      currentWeek: undefined,
      currentDay: undefined,
      nextWorkout: undefined,
    }
  }

  const currentWeek = weeks.find((week) => {
    return week.scheduledAt && isThisWeek(week.scheduledAt, weekStartsOn)
  })

  const currentDay = currentWeek?.days.find((day) => {
    return day.scheduledAt && isToday(day.scheduledAt)
  })

  const nextWorkout = weeks
    ?.flatMap((week) => week.days)
    .find((day) => {
      return (
        day.scheduledAt &&
        isAfter(day.scheduledAt, new Date()) &&
        !day.isRestDay
      )
    })

  // Fallback logic: if no current week/day is found, use the first available workout day
  let fallbackWeek = currentWeek
  let fallbackDay = currentDay

  if (!currentWeek || !currentDay) {
    // Find the first week that has any scheduled workout days
    const firstAvailableWeek = weeks.find((week) =>
      week.days.some((day) => day.scheduledAt && !day.isRestDay),
    )

    if (firstAvailableWeek && !currentWeek) {
      fallbackWeek = firstAvailableWeek
    }

    // Find the first non-rest day in the selected week
    if (fallbackWeek && !currentDay) {
      fallbackDay = fallbackWeek.days.find(
        (day) => day.scheduledAt && !day.isRestDay,
      )
    }
  }

  return {
    currentWeek: fallbackWeek,
    currentDay: fallbackDay,
    nextWorkout,
  }
}
