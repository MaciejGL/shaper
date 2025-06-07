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
        base: PrismaBaseExercise
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
  return prisma.trainingPlan.create({
    data: {
      title: asTemplate ? `${plan.title} (Copy)` : plan.title,
      description: plan.description,
      isPublic: false,
      isTemplate: asTemplate,
      isDraft: asTemplate ? false : plan.isDraft,
      createdById: plan.createdById,
      assignedToId: plan.assignedToId,
      weeks: {
        create: plan.weeks.map((week) => ({
          weekNumber: week.weekNumber,
          name: week.name,
          description: week.description,
          days: {
            create: week.days.map((day) => ({
              dayOfWeek: day.dayOfWeek,
              isRestDay: day.isRestDay,
              workoutType: day.workoutType,
              exercises: {
                create: day.exercises.map((exercise) => ({
                  name: exercise.name,
                  restSeconds: exercise.restSeconds,
                  tempo: exercise.tempo,
                  instructions: exercise.instructions,
                  order: exercise.order,
                  warmupSets: exercise.warmupSets,
                  base: {
                    connect: exercise.baseId
                      ? {
                          id: exercise.baseId,
                        }
                      : undefined,
                  },
                  sets: {
                    create: exercise.sets.map((set) => ({
                      order: set.order,
                      reps: set.reps,
                      minReps: set.minReps,
                      maxReps: set.maxReps,
                      weight: set.weight,
                      rpe: set.rpe,
                    })),
                  },
                })),
              },
            })),
          },
        })),
      },
    },
  })
}
