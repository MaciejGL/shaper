import { addDays, differenceInDays, getDay, isPast, startOfDay } from 'date-fns'

import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import {
  calculateNextCheckinDate,
  completeCheckin,
  createCheckinSchedule,
  deleteCheckinSchedule,
  getUserCheckinSchedule,
  skipCheckin,
  updateCheckinSchedule,
} from './factory'

/**
 * Calculate the first expected checkin date from schedule creation
 * This should align with how calculateNextCheckinDate works for first-time schedules
 */
function calculateFirstCheckinDate(
  frequency: string,
  dayOfWeek: number | null,
  dayOfMonth: number | null,
  scheduleCreatedAt: Date,
): Date {
  const createdDate = startOfDay(scheduleCreatedAt)

  switch (frequency) {
    case 'WEEKLY': {
      if (dayOfWeek === null || dayOfWeek === undefined) {
        throw new Error('dayOfWeek is required for weekly frequency')
      }

      const createdDay = getDay(createdDate)
      const daysUntilTarget = (dayOfWeek - createdDay + 7) % 7

      // If target day is same as creation day, first checkin is next week
      if (daysUntilTarget === 0) {
        return addDays(createdDate, 7)
      }

      // If target day is later this week from creation, use it
      if (daysUntilTarget > 0) {
        return addDays(createdDate, daysUntilTarget)
      }

      // Fallback (shouldn't happen with modulo)
      return addDays(createdDate, daysUntilTarget + 7)
    }

    case 'BIWEEKLY': {
      if (dayOfWeek === null || dayOfWeek === undefined) {
        throw new Error('dayOfWeek is required for biweekly frequency')
      }

      const createdDay = getDay(createdDate)
      const daysUntilTarget = (dayOfWeek - createdDay + 7) % 7

      // If target day is same as creation day, first checkin is in 2 weeks
      if (daysUntilTarget === 0) {
        return addDays(createdDate, 14)
      }

      // If target day is later this week from creation, use it
      if (daysUntilTarget > 0) {
        return addDays(createdDate, daysUntilTarget)
      }

      return addDays(createdDate, daysUntilTarget + 7)
    }

    case 'MONTHLY': {
      if (dayOfMonth === null || dayOfMonth === undefined) {
        throw new Error('dayOfMonth is required for monthly frequency')
      }

      // For monthly, first checkin is always next month on the specified day
      const nextMonth = new Date(createdDate)
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      nextMonth.setDate(
        Math.min(
          dayOfMonth,
          new Date(
            nextMonth.getFullYear(),
            nextMonth.getMonth() + 1,
            0,
          ).getDate(),
        ),
      )

      return nextMonth
    }

    default:
      throw new Error(`Unsupported frequency: ${frequency}`)
  }
}

export const Query: GQLQueryResolvers<GQLContext> = {
  checkinSchedule: async (_parent, _args, context) => {
    const userSession = context.user
    if (!userSession) {
      throw new Error('User not authenticated')
    }

    return await getUserCheckinSchedule(userSession.user.id)
  },

  checkinStatus: async (_parent, _args, context) => {
    const userSession = context.user
    if (!userSession) {
      throw new Error('User not authenticated')
    }

    const schedule = await getUserCheckinSchedule(userSession.user.id)

    if (!schedule || !schedule.isActive) {
      return {
        hasSchedule: false,
        schedule: null,
        nextCheckinDate: null,
        isCheckinDue: false,
        daysSinceLastCheckin: null,
      }
    }

    // Get the last completion with actual data (measurement or progress log)
    const lastValidCompletion = schedule.completions.find(
      (completion) => completion.measurement || completion.progressLog,
    )
    const lastCompletionDate = lastValidCompletion
      ? new Date(lastValidCompletion.completedAt)
      : undefined

    // Calculate next check-in date
    const nextCheckinDate = calculateNextCheckinDate(
      schedule.frequency,
      schedule.dayOfWeek,
      schedule.dayOfMonth,
      lastCompletionDate,
    )

    // Determine if checkin is due
    let isCheckinDue = false

    if (!lastValidCompletion) {
      // No completions yet - calculate the first expected checkin date from schedule creation
      const scheduleCreatedAt = new Date(schedule.createdAt)

      // Calculate what the first checkin date should have been
      const firstCheckinDate = calculateFirstCheckinDate(
        schedule.frequency,
        schedule.dayOfWeek,
        schedule.dayOfMonth,
        scheduleCreatedAt,
      )

      // If the first expected checkin date has passed, checkin is due
      isCheckinDue = isPast(startOfDay(firstCheckinDate))
    } else {
      // Has completions - use the standard logic
      isCheckinDue = isPast(startOfDay(nextCheckinDate))
    }

    const daysSinceLastCheckin = lastCompletionDate
      ? differenceInDays(new Date(), lastCompletionDate)
      : null

    return {
      hasSchedule: true,
      schedule,
      nextCheckinDate: nextCheckinDate.toISOString(),
      isCheckinDue,
      daysSinceLastCheckin,
    }
  },
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  createCheckinSchedule: async (_parent, { input }, context) => {
    const userSession = context.user
    if (!userSession) {
      throw new Error('User not authenticated')
    }

    // Check premium access - required for creating check-in schedules
    const { checkPremiumAccess } = await import('../subscription/factory')
    const hasPremium = await checkPremiumAccess(context)
    if (!hasPremium) {
      throw new Error(
        'Premium subscription required to create check-in schedules',
      )
    }

    return await createCheckinSchedule(userSession.user.id, input)
  },

  updateCheckinSchedule: async (_parent, { input }, context) => {
    const userSession = context.user
    if (!userSession) {
      throw new Error('User not authenticated')
    }

    // Check premium access - required for updating check-in schedules
    const { checkPremiumAccess } = await import('../subscription/factory')
    const hasPremium = await checkPremiumAccess(context)
    if (!hasPremium) {
      throw new Error(
        'Premium subscription required to update check-in schedules',
      )
    }

    return await updateCheckinSchedule(userSession.user.id, input)
  },

  deleteCheckinSchedule: async (_parent, _args, context) => {
    const userSession = context.user
    if (!userSession) {
      throw new Error('User not authenticated')
    }

    return await deleteCheckinSchedule(userSession.user.id)
  },

  completeCheckin: async (_parent, { input }, context) => {
    const userSession = context.user
    if (!userSession) {
      throw new Error('User not authenticated')
    }

    return await completeCheckin(userSession.user.id, input, context)
  },

  skipCheckin: async (_parent, _args, context) => {
    const userSession = context.user
    if (!userSession) {
      throw new Error('User not authenticated')
    }

    return await skipCheckin(userSession.user.id)
  },
}
