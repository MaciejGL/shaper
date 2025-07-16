import { prisma } from '@lib/db'

import {
  GQLMutationResolvers,
  GQLQueryResolvers,
  GQLWorkoutSessionEvent,
} from '@/generated/graphql-server'

import { copyExercisesFromDay } from './factory'
import TrainingDay from './model'

export const Query: GQLQueryResolvers = {
  getWorkoutInfo: async (_, { dayId }, context) => {
    const day = await prisma.trainingDay.findUnique({
      where: { id: dayId },
      include: {
        events: true,
        week: {
          select: {
            id: true,
          },
        },
        exercises: {
          include: {
            sets: {
              include: {
                log: true,
              },
            },
          },
        },
      },
    })

    if (!day) {
      throw new Error(`Training day with id ${dayId} not found`)
    }

    return new TrainingDay(day, context)
  },
}

export const Mutation: GQLMutationResolvers = {
  logWorkoutSessionEvent: async (_, { dayId, event }) => {
    await prisma.workoutSessionEvent.create({
      data: {
        dayId,
        type: event,
      },
    })

    return dayId
  },
  logWorkoutProgress: async (_, { dayId, tick }) => {
    const alreadyCompleted = await prisma.workoutSessionEvent.findFirst({
      where: { dayId, type: GQLWorkoutSessionEvent.Complete },
    })

    if (alreadyCompleted) {
      // reject further progress updates after completion
      return dayId
    }
    const progressEvent = await prisma.workoutSessionEvent.findFirst({
      where: { dayId, type: GQLWorkoutSessionEvent.Progress },
    })

    if (!progressEvent) {
      await prisma.workoutSessionEvent.create({
        data: {
          dayId,
          totalDuration: tick,
          type: GQLWorkoutSessionEvent.Progress,
        },
      })
      return dayId
    }

    await prisma.workoutSessionEvent.update({
      where: { id: progressEvent.id },
      data: { totalDuration: { increment: tick } },
    })

    return dayId
  },
  updateTrainingDayData: async (_, { input }, context) => {
    const { dayId, isRestDay, workoutType } = input
    const user = context.user

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Verify the user has permission to update this day
    const day = await prisma.trainingDay.findUnique({
      where: { id: dayId },
      include: {
        week: {
          include: {
            plan: {
              select: {
                createdById: true,
              },
            },
          },
        },
      },
    })

    if (!day) {
      throw new Error('Training day not found')
    }

    if (day.week.plan.createdById !== user.user.id) {
      throw new Error('You do not have permission to update this training day')
    }

    // Update the day with only the provided fields
    const updateData: {
      isRestDay?: boolean
      workoutType?: string | null
    } = {}

    if (isRestDay !== undefined && isRestDay !== null) {
      updateData.isRestDay = isRestDay
    }

    if (workoutType !== undefined) {
      updateData.workoutType = workoutType || null
    }

    await prisma.trainingDay.update({
      where: { id: dayId },
      data: updateData,
    })

    return true
  },
  copyExercisesFromDay: async (_, { input }, context) => {
    return await copyExercisesFromDay(input, context)
  },
}
