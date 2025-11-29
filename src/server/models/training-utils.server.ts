import {
  BaseExercise as PrismaBaseExercise,
  ExerciseSet as PrismaExerciseSet,
  TrainingDay as PrismaTrainingDay,
  TrainingExercise as PrismaTrainingExercise,
  TrainingPlan as PrismaTrainingPlan,
  TrainingWeek as PrismaTrainingWeek,
} from '@/generated/prisma/client'
import { prisma } from '@/lib/db'

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

// LIGHTWEIGHT VERSION - Use this for quick workout plans and similar operations
export async function getLightPlanById(id: string) {
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
                  base: {
                    select: {
                      id: true,
                      name: true,
                      muscleGroups: {
                        select: {
                          id: true,
                          name: true,
                          alias: true,
                          groupSlug: true,
                        },
                      },
                    },
                  },
                  sets: {
                    orderBy: {
                      order: 'asc',
                    },
                    select: {
                      id: true,
                      order: true,
                      reps: true,
                      minReps: true,
                      maxReps: true,
                      weight: true,
                      rpe: true,
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

// FULL VERSION - Only use when you actually need all the nested data (logs, substitutions, etc.)
// WARNING: This query can consume 8-12 database connections - use sparingly!
export async function getFullPlanById(id: string) {
  console.warn(
    `[DB-WARNING] Using heavy getFullPlanById query for plan ${id} - consider using getLightPlanById instead`,
  )

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
                      images: true,
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
          premium: plan.premium,
          targetGoals: plan.targetGoals,
          focusTags: plan.focusTags,
          heroImageUrl: plan.heroImageUrl,
          sourceTrainingPlanId: plan.id,
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
            planId: newPlanId,
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
              baseId: exercise.baseId,
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

      // If this is not a template (i.e., being assigned to a user), cleanup empty workout days
      if (!asTemplate) {
        // Find empty workout days (not rest days but with no exercises) and mark them as rest days
        const emptyWorkoutDays = await tx.trainingDay.findMany({
          where: {
            week: {
              planId: newPlanId,
            },
            isRestDay: false,
            exercises: {
              none: {},
            },
          },
          select: {
            id: true,
          },
        })

        // Update empty workout days to be rest days
        if (emptyWorkoutDays.length > 0) {
          await tx.trainingDay.updateMany({
            where: {
              id: {
                in: emptyWorkoutDays.map((day) => day.id),
              },
            },
            data: {
              isRestDay: true,
            },
          })
        }
      }

      return await tx.trainingPlan.findUnique({
        where: { id: newPlanId },
      })
    },
    { timeout: 10000, maxWait: 10000 }, // Reduced timeout since it should be much faster now
  )
}
