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
                  substitutedBy: {
                    include: {
                      base: {
                        include: {
                          muscleGroups: true,
                        },
                      },
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
                  substitutes: true,
                  base: {
                    include: {
                      muscleGroups: true,
                      substitutes: {
                        include: {
                          substitute: true,
                        },
                      },
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
  createdById,
}: {
  plan: FullTrainingPlan
  asTemplate: boolean
  createdById?: string
}) {
  return prisma.$transaction(
    async (tx) => {
      const uuid = () => crypto.randomUUID()
      const newPlanId = uuid()

      // Create the main plan
      await tx.trainingPlan.create({
        data: {
          id: newPlanId,
          title: asTemplate ? `${plan.title} (Copy)` : plan.title,
          description: plan.description,
          isPublic: false,
          isTemplate: asTemplate,
          isDraft: asTemplate ? false : plan.isDraft,
          difficulty: plan.difficulty,
          templateId: asTemplate ? null : plan.templateId,
          createdById: createdById || plan.createdById,
          assignedToId: plan.assignedToId,
        },
      })

      // Prepare bulk data for all entities
      const weeksData = []
      const daysData = []
      const exercisesData = []
      const setsData = []

      // Build up all the data for bulk operations
      for (const week of plan.weeks) {
        const newWeekId = uuid()
        weeksData.push({
          id: newWeekId,
          name: week.name,
          weekNumber: week.weekNumber,
          description: week.description,
          planId: newPlanId,
        })

        for (const day of week.days) {
          const newDayId = uuid()
          daysData.push({
            id: newDayId,
            dayOfWeek: day.dayOfWeek,
            isRestDay: day.isRestDay,
            workoutType: day.workoutType,
            weekId: newWeekId,
          })

          for (const exercise of day.exercises) {
            const newExerciseId = uuid()
            exercisesData.push({
              id: newExerciseId,
              name: exercise.name,
              restSeconds: exercise.restSeconds,
              tempo: exercise.tempo,
              instructions: exercise.instructions ?? [],
              tips: exercise.tips ?? [],
              difficulty: exercise.difficulty,
              description: exercise.description,
              additionalInstructions: exercise.additionalInstructions,
              type: exercise.type,
              order: exercise.order,
              warmupSets: exercise.warmupSets,
              dayId: newDayId,
              baseId: exercise.baseId ?? null,
            })

            for (const set of exercise.sets) {
              setsData.push({
                id: uuid(),
                order: set.order,
                reps: set.reps,
                minReps: set.minReps,
                maxReps: set.maxReps,
                weight: set.weight,
                rpe: set.rpe,
                exerciseId: newExerciseId,
              })
            }
          }
        }
      }

      // Execute bulk operations in parallel for maximum performance
      await Promise.all([
        weeksData.length > 0
          ? tx.trainingWeek.createMany({ data: weeksData })
          : Promise.resolve(),
        daysData.length > 0
          ? tx.trainingDay.createMany({ data: daysData })
          : Promise.resolve(),
        exercisesData.length > 0
          ? tx.trainingExercise.createMany({ data: exercisesData })
          : Promise.resolve(),
        setsData.length > 0
          ? tx.exerciseSet.createMany({ data: setsData })
          : Promise.resolve(),
      ])

      return await tx.trainingPlan.findUnique({
        where: { id: newPlanId },
      })
    },
    { timeout: 10000, maxWait: 10000 }, // Reduced timeout since it should be much faster now
  )
}
