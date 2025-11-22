import {
  GQLMutationMarkExerciseAsCompletedArgs,
  GQLMutationMarkSetAsCompletedArgs,
  GQLMutationMarkWorkoutAsCompletedArgs,
  GQLMutationUpdateSetLogArgs,
  GQLWorkoutSessionEvent,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import {
  notifyPlanCompleted,
  notifyTrainerWorkoutCompleted,
  notifyWorkoutCompleted,
} from '@/lib/notifications/push-notification-service'
import { getHistoricalBest1RM } from '@/lib/queries/historical-best-1rm'
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
      try {
        await saveExercisePR(exerciseId, exercise.dayId, userId)
      } catch (error) {
        console.error('Error saving exercise PR:', error)
      }
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

  if (userId) {
    try {
      await saveExercisePR(set.exerciseId, set.exercise.dayId, userId)
    } catch (error) {
      console.error('Error recalculating exercise PR:', error)
    }
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

  if (currentBest <= 0) {
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
    if (existingDayPR) {
      await prisma.personalRecord.update({
        where: { id: existingDayPR.id },
        data: {
          estimated1RM: best1RM,
          weight: bestWeight,
          reps: bestReps,
          achievedAt: new Date(),
        },
      })
    } else {
      await prisma.personalRecord.create({
        data: {
          userId,
          baseExerciseId,
          dayId,
          estimated1RM: best1RM,
          weight: bestWeight,
          reps: bestReps,
        },
      })
    }
  } else if (existingDayPR) {
    await prisma.personalRecord.delete({
      where: { id: existingDayPR.id },
    })
  }
}

const saveWorkoutPRs = async (dayId: string, userId: string) => {
  // Get all completed sets from current workout with exercise info
  const completedSets = await prisma.exerciseSet.findMany({
    where: {
      exercise: { dayId },
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

  // Group by exercise and find best 1RM for each
  const exercisePerformances = new Map<
    string,
    {
      baseId: string
      best1RM: number
      bestWeight: number
      bestReps: number
    }
  >()

  for (const set of completedSets) {
    if (!set.exercise.baseId || !set.log?.weight || !set.log?.reps) continue

    // Use shared 1RM calculation utility
    const reps = set.log.reps
    const weight = set.log.weight
    const estimated1RM = calculateEstimated1RM(weight, reps)
    const key = set.exercise.baseId

    const current = exercisePerformances.get(key)
    if (!current || estimated1RM > current.best1RM) {
      exercisePerformances.set(key, {
        baseId: set.exercise.baseId,
        best1RM: estimated1RM,
        bestWeight: set.log.weight,
        bestReps: set.log.reps,
      })
    }
  }

  // Check if PRs already exist for this workout day
  const baseExerciseIds = Array.from(exercisePerformances.keys())
  const existingDayPRs = await prisma.personalRecord.findMany({
    where: {
      userId,
      dayId,
      baseExerciseId: { in: baseExerciseIds },
    },
  })

  const existingDayPRMap = new Map(
    existingDayPRs.map((pr) => [pr.baseExerciseId, pr]),
  )

  // Get current best PRs for comparison (excluding today's workout)
  const currentBestPRs = await prisma.$queryRaw<
    { baseExerciseId: string; maxEstimated1RM: number }[]
  >`
    SELECT 
      "baseExerciseId",
      MAX("estimated1RM") as "maxEstimated1RM"
    FROM "PersonalRecord" 
    WHERE "userId" = ${userId}
      AND "baseExerciseId" = ANY(${baseExerciseIds})
      AND "dayId" != ${dayId}
    GROUP BY "baseExerciseId"
  `

  const currentBestMap = new Map(
    currentBestPRs.map((pr) => [pr.baseExerciseId, pr.maxEstimated1RM]),
  )

  for (const [baseId, current] of exercisePerformances) {
    const currentBest = currentBestMap.get(baseId) || 0
    const existingDayPR = existingDayPRMap.get(baseId)

    // Skip if no previous best (first time logging)
    if (currentBest <= 0) {
      continue
    }

    // Check for meaningful improvement
    const isAboveThreshold = current.best1RM > currentBest * 1.01
    if (!isAboveThreshold) {
      continue
    }

    // Check if improvement is realistic (<= 50%)
    const improvement = ((current.best1RM - currentBest) / currentBest) * 100
    const isRealisticPR = improvement <= 50

    if (isRealisticPR) {
      if (existingDayPR) {
        // Update existing PR for this workout day
        await prisma.personalRecord.update({
          where: { id: existingDayPR.id },
          data: {
            estimated1RM: current.best1RM,
            weight: current.bestWeight,
            reps: current.bestReps,
            achievedAt: new Date(),
          },
        })
      } else {
        // Create new PR record
        await prisma.personalRecord.create({
          data: {
            userId,
            baseExerciseId: baseId,
            dayId,
            estimated1RM: current.best1RM,
            weight: current.bestWeight,
            reps: current.bestReps,
          },
        })
      }
    }
  }
}

export const markWorkoutAsCompleted = async (
  args: GQLMutationMarkWorkoutAsCompletedArgs,
) => {
  const { dayId } = args

  const now = new Date()

  // Get user and trainer info for push notifications
  const dayWithInfo = await prisma.trainingDay.findUnique({
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

  // Save PRs for completed workout
  if (dayWithInfo?.week?.plan?.assignedTo?.id) {
    await saveWorkoutPRs(dayId, dayWithInfo.week.plan.assignedTo.id)
  }

  await updateWorkoutSessionEvent(dayId, GQLWorkoutSessionEvent.Complete)

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
  }

  // ✅ Cascade completion checks remain sequential

  const day = await prisma.trainingDay.findUnique({
    where: { id: dayId },
    select: { weekId: true },
  })

  if (!day) return true

  const week = await prisma.trainingWeek.findUnique({
    where: { id: day.weekId },
    select: {
      id: true,
      planId: true,
      days: { select: { completedAt: true, isRestDay: true } },
    },
  })

  if (!week) return true

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
    where: { id: week.planId },
    select: {
      id: true,
      title: true,
      assignedTo: {
        select: {
          id: true,
        },
      },
      weeks: { select: { completedAt: true } },
    },
  })

  if (!plan) return true

  const allWeeksCompleted = plan.weeks.every((w) => w.completedAt)
  if (allWeeksCompleted) {
    await prisma.trainingPlan.update({
      where: { id: plan.id },
      data: { completedAt: now },
    })

    // Send plan completion notification
    if (plan.assignedTo) {
      await notifyPlanCompleted(plan.assignedTo.id, plan.title)
    }
  }

  return true
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
