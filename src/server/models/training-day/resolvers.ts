import {
  GQLMutationResolvers,
  GQLQueryResolvers,
  GQLWorkoutSessionEvent,
} from '@/generated/graphql-server'
import { Prisma } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { getHistoricalBest1RM } from '@/lib/queries/historical-best-1rm'

import { copyExercisesFromDay } from './factory'
import TrainingDay from './model'

const detectWorkoutPRs = async (dayId: string, userId: string) => {
  // Get best performance from current workout
  const currentWorkoutSets = await prisma.$queryRaw<
    {
      baseId: string
      exercisename: string
      maxweight: number
      maxreps: number
      max1rm: number
    }[]
  >`
    SELECT 
      te."baseId",
      te.name as exercisename,
      MAX(esl.weight) as maxweight,
      MAX(esl.reps) as maxreps,
       MAX(
         CASE 
           WHEN esl.reps <= 10 THEN esl.weight / (1.0278 - (0.0278 * esl.reps))
           WHEN esl.reps <= 15 THEN esl.weight * (1 + 0.025 * esl.reps)
           ELSE esl.weight * 1.5
         END
       ) as max1rm
    FROM "ExerciseSet" es
    JOIN "TrainingExercise" te ON es."exerciseId" = te.id
    JOIN "ExerciseSetLog" esl ON es."logId" = esl.id
    WHERE te."dayId" = ${dayId}
      AND es."completedAt" IS NOT NULL
      AND esl.weight IS NOT NULL
      AND esl.reps IS NOT NULL
      AND te."baseId" IS NOT NULL
    GROUP BY te."baseId", te.name
  `

  if (currentWorkoutSets.length === 0) return []

  const newPRs = []

  for (const current of currentWorkoutSets) {
    // Get historical best using shared utility
    const prevBest = await getHistoricalBest1RM({
      baseExerciseId: current.baseId,
      userId,
      excludeDayId: dayId,
    })

    // First time logging this exercise - show as baseline PR
    if (prevBest <= 0) {
      newPRs.push({
        exerciseName: current.exercisename,
        estimated1RM: current.max1rm,
        weight: current.maxweight,
        reps: current.maxreps,
        improvement: 0,
      })
      continue
    }

    // Check for meaningful improvement (1% threshold)
    const isAboveThreshold = current.max1rm > prevBest * 1.01

    if (isAboveThreshold) {
      // Calculate improvement percentage
      const improvement = ((current.max1rm - prevBest) / prevBest) * 100

      // Only count as PR if improvement is realistic (<= 50%)
      if (improvement <= 50) {
        newPRs.push({
          exerciseName: current.exercisename,
          estimated1RM: current.max1rm,
          weight: current.maxweight,
          reps: current.maxreps,
          improvement,
        })
      }
    }
  }

  return newPRs
}

export const Query: GQLQueryResolvers = {
  getWorkoutInfo: async (_, { dayId }, context) => {
    const day = await prisma.trainingDay.findUnique({
      where: { id: dayId },
      include: {
        events: true,
      },
    })

    if (!day) {
      throw new Error(`Training day with id ${dayId} not found`)
    }

    const trainingDay = new TrainingDay(day, context)

    // Add PRs if workout is completed
    if (day.completedAt && context.user?.user?.id) {
      const prs = await detectWorkoutPRs(dayId, context.user.user.id)
      // @ts-expect-error - personalRecords added dynamically for GraphQL response
      trainingDay.personalRecords = prs
    }

    return trainingDay
  },

  getUserPRHistory: async (_, { userId, exerciseId }) => {
    const whereClause: Prisma.PersonalRecordWhereInput = { userId }
    if (exerciseId) {
      whereClause.baseExerciseId = exerciseId
    }

    const prHistory = await prisma.personalRecord.findMany({
      where: whereClause,
      include: {
        baseExercise: {
          select: { name: true },
        },
      },
      orderBy: [{ baseExerciseId: 'asc' }, { achievedAt: 'desc' }],
    })

    return prHistory.map((pr) => ({
      id: pr.id,
      estimated1RM: pr.estimated1RM,
      weight: pr.weight,
      reps: pr.reps,
      achievedAt: pr.achievedAt.toISOString(),
      exerciseName: pr.baseExercise.name,
      dayId: pr.dayId,
      exerciseId: pr.baseExerciseId,
    }))
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
