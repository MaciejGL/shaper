import { isAfter, isThisISOWeek, isToday } from 'date-fns'

import { GQLTrainingDay, GQLTrainingWeek } from '@/generated/graphql-client'

type GetCurrentWeekAndDay = Pick<GQLTrainingWeek, 'scheduledAt'> & {
  days: Pick<GQLTrainingDay, 'scheduledAt' | 'isRestDay'>[]
}
export const getCurrentWeekAndDay = <T extends GetCurrentWeekAndDay>(
  weeks: T[] | undefined,
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
    return week.scheduledAt && isThisISOWeek(week.scheduledAt)
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

  return { currentWeek, currentDay, nextWorkout }
}
