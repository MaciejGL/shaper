import { prisma } from '@lib/db'
import {
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
      })[]
    })[]
  })[]
}

export async function getFullPlanById(id: string) {
  return prisma.trainingPlan.findUnique({
    where: { id },
    include: {
      weeks: {
        include: {
          days: {
            include: {
              exercises: {
                include: {
                  sets: true,
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
