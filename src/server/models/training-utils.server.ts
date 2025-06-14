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
              events: true,
              exercises: {
                orderBy: {
                  order: 'asc',
                },
                include: {
                  base: {
                    include: {
                      muscleGroups: true,
                    },
                  },
                  logs: true,
                  sets: {
                    include: {
                      log: true,
                    },
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
  return prisma.$transaction(
    async (tx) => {
      const uuid = () => crypto.randomUUID()
      const newPlanId = uuid()

      await tx.trainingPlan.create({
        data: {
          id: newPlanId,
          title: asTemplate ? `${plan.title} (Copy)` : plan.title,
          description: plan.description,
          isPublic: false,
          isTemplate: asTemplate,
          isDraft: asTemplate ? false : plan.isDraft,
          createdById: plan.createdById,
          assignedToId: plan.assignedToId,
        },
      })

      for (const week of plan.weeks) {
        const newWeekId = uuid()
        await tx.trainingWeek.create({
          data: {
            id: newWeekId,
            name: week.name,
            weekNumber: week.weekNumber,
            description: week.description,
            planId: newPlanId,
          },
        })

        for (const day of week.days) {
          const newDayId = uuid()
          await tx.trainingDay.create({
            data: {
              id: newDayId,
              dayOfWeek: day.dayOfWeek,
              isRestDay: day.isRestDay,
              workoutType: day.workoutType,
              weekId: newWeekId,
            },
          })

          for (const exercise of day.exercises) {
            const newExerciseId = uuid()
            await tx.trainingExercise.create({
              data: {
                id: newExerciseId,
                name: exercise.name,
                restSeconds: exercise.restSeconds,
                tempo: exercise.tempo,
                instructions: exercise.instructions,
                order: exercise.order,
                warmupSets: exercise.warmupSets,
                dayId: newDayId,
                baseId: exercise.baseId ?? null,
              },
            })

            for (const set of exercise.sets) {
              await tx.exerciseSet.create({
                data: {
                  id: uuid(),
                  order: set.order,
                  reps: set.reps,
                  minReps: set.minReps,
                  maxReps: set.maxReps,
                  weight: set.weight,
                  rpe: set.rpe,
                  exerciseId: newExerciseId,
                },
              })
            }
          }
        }
      }

      return await tx.trainingPlan.findUnique({
        where: { id: newPlanId },
      })
    },
    { timeout: 15000, maxWait: 15000 },
  )
}
