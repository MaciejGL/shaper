import { prisma } from '@lib/db'
import {
  BaseExercise as PrismaBaseExercise,
  ExerciseSet as PrismaExerciseSet,
  TrainingDay as PrismaTrainingDay,
  TrainingExercise as PrismaTrainingExercise,
  TrainingPlan as PrismaTrainingPlan,
  TrainingWeek as PrismaTrainingWeek,
} from '@prisma/client'

type FullTrainingPlan = PrismaTrainingPlan & {
  weeks: (PrismaTrainingWeek & {
    days: (PrismaTrainingDay & {
      exercises: (PrismaTrainingExercise & {
        sets: PrismaExerciseSet[]
        base?: PrismaBaseExercise | null
      })[]
    })[]
  })[]
}

export async function getFullPlanById(id: string) {
  return prisma.trainingPlan.findUnique({
    where: { id },
    include: {
      weeks: {
        orderBy: {
          weekNumber: 'asc',
        },
        include: {
          days: {
            orderBy: {
              dayOfWeek: 'asc',
            },
            include: {
              exercises: {
                orderBy: {
                  order: 'asc',
                },
                include: {
                  base: true,
                  logs: true,
                  sets: {
                    orderBy: {
                      order: 'asc',
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
}

export async function duplicatePlan({
  plan,
  asTemplate,
}: {
  plan: FullTrainingPlan
  asTemplate: boolean
}) {
  // return prisma.trainingPlan.create({
  //   data: {
  //     title: asTemplate ? `${plan.title} (Copy)` : plan.title,
  //     description: plan.description,
  //     isPublic: false,
  //     isTemplate: asTemplate,
  //     isDraft: asTemplate ? false : plan.isDraft,
  //     createdById: plan.createdById,
  //     assignedToId: plan.assignedToId,
  //     weeks: {
  //       create: plan.weeks.map((week) => ({
  //         weekNumber: week.weekNumber,
  //         name: week.name,
  //         description: week.description,
  //         days: {
  //           create: week.days.map((day) => ({
  //             dayOfWeek: day.dayOfWeek,
  //             isRestDay: day.isRestDay,
  //             workoutType: day.workoutType,
  //             exercises: {
  //               create: day.exercises.map((exercise) => ({
  //                 name: exercise.name,
  //                 restSeconds: exercise.restSeconds,
  //                 tempo: exercise.tempo,
  //                 instructions: exercise.instructions,
  //                 order: exercise.order,
  //                 warmupSets: exercise.warmupSets,
  //                 base: {
  //                   connect: exercise.baseId
  //                     ? {
  //                         id: exercise.baseId,
  //                       }
  //                     : undefined,
  //                 },
  //                 sets: {
  //                   create: exercise.sets.map((set) => ({
  //                     order: set.order,
  //                     reps: set.reps,
  //                     minReps: set.minReps,
  //                     maxReps: set.maxReps,
  //                     weight: set.weight,
  //                     rpe: set.rpe,
  //                   })),
  //                 },
  //               })),
  //             },
  //           })),
  //         },
  //       })),
  //     },
  //   },
  // })

  // 1. Create the training plan root
  const duplicatedPlan = await prisma.trainingPlan.create({
    data: {
      title: asTemplate ? `${plan.title} (Copy)` : plan.title,
      description: plan.description,
      isPublic: false,
      isTemplate: asTemplate,
      isDraft: asTemplate ? false : plan.isDraft,
      createdById: plan.createdById,
      assignedToId: plan.assignedToId,
    },
  })

  // const weekIdMap: Record<string, string> = {}
  // const dayIdMap: Record<string, string> = {}
  // const exerciseIdMap: Record<string, string> = []

  // 2. Insert weeks
  const weeksData = plan.weeks.map((week, i) => ({
    planId: duplicatedPlan.id,
    weekNumber: week.weekNumber,
    name: week.name,
    description: week.description,
  }))

  // const insertedWeeks =
  await prisma.trainingWeek.createMany({
    data: weeksData,
    skipDuplicates: true,
  })

  // 3. Fetch inserted weeks to get IDs
  const newWeeks = await prisma.trainingWeek.findMany({
    where: { planId: duplicatedPlan.id },
    orderBy: { weekNumber: 'asc' },
  })

  // 4. Prepare and insert days, exercises, sets using `createMany`
  const daysData = []
  const exercisesData = []
  const setsData = []

  for (let i = 0; i < plan.weeks.length; i++) {
    const oldWeek = plan.weeks[i]
    const newWeek = newWeeks[i]

    for (const day of oldWeek.days) {
      const newDayId = crypto.randomUUID()
      daysData.push({
        id: newDayId,
        weekId: newWeek.id,
        dayOfWeek: day.dayOfWeek,
        isRestDay: day.isRestDay,
        workoutType: day.workoutType,
      })

      for (const exercise of day.exercises) {
        const newExerciseId = crypto.randomUUID()
        exercisesData.push({
          id: newExerciseId,
          dayId: newDayId,
          name: exercise.name,
          restSeconds: exercise.restSeconds,
          tempo: exercise.tempo,
          instructions: exercise.instructions,
          order: exercise.order,
          warmupSets: exercise.warmupSets,
          baseId: exercise.baseId ?? null,
        })

        for (const set of exercise.sets) {
          setsData.push({
            exerciseId: newExerciseId,
            order: set.order,
            reps: set.reps,
            minReps: set.minReps,
            maxReps: set.maxReps,
            weight: set.weight,
            rpe: set.rpe,
          })
        }
      }
    }
  }

  await prisma.trainingDay.createMany({ data: daysData })
  await prisma.trainingExercise.createMany({ data: exercisesData })
  await prisma.exerciseSet.createMany({ data: setsData })

  return duplicatedPlan
}
