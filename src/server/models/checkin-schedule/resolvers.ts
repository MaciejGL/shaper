import { differenceInDays, isPast, startOfDay } from 'date-fns'

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
  updateCheckinSchedule,
} from './factory'

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

    const isCheckinDue = isPast(startOfDay(nextCheckinDate))
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

    return await createCheckinSchedule(userSession.user.id, input)
  },

  updateCheckinSchedule: async (_parent, { input }, context) => {
    const userSession = context.user
    if (!userSession) {
      throw new Error('User not authenticated')
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
}
