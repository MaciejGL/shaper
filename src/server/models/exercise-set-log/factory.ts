import { after } from 'next/server'

import {
  GQLMutationMarkExerciseAsCompletedArgs,
  GQLMutationMarkSetAsCompletedArgs,
  GQLMutationMarkWorkoutAsCompletedArgs,
  GQLMutationUpdateSetLogArgs,
  GQLWorkoutSessionEvent,
} from '@/generated/graphql-server'
import { invalidateTrainingAnalyticsCache } from '@/lib/cache/training-analytics-cache'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email/send-mail'
import {
  notifyFirstWorkoutCompleted,
  notifyPRDetectedFreeUser,
  notifyPlanCompleted,
  notifyThirdWorkoutMilestone,
  notifyTrainerWorkoutCompleted,
  notifyWorkoutCompleted,
} from '@/lib/notifications/push-notification-service'
import { getHistoricalBest1RM } from '@/lib/queries/historical-best-1rm'
import { subscriptionValidator } from '@/lib/subscription/subscription-validator'
import { GQLContext } from '@/types/gql-context'
import {
  calculateEstimated1RM,
  calculateImprovementPercentage,
  isPersonalRecord,
} from '@/utils/one-rm-calculator'

import ExerciseSetLog from './model'

// Lightweight PR detection for individual sets
const checkIfPersonalRecord = async (
  setId: string,
  weight: number,
  reps: number,
  userId: string,
): Promise<{ isPersonalRecord: boolean; improvement: number }> => {
  // Get baseId for this set
  const setInfo = await prisma.exerciseSet.findUnique({
    where: { id: setId },
    select: {
      exercise: {
        select: { baseId: true },
      },
    },
  })

  if (!setInfo?.exercise.baseId) {
    return { isPersonalRecord: false, improvement: 0 }
  }

  // Get current best 1RM (including completed sets from current workout)
  const prevBest = await getHistoricalBest1RM({
    baseExerciseId: setInfo.exercise.baseId,
    userId,
    excludeSetId: setId,
    includingCurrentWorkout: true,
  })
  const isNewPR = isPersonalRecord(weight, reps, prevBest)
  const improvement = calculateImprovementPercentage(weight, reps, prevBest)

  return {
    isPersonalRecord: isNewPR,
    improvement: isNewPR ? improvement : 0,
  }
}

const markSetAsCompletedRelatedData = async (
  setId: string,
  userId: string,
  reps?: number | null,
  weight?: number | null,
) => {
  // 1. Mark set as completed
  const updatedSet = await prisma.exerciseSet.update({
    where: { id: setId },
    data: {
      completedAt: new Date(),
      log: {
        upsert: {
          create: {
            reps,
            weight,
          },
          update: {
            reps,
            weight,
          },
        },
      },
    },
    select: {
      exerciseId: true,
    },
  })

  const exerciseId = updatedSet.exerciseId

  // Invalidate training analytics cache (async, non-blocking)
  after(invalidateTrainingAnalyticsCache(userId))

  // 2. Check if all sets in this exercise are completed
  const incompleteSets = await prisma.exerciseSet.count({
    where: {
      exerciseId,
      completedAt: null,
    },
  })

  if (incompleteSets === 0) {
    const exercise = await prisma.trainingExercise.update({
      where: { id: exerciseId },
      data: { completedAt: new Date() },
      select: { dayId: true },
    })

    if (userId) {
      after(saveExercisePR(exerciseId, exercise.dayId, userId))
    }
  } else {
    return null
  }

  // 3. Check if all exercises in the day are completed
  const day = await prisma.trainingDay.findFirst({
    where: {
      exercises: {
        some: { id: exerciseId },
      },
    },
    select: {
      id: true,
      weekId: true,
      exercises: {
        select: { completedAt: true },
      },
    },
  })

  if (!day) return null

  const allExercisesCompleted = day.exercises.every((ex) => ex.completedAt)
  if (allExercisesCompleted) {
    await prisma.trainingDay.update({
      where: { id: day.id },
      data: { completedAt: new Date() },
    })

    updateWorkoutSessionEvent(day.id, GQLWorkoutSessionEvent.Complete)
  } else {
    return null
  }

  // 4. Check if all days in the week are completed
  const week = await prisma.trainingWeek.findUnique({
    where: { id: day.weekId },
    select: {
      id: true,
      planId: true,
      days: { select: { completedAt: true, isRestDay: true } },
    },
  })

  if (!week) return null

  const allDaysCompleted = week.days
    .filter((d) => !d.isRestDay)
    .every((d) => d.completedAt)
  if (allDaysCompleted) {
    await prisma.trainingWeek.update({
      where: { id: week.id },
      data: { completedAt: new Date() },
    })
  } else {
    return null
  }

  // 5. Check if all weeks in the plan are completed
  const plan = await prisma.trainingPlan.findUnique({
    relationLoadStrategy: 'query',
    where: { id: week.planId },
    select: {
      id: true,
      weeks: { select: { completedAt: true } },
    },
  })

  if (!plan) return null

  const allWeeksCompleted = plan.weeks.every((w) => w.completedAt)
  if (allWeeksCompleted) {
    await prisma.trainingPlan.update({
      where: { id: plan.id },
      data: { completedAt: new Date() },
    })
  }

  return true
}

const unmarkSetCompletedRelatedData = async (setId: string, userId: string) => {
  const set = await prisma.exerciseSet.update({
    where: { id: setId },
    data: {
      completedAt: null,
      exercise: {
        update: {
          completedAt: null,
          day: {
            update: {
              completedAt: null,
              week: {
                update: {
                  completedAt: null,
                  plan: {
                    update: {
                      completedAt: null,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    select: {
      exerciseId: true,
      exercise: {
        select: {
          dayId: true,
        },
      },
    },
  })

  updateWorkoutSessionEvent(set.exercise.dayId, GQLWorkoutSessionEvent.Progress)

  // Invalidate training analytics cache (async, non-blocking)
  after(invalidateTrainingAnalyticsCache(userId))

  if (userId) {
    after(saveExercisePR(set.exerciseId, set.exercise.dayId, userId))
  }

  return true
}

export const markSetAsCompleted = async (
  args: GQLMutationMarkSetAsCompletedArgs,
  context: GQLContext,
) => {
  const { setId, completed, reps, weight } = args
  const userId = context.user?.user?.id

  // 1. Mark set as incomplete with all the related data
  if (!completed) {
    await unmarkSetCompletedRelatedData(setId, userId || '')
    return {
      success: true,
      isPersonalRecord: false,
      improvement: null,
    }
  }

  // 2. Mark set as completed in database
  await markSetAsCompletedRelatedData(setId, userId || '', reps, weight)

  // 3. Check if this is a personal record (only if we have weight and reps)
  let prInfo = { isPersonalRecord: false, improvement: 0 }
  if (reps && weight && userId) {
    try {
      prInfo = await checkIfPersonalRecord(setId, weight, reps, userId)

      // P3: If PR detected, send push notification to free users
      if (prInfo.isPersonalRecord) {
        after(async () => {
          const hasActiveSubscription =
            await subscriptionValidator.hasPremiumAccess(userId)
          if (!hasActiveSubscription) {
            // Get exercise name for the notification
            const setInfo = await prisma.exerciseSet.findUnique({
              where: { id: setId },
              select: {
                exercise: { select: { name: true } },
              },
            })
            const exerciseName = setInfo?.exercise?.name || 'your exercise'
            await notifyPRDetectedFreeUser(userId, exerciseName)
          }
        })
      }
    } catch (error) {
      console.error('Error checking PR status:', error)
      // Continue without PR info rather than failing the mutation
    }
  }

  return {
    success: true,
    isPersonalRecord: prInfo.isPersonalRecord,
    improvement: prInfo.isPersonalRecord ? prInfo.improvement : null,
  }
}

export const updateSetLog = async (args: GQLMutationUpdateSetLogArgs) => {
  const { setId, loggedReps, loggedWeight } = args.input

  const set = await prisma.exerciseSet.update({
    where: { id: setId },
    data: {
      log: {
        upsert: {
          create: {
            reps: typeof loggedReps === 'number' ? loggedReps : null,
            weight: typeof loggedWeight === 'number' ? loggedWeight : null,
          },
          update: {
            reps: typeof loggedReps === 'number' ? loggedReps : null,
            weight: typeof loggedWeight === 'number' ? loggedWeight : null,
          },
        },
      },
    },
    include: {
      log: true,
    },
  })

  if (!set.log) return null

  return new ExerciseSetLog(set.log)
}

export const markExerciseAsCompleted = async (
  args: GQLMutationMarkExerciseAsCompletedArgs,
) => {
  const { exerciseId, completed } = args

  // Get userId for cache invalidation
  const exerciseWithUser = await prisma.trainingExercise.findUnique({
    where: { id: exerciseId },
    select: {
      day: {
        select: {
          week: { select: { plan: { select: { assignedToId: true } } } },
        },
      },
    },
  })
  const userId = exerciseWithUser?.day?.week?.plan?.assignedToId

  if (!completed) {
    const exercise = await prisma.trainingExercise.update({
      where: { id: exerciseId },
      data: {
        completedAt: null,
        sets: {
          updateMany: {
            where: {
              completedAt: {
                not: null,
              },
            },
            data: {
              completedAt: null,
            },
          },
        },
        day: {
          update: {
            completedAt: null,
            week: {
              update: {
                completedAt: null,
                plan: {
                  update: {
                    completedAt: null,
                  },
                },
              },
            },
          },
        },
      },
      select: {
        dayId: true,
      },
    })

    await updateWorkoutSessionEvent(
      exercise.dayId,
      GQLWorkoutSessionEvent.Progress,
    )

    // Invalidate training analytics cache
    if (userId) {
      after(invalidateTrainingAnalyticsCache(userId))
    }

    return true
  }

  const exercise = await prisma.trainingExercise.update({
    where: { id: exerciseId },
    data: {
      completedAt: completed ? new Date() : null,
      sets: {
        updateMany: {
          where: { completedAt: null },
          data: { completedAt: new Date() },
        },
      },
    },
  })

  if (!exercise) return null

  // Invalidate training analytics cache
  if (userId) {
    after(invalidateTrainingAnalyticsCache(userId))
  }

  const day = await prisma.trainingDay.findFirst({
    where: { exercises: { some: { id: exerciseId } } },
    select: {
      id: true,
      weekId: true,
      exercises: { select: { completedAt: true } },
    },
  })

  if (!day) return null

  const allExercisesCompleted = day.exercises.every((ex) => ex.completedAt)
  if (allExercisesCompleted) {
    await prisma.trainingDay.update({
      where: { id: day.id },
      data: { completedAt: new Date() },
    })

    await updateWorkoutSessionEvent(day.id, GQLWorkoutSessionEvent.Complete)
  }

  const week = await prisma.trainingWeek.findUnique({
    where: { id: day.weekId },
    select: {
      id: true,
      planId: true,
      days: { select: { completedAt: true, isRestDay: true } },
    },
  })

  if (!week) return null

  const allDaysCompleted = week.days
    .filter((d) => !d.isRestDay)
    .every((d) => d.completedAt)
  if (allDaysCompleted) {
    await prisma.trainingWeek.update({
      where: { id: week.id },
      data: { completedAt: new Date() },
    })
  }

  const plan = await prisma.trainingPlan.findUnique({
    relationLoadStrategy: 'query',
    where: { id: week.planId },
    select: { id: true, weeks: { select: { completedAt: true } } },
  })

  if (!plan) return null

  const allWeeksCompleted = plan.weeks.every((w) => w.completedAt)
  if (allWeeksCompleted) {
    await prisma.trainingPlan.update({
      where: { id: plan.id },
      data: { completedAt: new Date() },
    })
  }

  return true
}

const saveExercisePR = async (
  exerciseId: string,
  dayId: string,
  userId: string,
) => {
  const hasPremiumAccess = await subscriptionValidator.hasPremiumAccess(userId)
  if (!hasPremiumAccess) {
    return
  }

  const completedSets = await prisma.exerciseSet.findMany({
    where: {
      exerciseId,
      completedAt: { not: null },
      log: {
        weight: { not: null },
        reps: { not: null },
      },
    },
    include: {
      log: true,
      exercise: {
        select: { baseId: true },
      },
    },
  })

  if (completedSets.length === 0) {
    return
  }

  const baseExerciseId = completedSets[0]?.exercise.baseId
  if (!baseExerciseId) {
    return
  }

  let best1RM = 0
  let bestWeight = 0
  let bestReps = 0

  for (const set of completedSets) {
    if (!set.log?.weight || !set.log?.reps) continue

    const reps = set.log.reps
    const weight = set.log.weight
    const estimated1RM = calculateEstimated1RM(weight, reps)

    if (estimated1RM > best1RM) {
      best1RM = estimated1RM
      bestWeight = weight
      bestReps = reps
    }
  }

  if (best1RM === 0) {
    return
  }

  const existingDayPR = await prisma.personalRecord.findUnique({
    where: {
      userId_baseExerciseId_dayId: {
        userId,
        baseExerciseId,
        dayId,
      },
    },
  })

  const currentBestPRs = await prisma.$queryRaw<{ maxEstimated1RM: number }[]>`
    SELECT 
      MAX("estimated1RM") as "maxEstimated1RM"
    FROM "PersonalRecord" 
    WHERE "userId" = ${userId}
      AND "baseExerciseId" = ${baseExerciseId}
      AND "dayId" != ${dayId}
  `

  const currentBest = currentBestPRs[0]?.maxEstimated1RM || 0

  // First time logging this exercise - save as baseline PR
  if (currentBest <= 0) {
    await prisma.personalRecord.upsert({
      where: {
        userId_baseExerciseId_dayId: {
          userId,
          baseExerciseId,
          dayId,
        },
      },
      update: {
        estimated1RM: best1RM,
        weight: bestWeight,
        reps: bestReps,
        achievedAt: new Date(),
      },
      create: {
        userId,
        baseExerciseId,
        dayId,
        estimated1RM: best1RM,
        weight: bestWeight,
        reps: bestReps,
        achievedAt: new Date(),
      },
    })
    return
  }

  const isAboveThreshold = best1RM > currentBest * 1.01
  if (!isAboveThreshold) {
    if (existingDayPR) {
      await prisma.personalRecord.delete({
        where: { id: existingDayPR.id },
      })
    }
    return
  }

  const improvement = ((best1RM - currentBest) / currentBest) * 100
  const isRealisticPR = improvement <= 50

  if (isRealisticPR) {
    await prisma.personalRecord.upsert({
      where: {
        userId_baseExerciseId_dayId: {
          userId,
          baseExerciseId,
          dayId,
        },
      },
      update: {
        estimated1RM: best1RM,
        weight: bestWeight,
        reps: bestReps,
        achievedAt: new Date(),
      },
      create: {
        userId,
        baseExerciseId,
        dayId,
        estimated1RM: best1RM,
        weight: bestWeight,
        reps: bestReps,
        achievedAt: new Date(),
      },
    })
  } else if (existingDayPR) {
    await prisma.personalRecord.delete({
      where: { id: existingDayPR.id },
    })
  }
}

/**
 * Check workout milestones and send appropriate emails/push notifications
 * Only for users without active subscription
 */
const checkWorkoutMilestones = async (userId: string) => {
  // Count user's completed workouts
  const completedWorkoutCount = await prisma.trainingDay.count({
    where: {
      completedAt: { not: null },
      week: {
        plan: {
          OR: [{ assignedToId: userId }, { createdById: userId }],
        },
      },
    },
  })

  // Check if user has an active subscription
  const hasPremium = await subscriptionValidator.hasPremiumAccess(userId)
  if (hasPremium) return

  // P1: First workout completed - send push notification
  if (completedWorkoutCount === 1) {
    await notifyFirstWorkoutCompleted(userId)
    return
  }

  // P2 + Email: 3rd workout completed - send push notification + milestone email
  if (completedWorkoutCount === 3) {
    await notifyThirdWorkoutMilestone(userId)

    // Get user and workout data for email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        name: true,
        profile: { select: { firstName: true } },
      },
    })

    if (!user?.email) return

    // Get completed exercises with sets for stats
    const completedDays = await prisma.trainingDay.findMany({
      relationLoadStrategy: 'query',
      where: {
        completedAt: { not: null },
        week: {
          plan: {
            OR: [{ assignedToId: userId }, { createdById: userId }],
          },
        },
      },
      select: {
        exercises: {
          select: {
            name: true,
            baseId: true,
            sets: {
              where: { completedAt: { not: null } },
              select: { id: true },
            },
          },
        },
      },
    })

    // Calculate stats from fetched data
    const allSets = completedDays.flatMap((d) =>
      d.exercises.flatMap((e) => e.sets),
    )
    const uniqueBaseIds = new Set(
      completedDays.flatMap((d) =>
        d.exercises.map((e) => e.baseId).filter(Boolean),
      ),
    )

    // Get top exercises by set count
    const exerciseSetCounts = new Map<string, number>()
    for (const day of completedDays) {
      for (const exercise of day.exercises) {
        const current = exerciseSetCounts.get(exercise.name) || 0
        exerciseSetCounts.set(exercise.name, current + exercise.sets.length)
      }
    }
    const topExercises = [...exerciseSetCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name)

    const userName = user.profile?.firstName || user.name || undefined

    await sendEmail.workoutMilestone(user.email, {
      userId,
      userName,
      totalSets: allSets.length,
      exerciseCount: uniqueBaseIds.size,
      topExercises,
    })
  }
}

export const markWorkoutAsCompleted = async (
  args: GQLMutationMarkWorkoutAsCompletedArgs,
) => {
  const { dayId } = args

  const now = new Date()

  // Get user and trainer info for push notifications
  const dayWithInfo = await prisma.trainingDay.findUnique({
    relationLoadStrategy: 'query',
    where: { id: dayId },
    select: {
      id: true,
      weekId: true,
      workoutType: true,
      week: {
        select: {
          id: true,
          planId: true,
          plan: {
            select: {
              id: true,
              title: true,
              assignedTo: {
                select: {
                  id: true,
                  name: true,
                  profile: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
              createdBy: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  })

  await prisma.trainingDay.update({
    where: { id: dayId },
    data: { completedAt: now },
  })

  await updateWorkoutSessionEvent(dayId, GQLWorkoutSessionEvent.Complete)

  // Invalidate training analytics cache
  if (dayWithInfo?.week?.plan?.assignedTo?.id) {
    after(invalidateTrainingAnalyticsCache(dayWithInfo.week.plan.assignedTo.id))
  }

  // Send workout completion notifications
  if (dayWithInfo?.week?.plan?.assignedTo) {
    const client = dayWithInfo.week.plan.assignedTo
    const clientName =
      client.profile?.firstName && client.profile?.lastName
        ? `${client.profile.firstName} ${client.profile.lastName}`
        : client.name || 'Client'

    // Notify client of their achievement
    await notifyWorkoutCompleted(
      client.id,
      dayWithInfo.workoutType || undefined,
    )

    // If there's a trainer, notify them
    if (dayWithInfo.week.plan.createdBy.id !== client.id) {
      await notifyTrainerWorkoutCompleted(
        dayWithInfo.week.plan.createdBy.id,
        clientName,
        dayWithInfo.workoutType || undefined,
      )
    }

    // Check workout milestones (push + email) - async, don't block
    after(async () => {
      await checkWorkoutMilestones(client.id)
    })
  }

  // ✅ Cascade completion checks remain sequential

  const day = await prisma.trainingDay.findUnique({
    relationLoadStrategy: 'query',
    where: { id: dayId },
    select: { weekId: true },
  })

  if (!day) return { success: true, planCompleted: false, planId: null }

  const week = await prisma.trainingWeek.findUnique({
    relationLoadStrategy: 'query',
    where: { id: day.weekId },
    select: {
      id: true,
      planId: true,
      days: { select: { completedAt: true, isRestDay: true } },
    },
  })

  if (!week) return { success: true, planCompleted: false, planId: null }

  const allDaysCompleted = week.days
    .filter((d) => !d.isRestDay)
    .every((d) => d.completedAt)
  if (allDaysCompleted) {
    await prisma.trainingWeek.update({
      where: { id: week.id },
      data: { completedAt: now },
    })
  }

  const plan = await prisma.trainingPlan.findUnique({
    relationLoadStrategy: 'query',
    where: { id: week.planId },
    select: {
      id: true,
      title: true,
      completedAt: true,
      createdById: true,
      assignedToId: true,
      assignedTo: {
        select: {
          id: true,
        },
      },
      weeks: { select: { completedAt: true } },
    },
  })

  if (!plan) return { success: true, planCompleted: false, planId: null }

  const allWeeksCompleted = plan.weeks.every((w) => w.completedAt)
  let planJustCompleted = false

  // Check if this is a Quick Workout plan (self-created and self-assigned)
  const isQuickWorkout = plan.createdById === plan.assignedToId

  if (allWeeksCompleted && !plan.completedAt && !isQuickWorkout) {
    await prisma.trainingPlan.update({
      where: { id: plan.id },
      data: { completedAt: now },
    })

    planJustCompleted = true

    // Send plan completion notification
    if (plan.assignedTo) {
      await notifyPlanCompleted(plan.assignedTo.id, plan.title)
    }
  }

  return {
    success: true,
    planCompleted: planJustCompleted,
    planId: planJustCompleted ? plan.id : null,
  }
}

const updateWorkoutSessionEvent = async (
  dayId: string,
  type: GQLWorkoutSessionEvent,
) => {
  const event = await prisma.workoutSessionEvent.findFirst({
    where: { dayId },
  })

  if (event) {
    await prisma.workoutSessionEvent.update({
      where: { id: event.id },
      data: { type },
    })
  }
}
