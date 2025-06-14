import { isThisISOWeek, isToday } from 'date-fns'

import { GQLTrainingDay, GQLTrainingWeek } from '@/generated/graphql-client'

type GetCurrentWeekAndDay = Pick<GQLTrainingWeek, 'scheduledAt'> & {
  days: Pick<GQLTrainingDay, 'scheduledAt'>[]
}
export const getCurrentWeekAndDay = <T extends GetCurrentWeekAndDay>(
  weeks: T[] | undefined,
): {
  currentWeek: T | undefined
  currentDay: T['days'][number] | undefined
} => {
  if (!weeks) {
    return { currentWeek: undefined, currentDay: undefined }
  }

  const currentWeek = weeks.find((week) => {
    return week.scheduledAt && isThisISOWeek(week.scheduledAt)
  })

  const currentDay = currentWeek?.days.find((day) => {
    return day.scheduledAt && isToday(day.scheduledAt)
  })

  return { currentWeek, currentDay }
}
