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

  getRecentCompletedWorkouts: async (_, {}, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    // Use the same approach as exercisesProgressByUser - query logs directly
    const logs = await prisma.exerciseSetLog.findMany({
      where: {
        ExerciseSet: {
          exercise: {
            day: {
              week: {
                plan: {
                  OR: [
                    { assignedToId: user.user.id }, // Currently assigned plans
                    { createdById: user.user.id }, // Plans created by user
                  ],
                },
              },
            },
          },
        },
        weight: { not: null },
        reps: { not: null },
      },
      include: {
        ExerciseSet: {
          include: {
            exercise: {
              include: {
                day: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!logs.length) return []

    // Group logs by workout sessions (time proximity, not just date)
    // Sort logs by creation time first
    const sortedLogs = logs.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    )

    const logsBySession: Record<string, typeof logs> = {}
    let currentSessionId = ''
    let lastLogTime = 0

    for (const log of sortedLogs) {
      const logTime = log.createdAt.getTime()

      // If more than 4 hours gap, start a new session
      const fourHours = 4 * 60 * 60 * 1000
      if (logTime - lastLogTime > fourHours || !currentSessionId) {
        // Create session ID from datetime: YYYY-MM-DD-HH
        const sessionDate = log.createdAt.toISOString()
        const dateHour = sessionDate.slice(0, 13) // YYYY-MM-DDTHH
        currentSessionId = dateHour.replace('T', '-') // YYYY-MM-DD-HH
      }

      if (!logsBySession[currentSessionId]) {
        logsBySession[currentSessionId] = []
      }
      logsBySession[currentSessionId].push(log)
      lastLogTime = logTime
    }

    // Find the 2 most recent workout sessions that have overlapping exercises
    const sessionIds = Object.keys(logsBySession).sort((a, b) =>
      b.localeCompare(a),
    ) // Most recent first

    // Find pairs of sessions with overlapping exercises
    let recentSessionIds: string[] = []

    for (let i = 0; i < sessionIds.length - 1; i++) {
      const currentSessionId = sessionIds[i]
      const currentExercises = [
        ...new Set(
          logsBySession[currentSessionId]
            .map((log) => log.ExerciseSet?.exercise.name)
            .filter(Boolean),
        ),
      ]

      for (let j = i + 1; j < sessionIds.length; j++) {
        const compareSessionId = sessionIds[j]
        const compareExercises = [
          ...new Set(
            logsBySession[compareSessionId]
              .map((log) => log.ExerciseSet?.exercise.name)
              .filter(Boolean),
          ),
        ]

        // Check for overlapping exercises
        const overlap = currentExercises.filter((ex) =>
          compareExercises.includes(ex),
        )
        if (overlap.length > 0) {
          recentSessionIds = [currentSessionId, compareSessionId]
          break
        }
      }

      if (recentSessionIds.length > 0) break
    }

    // Fallback to most recent 2 sessions if no overlap found
    if (recentSessionIds.length === 0) {
      recentSessionIds = sessionIds.slice(0, 2)
    }

    if (recentSessionIds.length === 0) return []

    const completedDays = []

    for (const sessionId of recentSessionIds) {
      const sessionLogs = logsBySession[sessionId]

      // Get the TrainingDay info from the first log
      const sampleLog = sessionLogs[0]
      const dayInfo = sampleLog.ExerciseSet?.exercise.day

      if (!dayInfo) {
        continue
      }

      // Get session time range
      const sessionLogTimes = sessionLogs.map((log) => log.createdAt)
      const sessionStart = new Date(
        Math.min(...sessionLogTimes.map((d) => d.getTime())),
      )
      const sessionEnd = new Date(
        Math.max(...sessionLogTimes.map((d) => d.getTime())),
      )

      // Add 1 hour buffer to session end to catch any late logs
      sessionEnd.setHours(sessionEnd.getHours() + 1)

      // Fetch the full TrainingDay with exercises filtered to this session's logs
      try {
        const trainingDay = await prisma.trainingDay.findUnique({
          where: { id: dayInfo.id },
          include: {
            exercises: {
              // Only include exercises that have logged sets in this session
              where: {
                sets: {
                  some: {
                    log: {
                      is: {
                        weight: { not: null },
                        reps: { not: null },
                        createdAt: {
                          gte: sessionStart,
                          lte: sessionEnd,
                        },
                      },
                    },
                  },
                },
              },
              include: {
                sets: {
                  // Only include sets with logs from this session
                  where: {
                    log: {
                      is: {
                        weight: { not: null },
                        reps: { not: null },
                        createdAt: {
                          gte: sessionStart,
                          lte: sessionEnd,
                        },
                      },
                    },
                  },
                  include: {
                    log: true,
                  },
                  orderBy: {
                    order: 'asc',
                  },
                },
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        })

        if (trainingDay) {
          // Set the completedAt to the session start time for frontend compatibility
          const virtualDay = {
            ...trainingDay,
            completedAt: sessionStart,
            exercises: trainingDay.exercises.map((exercise) => ({
              ...exercise,
              sets: exercise.sets.map((set) => ({
                ...set,
                log: set.log || undefined,
              })),
            })),
          }
          completedDays.push(virtualDay)
        }
      } catch (error) {
        // Silently skip sessions that fail to load
      }
    }

    // Sessions are already sorted by session time (most recent first)
    return completedDays.map((day) => new TrainingDay(day, context))
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
