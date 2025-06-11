import { prisma } from '@lib/db'

import {
  GQLMutationResolvers,
  GQLQueryResolvers,
  GQLWorkoutSessionEvent,
} from '@/generated/graphql-server'

import TrainingDay from './model'

export const Query: GQLQueryResolvers = {
  getWorkoutInfo: async (_, { dayId }) => {
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

    return new TrainingDay(day)
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
}
