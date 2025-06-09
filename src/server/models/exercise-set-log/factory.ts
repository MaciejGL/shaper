import { prisma } from '@lib/db'

import {
  GQLMutationMarkSetAsCompletedArgs,
  GQLMutationUpdateSetLogArgs,
} from '@/generated/graphql-server'

import ExerciseSetLog from './model'

export const markSetAsCompleted = async (
  args: GQLMutationMarkSetAsCompletedArgs,
) => {
  const { setId, completed } = args

  // 1. Mark set as incomplete with all the related data
  if (!completed) {
    await prisma.exerciseSet.update({
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
    })

    return true
  }

  // 1. Mark set as completed
  const updatedSet = await prisma.exerciseSet.update({
    where: { id: setId },
    data: { completedAt: new Date() },
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
    await prisma.trainingExercise.update({
      where: { id: exerciseId },
      data: { completedAt: new Date() },
    })
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
  } else {
    return null
  }

  // 4. Check if all days in the week are completed
  const week = await prisma.trainingWeek.findUnique({
    where: { id: day.weekId },
    select: {
      id: true,
      planId: true,
      days: { select: { completedAt: true } },
    },
  })

  if (!week) return null

  const allDaysCompleted = week.days.every((d) => d.completedAt)
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

export const updateSetLog = async (args: GQLMutationUpdateSetLogArgs) => {
  const { setId, loggedReps, loggedWeight } = args.input
  const set = await prisma.exerciseSet.update({
    where: { id: setId },
    data: {
      log: {
        upsert: {
          create: {
            reps: loggedReps ?? undefined,
            weight: loggedWeight ?? undefined,
          },
          update: {
            reps: loggedReps ?? undefined,
            weight: loggedWeight ?? undefined,
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
