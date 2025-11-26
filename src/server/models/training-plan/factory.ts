import * as crypto from 'crypto'
import { addWeeks } from 'date-fns'
import { GraphQLError } from 'graphql'

import {
  GQLMutationActivatePlanArgs,
  GQLMutationClosePlanArgs,
  GQLMutationDeletePlanArgs,
  GQLMutationPausePlanArgs,
  GQLQueryGetClientActivePlanArgs,
} from '@/generated/graphql-client'
import {
  GQLMutationAssignTemplateToSelfArgs,
  GQLMutationAssignTrainingPlanToClientArgs,
  GQLMutationCreateTrainingPlanArgs,
  GQLMutationDeleteTrainingPlanArgs,
  GQLMutationDuplicateTrainingPlanArgs,
  GQLMutationRemoveTrainingPlanFromClientArgs,
  GQLMutationUpdateTrainingPlanArgs,
  GQLNotificationType,
  GQLQueryGetClientTrainingPlansArgs,
  GQLQueryGetTemplatesArgs,
  GQLQueryGetTrainingPlanByIdArgs,
  GQLQueryGetWorkoutDayArgs,
  GQLQueryGetWorkoutNavigationArgs,
} from '@/generated/graphql-server'
import { Prisma } from '@/generated/prisma/client'
import { ensureTrainerClientAccess } from '@/lib/access-control'
import { cache } from '@/lib/cache'
import {
  calculateTrainingDayScheduledDate,
  translateDayOfWeekForUser,
} from '@/lib/date-utils'
import { prisma } from '@/lib/db'
import { notifyTrainingPlanAssigned } from '@/lib/notifications/push-notification-service'
import { getFromCache, setInCache } from '@/lib/redis'
import {
  getTodayUTC,
  getWeekStartUTC,
  parseUTCDate,
} from '@/lib/server-date-utils'
import { subscriptionValidator } from '@/lib/subscription/subscription-validator'
import { GQLContext } from '@/types/gql-context'
import { calculateEstimated1RM } from '@/utils/one-rm-calculator'

import ExerciseSet from '../exercise-set/model'
import { createNotification } from '../notification/factory'
import { completeTaskByAction } from '../service-task/factory'
import TrainingDay from '../training-day/model'
import { duplicatePlan, getFullPlanById } from '../training-utils.server'

import TrainingPlan from './model'
import { ensureQuickWorkoutWeeks } from './quick-workout-utils'

export async function getTrainingPlanById(
  args: GQLQueryGetTrainingPlanByIdArgs,
  context: GQLContext,
) {
  const { id } = args
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  try {
    const trainingPlan = await prisma.trainingPlan.findUnique({
      where: { id },
      include: {
        createdBy: {
          include: {
            profile: true,
          },
        },
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
                        videoUrl: true,
                        images: true,
                        muscleGroups: true,
                      },
                    },
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

    if (!trainingPlan) {
      throw new Error('Training plan not found')
    }

    // TODO: Why is this here?
    // if (
    //   trainingPlan.isTemplate &&
    //   !trainingPlan.assignedToId &&
    //   trainingPlan.createdById !== user.user.id
    // ) {
    //   const scopedTrainingPlan = {
    //     ...trainingPlan,
    //     weeks: trainingPlan.weeks.map((week, weekIndex) => ({
    //       ...week,
    //       days: weekIndex === 0 ? week.days.map((day) => day) : undefined,
    //     })),
    //   } as typeof trainingPlan
    //   return new TrainingPlan(scopedTrainingPlan, context)
    // }

    return new TrainingPlan(trainingPlan, context)
  } catch (error) {
    console.error(error)
    throw new Error('Training plan not found')
  }
}

export async function getTemplates(
  args: GQLQueryGetTemplatesArgs,
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const where: Prisma.TrainingPlanWhereInput = {
    isTemplate: true,
    createdById: user.user.id,
  }

  if (typeof args.draft === 'boolean') {
    where.isDraft = args.draft
  }

  const templates = await prisma.trainingPlan.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
    take: args.limit ?? undefined,
  })
  return templates.map((template) => new TrainingPlan(template, context))
}

export async function getPublicTrainingPlans(
  args: { limit?: number | null },
  context: GQLContext,
) {
  const cacheKey = `public-training-plans:${args.limit || 'all'}`
  const ttlSeconds = 5 * 60 // 5 minutes as requested

  // Try to get from cache first
  const cachedPlans = await getFromCache<
    Prisma.TrainingPlanGetPayload<{
      include: {
        createdBy: { include: { profile: true } }
        reviews: { include: { createdBy: { include: { profile: true } } } }
        weeks: {
          include: {
            days: {
              include: {
                exercises: {
                  include: {
                    base: true
                  }
                }
              }
            }
          }
        }
      }
    }>[]
  >(cacheKey)
  if (cachedPlans) {
    return cachedPlans.map((plan) => new TrainingPlan(plan, context))
  }

  // If not in cache, fetch from database
  const where: Prisma.TrainingPlanWhereInput = {
    isPublic: true,
    isTemplate: true,
    isDraft: false, // Only show published plans
  }

  const publicPlans = await prisma.trainingPlan.findMany({
    where,
    orderBy: {
      createdAt: 'desc', // Order by creation date for now
    },
    take: args.limit ?? undefined,
    include: {
      createdBy: {
        include: {
          profile: true,
        },
      },
      reviews: {
        include: {
          createdBy: {
            include: {
              profile: true,
            },
          },
        },
      },
      weeks: {
        include: {
          days: {
            include: {
              exercises: {
                include: {
                  base: {
                    include: {
                      images: true,
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

  // Cache the raw database results for 5 minutes
  await setInCache(cacheKey, publicPlans, ttlSeconds)

  return publicPlans.map((plan) => new TrainingPlan(plan, context))
}

export async function getClientTrainingPlans(
  args: GQLQueryGetClientTrainingPlansArgs,
  context: GQLContext,
) {
  const { clientId } = args
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  // Verify trainer has access to this client's data and get authorized trainer IDs
  const authorizedTrainerIds = await ensureTrainerClientAccess(
    user.user.id,
    clientId,
    {
      returnTrainerIds: true,
    },
  )

  if (authorizedTrainerIds.length === 0) {
    return []
  }

  const plans = await prisma.trainingPlan.findMany({
    where: {
      assignedToId: clientId,
      createdById: {
        in: authorizedTrainerIds,
      },
      startDate: null,
    },
  })

  return plans.map((plan) => new TrainingPlan(plan, context))
}

export async function getClientActivePlan(
  args: GQLQueryGetClientActivePlanArgs,
  context: GQLContext,
) {
  const { clientId } = args
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  // Verify trainer has access to this client's data and get authorized trainer IDs
  const authorizedTrainerIds = await ensureTrainerClientAccess(
    user.user.id,
    clientId,
    {
      returnTrainerIds: true,
    },
  )

  if (authorizedTrainerIds.length === 0) {
    return null
  }

  const plan = await prisma.trainingPlan.findFirst({
    where: {
      assignedToId: clientId,
      createdById: {
        in: authorizedTrainerIds,
      },
      startDate: { not: null },
      active: true,
    },
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

  return plan ? new TrainingPlan(plan, context) : null
}

export async function getMyPlansOverview(context: GQLContext) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }
  const [plans, quickWorkoutPlan] = await Promise.all([
    prisma.trainingPlan.findMany({
      where: {
        assignedToId: user.user.id,
        createdById: {
          not: user.user.id,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        createdBy: {
          include: {
            profile: true,
          },
        },
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
                      include: {
                        muscleGroups: true,
                      },
                    },
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
    }),

    prisma.trainingPlan.findFirst({
      where: {
        assignedToId: user.user.id,
        createdById: user.user.id,
      },
      include: {
        createdBy: {
          include: {
            profile: true,
          },
        },
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
                      include: {
                        muscleGroups: true,
                      },
                    },
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
    }),
  ])

  const activePlan = plans.find(
    (plan) => plan.assignedToId === user.user.id && plan.active,
  )

  const availablePlans = plans.filter(
    (plan) => plan.completedAt === null && plan.active === false,
  )
  const completedPlans = plans.filter(
    (plan) => plan.completedAt && !plan.active,
  )

  return {
    activePlan: activePlan ? new TrainingPlan(activePlan, context) : null,
    availablePlans: availablePlans.map(
      (plan) => new TrainingPlan(plan, context),
    ),
    completedPlans: completedPlans.map(
      (plan) => new TrainingPlan(plan, context),
    ),
    quickWorkoutPlan: quickWorkoutPlan
      ? new TrainingPlan(quickWorkoutPlan, context)
      : null,
  }
}

// Optimized version for when only basic plan info is needed (like getting active plan ID)
export async function getMyPlansOverviewLite(context: GQLContext) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  // Only fetch basic plan data without nested relations
  const [plans, quickWorkoutPlan] = await Promise.all([
    prisma.trainingPlan.findMany({
      where: {
        assignedToId: user.user.id,
        createdById: {
          not: user.user.id,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        createdBy: {
          include: {
            profile: true,
          },
        },
        // Only include basic stats, no nested data
        _count: {
          select: {
            weeks: true,
          },
        },
      },
    }),

    prisma.trainingPlan.findFirst({
      where: {
        assignedToId: user.user.id,
        createdById: user.user.id,
      },
      include: {
        createdBy: {
          include: {
            profile: true,
          },
        },
        _count: {
          select: {
            weeks: true,
          },
        },
      },
    }),
  ])

  const activePlan = plans.find(
    (plan) => plan.assignedToId === user.user.id && plan.active,
  )

  const availablePlans = plans.filter(
    (plan) => plan.completedAt === null && plan.active === false,
  )
  const completedPlans = plans.filter(
    (plan) => plan.completedAt && !plan.active,
  )

  return {
    activePlan: activePlan ? new TrainingPlan(activePlan, context) : null,
    availablePlans: availablePlans.map(
      (plan) => new TrainingPlan(plan, context),
    ),
    completedPlans: completedPlans.map(
      (plan) => new TrainingPlan(plan, context),
    ),
    quickWorkoutPlan: quickWorkoutPlan
      ? new TrainingPlan(quickWorkoutPlan, context)
      : null,
  }
}

// Optimized version for when full nested data is needed
export async function getMyPlansOverviewFull(context: GQLContext) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const [plans, quickWorkoutPlan] = await Promise.all([
    prisma.trainingPlan.findMany({
      where: {
        assignedToId: user.user.id,
        createdById: {
          not: user.user.id,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        createdBy: {
          include: {
            profile: true,
          },
        },
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
                      include: {
                        muscleGroups: true,
                        images: true,
                      },
                    },
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
    }),

    prisma.trainingPlan.findFirst({
      where: {
        assignedToId: user.user.id,
        createdById: user.user.id,
      },
      include: {
        createdBy: {
          include: {
            profile: true,
          },
        },
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
                      include: {
                        muscleGroups: true,
                      },
                    },
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
    }),
  ])

  const activePlan = plans.find(
    (plan) => plan.assignedToId === user.user.id && plan.active,
  )

  const availablePlans = plans.filter(
    (plan) => plan.completedAt === null && plan.active === false,
  )
  const completedPlans = plans.filter(
    (plan) => plan.completedAt && !plan.active,
  )

  return {
    activePlan: activePlan ? new TrainingPlan(activePlan, context) : null,
    availablePlans: availablePlans.map(
      (plan) => new TrainingPlan(plan, context),
    ),
    completedPlans: completedPlans.map(
      (plan) => new TrainingPlan(plan, context),
    ),
    quickWorkoutPlan: quickWorkoutPlan
      ? new TrainingPlan(quickWorkoutPlan, context)
      : null,
  }
}

// Lightweight resolver for getting just the active plan ID
export async function getActivePlanId(context: GQLContext) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const activePlan = await prisma.trainingPlan.findFirst({
    where: {
      assignedToId: user.user.id,
      active: true,
    },
    select: {
      id: true,
    },
  })

  return activePlan?.id || null
}

export async function createTrainingPlan(
  args: GQLMutationCreateTrainingPlanArgs,
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const { title, isPublic, isDraft, description, weeks } = args.input

  const trainingPlan = await prisma.trainingPlan.create({
    data: {
      title,
      description,
      isPublic: isPublic ?? false,
      isTemplate: true,
      isDraft: isDraft ?? false,
      difficulty: args.input.difficulty ?? undefined,
      createdById: user.user.id,
      weeks: {
        create: weeks?.map((week) => ({
          weekNumber: week.weekNumber,
          name: week.name,
          description: week.description,
          days: {
            create: week.days?.map((day) => ({
              dayOfWeek: day.dayOfWeek,
              isRestDay: day.isRestDay,
              workoutType: day.workoutType,
              exercises: {
                create: day.exercises?.map((exercise) => ({
                  name: exercise.name,
                  restSeconds: exercise.restSeconds,
                  tempo: exercise.tempo,
                  description: exercise.description,
                  instructions: exercise.instructions ?? [],
                  tips: exercise.tips ?? [],
                  difficulty: exercise.difficulty,
                  additionalInstructions: exercise.additionalInstructions,
                  type: exercise.type,
                  order: exercise.order,
                  warmupSets: exercise.warmupSets,
                  baseId: exercise.baseId,
                  sets: {
                    create: exercise.sets?.map((set) => ({
                      order: set.order,
                      minReps: set.minReps ?? null,
                      maxReps: set.maxReps ?? null,
                      weight: set.weight ?? null,
                      rpe: set.rpe ?? null,
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

  return {
    id: trainingPlan.id,
    success: true,
  }
}

export async function updateTrainingPlan(
  args: GQLMutationUpdateTrainingPlanArgs,
  context: GQLContext,
) {
  const { input } = args

  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const createdAt = await prisma.trainingPlan.findUnique({
    where: { id: input.id },
    select: { createdAt: true },
  })

  await prisma.$transaction(
    async (tx) => {
      // ## Smart week management: Update existing, create new, delete removed
      // This prevents week duplication during auto-save operations

      // First, update the training plan basic details
      await tx.trainingPlan.update({
        where: { id: input.id },
        data: {
          title: input.title ?? undefined,
          description: input.description ?? undefined,
          isPublic: input.isPublic ?? false,
          isDraft: input.isDraft ?? false,
          difficulty: input.difficulty ?? undefined,
          createdAt: createdAt?.createdAt ?? new Date(),
        },
      })

      if (input.weeks) {
        // Get existing weeks to determine what to update/create/delete
        const existingWeeks = await tx.trainingWeek.findMany({
          where: { planId: input.id },
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
        })

        const existingWeekIds = existingWeeks.map((w) => w.id)
        const inputWeekIds = input.weeks
          .map((w) => w.id)
          .filter(Boolean) as string[]

        // Delete weeks that are no longer in the input
        const weeksToDelete = existingWeekIds.filter(
          (id) => !inputWeekIds.includes(id),
        )
        if (weeksToDelete.length > 0) {
          await tx.trainingWeek.deleteMany({
            where: { id: { in: weeksToDelete } },
          })
        }

        // Process each week in the input
        for (const weekInput of input.weeks) {
          if (weekInput.id && existingWeekIds.includes(weekInput.id)) {
            // ## Update existing week
            await tx.trainingWeek.update({
              where: { id: weekInput.id },
              data: {
                weekNumber: weekInput.weekNumber,
                name: weekInput.name ?? '',
                description: weekInput.description,
              },
            })

            // Handle days for existing week
            if (weekInput.days) {
              const existingDays = await tx.trainingDay.findMany({
                where: { weekId: weekInput.id },
                include: { exercises: { include: { sets: true } } },
              })

              const existingDayIds = existingDays.map((d) => d.id)
              const inputDayIds = weekInput.days
                .map((d) => d.id)
                .filter(Boolean) as string[]

              // Delete days no longer in input
              const daysToDelete = existingDayIds.filter(
                (id) => !inputDayIds.includes(id),
              )
              if (daysToDelete.length > 0) {
                await tx.trainingDay.deleteMany({
                  where: { id: { in: daysToDelete } },
                })
              }

              // Process each day
              for (const dayInput of weekInput.days) {
                if (dayInput.id && existingDayIds.includes(dayInput.id)) {
                  // Update existing day
                  await tx.trainingDay.update({
                    where: { id: dayInput.id },
                    data: {
                      dayOfWeek: dayInput.dayOfWeek,
                      isRestDay: dayInput.isRestDay ?? false,
                      workoutType: dayInput.workoutType,
                    },
                  })

                  // Handle exercises (delete and recreate with bulk operations)
                  await tx.trainingExercise.deleteMany({
                    where: { dayId: dayInput.id },
                  })

                  if (dayInput.exercises && dayInput.exercises.length > 0) {
                    // Collect all exercises and sets data for bulk operations
                    const exercisesData = []
                    const setsData = []

                    for (const exerciseInput of dayInput.exercises) {
                      const newExerciseId = crypto.randomUUID()
                      exercisesData.push({
                        id: newExerciseId,
                        dayId: dayInput.id,
                        name: exerciseInput.name ?? '',
                        restSeconds: exerciseInput.restSeconds,
                        tempo: exerciseInput.tempo,
                        description: exerciseInput.description,
                        instructions: exerciseInput.instructions ?? [],
                        tips: exerciseInput.tips ?? [],
                        difficulty: exerciseInput.difficulty,
                        additionalInstructions:
                          exerciseInput.additionalInstructions,
                        type: exerciseInput.type,
                        order: exerciseInput.order,
                        warmupSets: exerciseInput.warmupSets,
                        baseId: exerciseInput.baseId,
                      })

                      if (exerciseInput.sets) {
                        for (const setInput of exerciseInput.sets) {
                          setsData.push({
                            id: crypto.randomUUID(),
                            exerciseId: newExerciseId,
                            order: setInput.order,
                            reps: setInput.reps,
                            minReps: setInput.minReps,
                            maxReps: setInput.maxReps,
                            weight: setInput.weight,
                            rpe: setInput.rpe,
                          })
                        }
                      }
                    }

                    // Execute bulk operations in parallel
                    await Promise.all([
                      exercisesData.length > 0
                        ? tx.trainingExercise.createMany({
                            data: exercisesData,
                          })
                        : Promise.resolve(),
                      setsData.length > 0
                        ? tx.exerciseSet.createMany({ data: setsData })
                        : Promise.resolve(),
                    ])
                  }
                } else {
                  // Create new day
                  const newDay = await tx.trainingDay.create({
                    data: {
                      weekId: weekInput.id,
                      dayOfWeek: dayInput.dayOfWeek,
                      isRestDay: dayInput.isRestDay ?? false,
                      workoutType: dayInput.workoutType,
                    },
                  })

                  if (dayInput.exercises && dayInput.exercises.length > 0) {
                    // Collect all exercises and sets data for bulk operations
                    const exercisesData = []
                    const setsData = []

                    for (const exerciseInput of dayInput.exercises) {
                      const newExerciseId = crypto.randomUUID()
                      exercisesData.push({
                        id: newExerciseId,
                        dayId: newDay.id,
                        name: exerciseInput.name ?? '',
                        restSeconds: exerciseInput.restSeconds,
                        tempo: exerciseInput.tempo,
                        description: exerciseInput.description,
                        instructions: exerciseInput.instructions ?? [],
                        tips: exerciseInput.tips ?? [],
                        difficulty: exerciseInput.difficulty,
                        additionalInstructions:
                          exerciseInput.additionalInstructions,
                        type: exerciseInput.type,
                        order: exerciseInput.order,
                        warmupSets: exerciseInput.warmupSets,
                        baseId: exerciseInput.baseId,
                      })

                      if (exerciseInput.sets) {
                        for (const setInput of exerciseInput.sets) {
                          setsData.push({
                            id: crypto.randomUUID(),
                            exerciseId: newExerciseId,
                            order: setInput.order,
                            reps: setInput.reps,
                            minReps: setInput.minReps,
                            maxReps: setInput.maxReps,
                            weight: setInput.weight,
                            rpe: setInput.rpe,
                          })
                        }
                      }
                    }

                    // Execute bulk operations in parallel
                    await Promise.all([
                      exercisesData.length > 0
                        ? tx.trainingExercise.createMany({
                            data: exercisesData,
                          })
                        : Promise.resolve(),
                      setsData.length > 0
                        ? tx.exerciseSet.createMany({ data: setsData })
                        : Promise.resolve(),
                    ])
                  }
                }
              }
            }
          } else {
            // ## Create new week
            const newWeek = await tx.trainingWeek.create({
              data: {
                planId: input.id,
                weekNumber: weekInput.weekNumber,
                name: weekInput.name ?? '',
                description: weekInput.description,
              },
            })

            if (weekInput.days) {
              for (const dayInput of weekInput.days) {
                const newDay = await tx.trainingDay.create({
                  data: {
                    weekId: newWeek.id,
                    dayOfWeek: dayInput.dayOfWeek,
                    isRestDay: dayInput.isRestDay ?? false,
                    workoutType: dayInput.workoutType,
                  },
                })

                if (dayInput.exercises && dayInput.exercises.length > 0) {
                  // Collect all exercises and sets data for bulk operations
                  const exercisesData = []
                  const setsData = []

                  for (const exerciseInput of dayInput.exercises) {
                    const newExerciseId = crypto.randomUUID()
                    exercisesData.push({
                      id: newExerciseId,
                      dayId: newDay.id,
                      name: exerciseInput.name ?? '',
                      restSeconds: exerciseInput.restSeconds,
                      instructions: exerciseInput.instructions ?? [],
                      tips: exerciseInput.tips ?? [],
                      difficulty: exerciseInput.difficulty,
                      description: exerciseInput.description,
                      additionalInstructions:
                        exerciseInput.additionalInstructions,
                      type: exerciseInput.type,
                      order: exerciseInput.order,
                      warmupSets: exerciseInput.warmupSets,
                      baseId: exerciseInput.baseId,
                    })

                    if (exerciseInput.sets) {
                      for (const setInput of exerciseInput.sets) {
                        setsData.push({
                          id: crypto.randomUUID(),
                          exerciseId: newExerciseId,
                          order: setInput.order,
                          reps: setInput.reps,
                          minReps: setInput.minReps,
                          maxReps: setInput.maxReps,
                          weight: setInput.weight,
                          rpe: setInput.rpe,
                        })
                      }
                    }
                  }

                  // Execute bulk operations in parallel
                  await Promise.all([
                    exercisesData.length > 0
                      ? tx.trainingExercise.createMany({ data: exercisesData })
                      : Promise.resolve(),
                    setsData.length > 0
                      ? tx.exerciseSet.createMany({ data: setsData })
                      : Promise.resolve(),
                  ])
                }
              }
            }
          }
        }
      }
    },
    { timeout: 15000, maxWait: 15000 }, // Reduced timeout due to bulk operations
  )

  return true
}

export async function duplicateTrainingPlan(
  args: GQLMutationDuplicateTrainingPlanArgs,
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const plan = await getFullPlanById(args.id)

  if (!plan) {
    throw new Error('Training plan not found')
  }

  const duplicated = await duplicatePlan({
    plan,
    asTemplate: true,
    createdById: user.user.id,
  })
  if (!duplicated) {
    throw new Error('Failed to duplicate plan')
  }
  return duplicated?.id
}

export async function deleteTrainingPlan(
  args: GQLMutationDeleteTrainingPlanArgs,
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const { id } = args

  // Check if the training plan exists
  const trainingPlan = await prisma.trainingPlan.findUnique({
    where: { id },
  })

  if (!trainingPlan) {
    throw new Error('Training plan not found')
  }

  // If we get here, we know the plan exists and user has permission
  await prisma.trainingPlan.delete({
    where: { id },
  })

  return true
}

export async function assignTrainingPlanToClient(
  args: GQLMutationAssignTrainingPlanToClientArgs,
  context: GQLContext,
) {
  const { clientId, planId, startDate } = args.input

  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const plan = await getFullPlanById(planId)

  if (!plan) {
    throw new Error('Training plan not found')
  }

  const duplicated = await duplicatePlan({
    plan,
    asTemplate: false,
    createdById: user.user.id,
  })

  if (!duplicated) {
    throw new Error('Failed to assign plan')
  }

  await prisma.trainingPlan.update({
    where: { id: duplicated.id },
    data: {
      assignedToId: clientId,
      isTemplate: false,
      templateId: planId, // Track which template this was created from
      startDate,
    },
  })

  const senderName =
    user.user.profile?.firstName &&
    user.user.profile?.lastName &&
    `${user.user.profile.firstName} ${user.user.profile.lastName}`

  await createNotification(
    {
      createdBy: user.user.id,
      userId: clientId,
      relatedItemId: duplicated.id,
      message: `New training plan "${plan.title}" has been assigned to you${senderName ? ` by ${senderName}` : ''}.`,
      type: GQLNotificationType.NewTrainingPlanAssigned,
    },
    context,
  )

  // Send push notification
  try {
    await notifyTrainingPlanAssigned(
      clientId,
      plan.title,
      senderName || undefined,
    )
  } catch (error) {
    console.error('Error sending push notification:', error)
  }

  // Auto-complete "Deliver Training Plan" task for this client
  try {
    await completeTaskByAction({
      trainerId: user.user.id,
      clientId,
      action: 'training_plan_assigned',
      relatedItemId: duplicated.id,
    })
  } catch (error) {
    console.error('Error auto-completing training plan task:', error)
  }

  return true
}

export async function removeTrainingPlanFromClient(
  args: GQLMutationRemoveTrainingPlanFromClientArgs,
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }
  const { planId, clientId } = args

  await prisma.trainingPlan.delete({
    where: {
      id: planId,
      assignedToId: clientId,
      isTemplate: false,
    },
  })

  return true
}

export async function assignTemplateToSelf(
  args: GQLMutationAssignTemplateToSelfArgs,
  context: GQLContext,
) {
  const { planId } = args
  const user = context.user

  if (!user) {
    throw new Error('User not authenticated')
  }

  const userId = user.user.id

  // Get the template plan to check if it's premium
  const template = await prisma.trainingPlan.findUnique({
    where: { id: planId },
    select: {
      id: true,
      title: true,
      premium: true,
      isTemplate: true,
      isPublic: true,
    },
  })

  if (!template) {
    throw new Error('Training plan template not found')
  }

  if (!template.isTemplate) {
    throw new Error('Plan is not a template')
  }

  // Check if template is premium and user has access
  if (template.premium) {
    const subscriptionStatus =
      await subscriptionValidator.getUserSubscriptionStatus(userId)

    if (
      !subscriptionStatus.hasPremium &&
      !subscriptionStatus.canAccessPremiumTrainingPlans
    ) {
      throw new Error(
        'Premium subscription required to access this training plan template',
      )
    }
  }

  // Check training plan limits
  const subscriptionStatus =
    await subscriptionValidator.getUserSubscriptionStatus(userId)

  if (!subscriptionStatus.hasPremium) {
    // Count current assigned training plans (non-completed, non-Quick Workout)
    const currentPlansCount = await prisma.trainingPlan.count({
      where: {
        assignedToId: userId,
        active: false,
        title: { not: 'Quick Workout' },
        completedAt: null,
      },
    })

    if (currentPlansCount >= subscriptionStatus.trainingPlanLimit) {
      throw new GraphQLError(
        `Training plan limit reached. Upgrade to Premium for unlimited plans.`,
      )
    }
  }

  // Get the full plan for duplication
  const fullPlan = await getFullPlanById(planId)

  if (!fullPlan) {
    throw new Error('Training plan template not found')
  }

  // Duplicate the plan
  const duplicated = await duplicatePlan({
    plan: fullPlan,
    asTemplate: false,
    createdById: fullPlan.createdById,
  })

  if (!duplicated) {
    throw new Error('Failed to assign template')
  }

  // Assign the plan to user without activating it
  await prisma.trainingPlan.update({
    where: { id: duplicated.id },
    data: {
      assignedToId: userId,
      isTemplate: false,
      templateId: planId,
      active: false,
    },
  })

  return duplicated.id
}

export async function activatePlan(
  args: GQLMutationActivatePlanArgs,
  context: GQLContext,
) {
  const { planId, startDate, resume } = args

  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  // Get user's week start preference from context (avoid DB call)
  const weekStartsOn = (user.user.profile?.weekStartsOn ?? 1) as 0 | 1

  const fullPlan = await getFullPlanById(planId)

  if (!fullPlan) {
    throw new Error('Training plan not found')
  }

  if (resume) {
    const resumeDate = parseUTCDate(startDate, 'UTC')
    const firstUnfinishedWeek = fullPlan.weeks.find((week) => !week.completedAt)

    if (!firstUnfinishedWeek) {
      throw new Error('No unfinished weeks found to resume')
    }

    // Calculate when Week 1 should start so that the first unfinished week starts on resumeDate
    // If first unfinished week is weekNumber 5, and we want it on resumeDate
    // Then Week 1 should start: resumeDate - (5-1) weeks = resumeDate - 4 weeks
    const firstUnfinishedWeekIndex = firstUnfinishedWeek.weekNumber - 1 // Convert to 0-based index
    const planStartDate = addWeeks(
      getWeekStartUTC(resumeDate),
      -firstUnfinishedWeekIndex,
    )

    const operations = [
      // Deactivate other plans
      prisma.trainingPlan.updateMany({
        where: {
          assignedToId: user.user.id,
          active: true,
          id: { not: planId },
        },
        data: { active: false },
      }),

      // Activate current plan with calculated startDate (aligned with Week 1)
      prisma.trainingPlan.update({
        where: { id: fullPlan.id, assignedToId: user.user.id },
        data: { active: true, startDate: planStartDate },
      }),

      // Update ALL weeks scheduling using weekIndex (0-based) like regular activation
      ...fullPlan.weeks.map((week, weekIndex) =>
        prisma.trainingWeek.updateMany({
          where: { id: week.id },
          data: {
            scheduledAt: week.completedAt
              ? week.scheduledAt // Keep completed weeks at their original schedule
              : addWeeks(planStartDate, weekIndex), // Reschedule unfinished weeks with proper 7-day spacing
          },
        }),
      ),

      // Update ALL days scheduling and translate dayOfWeek for user preference
      ...fullPlan.weeks.flatMap((week, weekIndex) =>
        week.days.map((day) => {
          const translatedDayOfWeek = translateDayOfWeekForUser(
            day.dayOfWeek,
            weekStartsOn,
          )
          return prisma.trainingDay.update({
            where: { id: day.id },
            data: {
              dayOfWeek: translatedDayOfWeek, // Update to user-preference-relative dayOfWeek
              scheduledAt: week.completedAt
                ? day.scheduledAt // Keep completed days at their original schedule
                : calculateTrainingDayScheduledDate(
                    planStartDate,
                    weekIndex,
                    translatedDayOfWeek, // Use translated dayOfWeek for scheduling
                    weekStartsOn,
                  ), // Reschedule unfinished days with proper alignment based on user preference
            },
          })
        }),
      ),
    ]

    await Promise.all(operations)

    return true
  }

  if (!fullPlan || fullPlan.assignedToId !== user.user.id) {
    throw new Error('Training plan not found or unauthorized')
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        // First deactivate all other plans for this user
        await tx.trainingPlan.updateMany({
          where: {
            assignedToId: user.user.id,
            active: true,
            id: { not: planId }, // Don't update the plan we want to activate
          },
          data: { active: false },
        })

        const duplicated = await duplicatePlan({
          plan: fullPlan,
          asTemplate: false,
        })

        if (!duplicated) {
          throw new Error('Failed to duplicate plan')
        }

        // Fetch the duplicated plan structure with all IDs for individual updates
        const duplicatedPlan = await tx.trainingPlan.findUnique({
          where: { id: duplicated.id },
          include: {
            weeks: {
              include: {
                days: {
                  orderBy: { dayOfWeek: 'asc' },
                },
              },
              orderBy: { weekNumber: 'asc' },
            },
          },
        })

        if (!duplicatedPlan) {
          throw new Error('Failed to fetch duplicated plan')
        }

        // Use the week start date as calculated by the client (already aligned with user preference)
        const baseStartDate = parseUTCDate(startDate, 'UTC')

        // Use bulk operations for much better performance
        await Promise.all([
          // Activate the plan
          tx.trainingPlan.update({
            where: { id: duplicated.id, assignedToId: user.user.id },
            data: { active: true, startDate: baseStartDate },
          }),

          // Bulk update all weeks scheduling
          ...duplicatedPlan.weeks.map((week, weekIndex) =>
            tx.trainingWeek.update({
              where: { id: week.id },
              data: { scheduledAt: addWeeks(baseStartDate, weekIndex) },
            }),
          ),

          // Individual updates for each day to avoid collisions
          ...duplicatedPlan.weeks.flatMap((week, weekIndex) =>
            week.days.map((duplicatedDay, dayIndex) => {
              // Get the corresponding original day
              const originalDay = fullPlan.weeks[weekIndex]?.days[dayIndex]
              if (!originalDay) {
                throw new Error(
                  `Original day not found for weekIndex ${weekIndex}, dayIndex ${dayIndex}`,
                )
              }

              const translatedDayOfWeek = translateDayOfWeekForUser(
                originalDay.dayOfWeek,
                weekStartsOn,
              )

              return tx.trainingDay.update({
                where: { id: duplicatedDay.id },
                data: {
                  dayOfWeek: translatedDayOfWeek,
                  scheduledAt: calculateTrainingDayScheduledDate(
                    baseStartDate,
                    weekIndex,
                    translatedDayOfWeek,
                    weekStartsOn,
                  ),
                },
              })
            }),
          ),
        ])
      },
      { timeout: 20000, maxWait: 20000 }, // Reduced due to eliminated query and bulk operations
    )
  } catch (error) {
    console.error(error)
    throw 'Failed to activate plan.'
  }
  return true
}

export async function pausePlan(
  args: GQLMutationPausePlanArgs,
  context: GQLContext,
) {
  const { planId } = args

  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  await prisma.trainingPlan.update({
    where: { id: planId, assignedToId: user.user.id },
    data: { active: false },
  })

  return true
}

export async function closePlan(
  args: GQLMutationClosePlanArgs,
  context: GQLContext,
) {
  const { planId } = args

  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  await prisma.trainingPlan.update({
    where: { id: planId, assignedToId: user.user.id },
    data: { completedAt: new Date(), active: false },
  })

  return true
}

export async function deletePlan(
  args: GQLMutationDeletePlanArgs,
  context: GQLContext,
) {
  const { planId } = args

  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  await prisma.trainingPlan.delete({
    where: { id: planId, assignedToId: user.user.id, isTemplate: false },
  })

  return true
}

export async function removeWeek(
  args: { planId: string; weekId: string },
  context: GQLContext,
) {
  const { planId, weekId } = args

  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  // Verify the plan exists and get the week to remove
  const plan = await getFullPlanById(planId)
  if (!plan) throw new GraphQLError('Training plan not found')

  const weekToRemove = plan.weeks.find((w) => w.id === weekId)
  if (!weekToRemove) throw new GraphQLError('Week not found')

  // Only allow removal of weeks marked as isExtra for safety
  if (!weekToRemove.isExtra) {
    throw new GraphQLError('Only extra weeks can be removed')
  }

  // Remove the week (this will cascade delete all related entities)
  await prisma.trainingWeek.delete({
    where: { id: weekId },
  })

  return true
}

export async function createDraftTemplate(context: GQLContext) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const trainingPlan = await prisma.trainingPlan.create({
    data: {
      title: 'Untitled Training Plan',
      description: '',
      isPublic: false,
      isTemplate: true,
      isDraft: true,
      createdById: user.user.id,
      weeks: {
        create: {
          weekNumber: 1,
          name: 'Week 1',
          description: '',
          days: {
            create: Array.from({ length: 7 }, (_, dayIndex) => ({
              dayOfWeek: dayIndex,
              isRestDay: false, // All days are not rest day initially
              workoutType: null,
              exercises: {
                create: [], // No exercises initially
              },
            })),
          },
        },
      },
    },
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
                      videoUrl: true,
                      muscleGroups: true,
                    },
                  },
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

  return new TrainingPlan(trainingPlan, context)
}

async function autoScheduleUnscheduledWeeks(
  plan: {
    startDate: Date | null
    weeks: {
      id: string
      weekNumber: number
      scheduledAt: Date | null
      days: { id: string; dayOfWeek: number; scheduledAt: Date | null }[]
    }[]
  },
  weekStartsOn: 0 | 1,
): Promise<boolean> {
  if (!plan.startDate || !plan.weeks.length) return false

  const unscheduledWeeks = plan.weeks.filter((w) => !w.scheduledAt)
  if (unscheduledWeeks.length === 0) return false

  const weekUpdates = []
  const dayUpdates = []

  for (const week of unscheduledWeeks) {
    const weekIndex = week.weekNumber - 1
    const weekScheduledAt = addWeeks(plan.startDate, weekIndex)

    weekUpdates.push(
      prisma.trainingWeek.update({
        where: { id: week.id },
        data: { scheduledAt: weekScheduledAt },
      }),
    )

    for (const day of week.days) {
      const dayScheduledAt = calculateTrainingDayScheduledDate(
        plan.startDate,
        weekIndex,
        day.dayOfWeek,
        weekStartsOn,
      )

      dayUpdates.push(
        prisma.trainingDay.update({
          where: { id: day.id },
          data: { scheduledAt: dayScheduledAt },
        }),
      )
    }
  }

  await Promise.all([...weekUpdates, ...dayUpdates])
  return true
}

export async function getWorkoutNavigation(
  args: GQLQueryGetWorkoutNavigationArgs,
  context: GQLContext,
) {
  const { trainingId } = args
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  if (!trainingId) {
    return null
  }

  const weekStartsOn = (user.user.profile?.weekStartsOn ?? 1) as 0 | 1

  // Lightweight query optimized for navigation - only fetch weeks and days without exercises/sets
  const plan = await prisma.trainingPlan.findUnique({
    where: {
      id: trainingId,
      active: true,
      assignedToId: user.user.id,
      createdById: { not: user.user.id },
    },
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
            // Only include essential day data for navigation
            select: {
              id: true,
              dayOfWeek: true,
              isRestDay: true,
              completedAt: true,
              scheduledAt: true,
              _count: {
                select: {
                  exercises: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (plan) {
    if (plan.startDate && plan.active) {
      const hasUpdates = await autoScheduleUnscheduledWeeks(plan, weekStartsOn)

      // Refetch plan if we made updates to ensure we return fresh data
      if (hasUpdates) {
        const updatedPlan = await prisma.trainingPlan.findUnique({
          where: { id: plan.id },
          include: {
            weeks: {
              orderBy: { weekNumber: 'asc' },
              include: {
                days: {
                  orderBy: { dayOfWeek: 'asc' },
                  select: {
                    id: true,
                    dayOfWeek: true,
                    isRestDay: true,
                    completedAt: true,
                    scheduledAt: true,
                    _count: { select: { exercises: true } },
                  },
                },
              },
            },
          },
        })

        if (updatedPlan) {
          return { plan: new TrainingPlan(updatedPlan, context) }
        }
      }
    }

    return {
      plan: new TrainingPlan(plan, context),
    }
  }

  // Fallback to default user plan
  const defaultPlan = await prisma.trainingPlan.findUnique({
    where: {
      id: trainingId,
      assignedToId: user.user.id,
      createdById: user.user.id,
    },
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
            select: {
              id: true,
              dayOfWeek: true,
              isRestDay: true,
              completedAt: true,
              scheduledAt: true,
              exercises: {
                select: {
                  id: true,
                  completedAt: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!defaultPlan || defaultPlan.assignedToId !== user.user.id) {
    return null
  }

  // For self-created plans, allow access regardless of start date
  if (
    defaultPlan.assignedToId === user.user.id &&
    defaultPlan.createdById === user.user.id
  ) {
    if (defaultPlan.startDate && defaultPlan.active) {
      const hasUpdates = await autoScheduleUnscheduledWeeks(
        defaultPlan,
        weekStartsOn,
      )

      // Refetch plan if we made updates to ensure we return fresh data
      if (hasUpdates) {
        const updatedPlan = await prisma.trainingPlan.findUnique({
          where: { id: defaultPlan.id },
          include: {
            weeks: {
              orderBy: { weekNumber: 'asc' },
              include: {
                days: {
                  orderBy: { dayOfWeek: 'asc' },
                  select: {
                    id: true,
                    dayOfWeek: true,
                    isRestDay: true,
                    completedAt: true,
                    scheduledAt: true,
                    exercises: {
                      select: { id: true, completedAt: true },
                    },
                  },
                },
              },
            },
          },
        })

        if (updatedPlan) {
          return { plan: new TrainingPlan(updatedPlan, context) }
        }
      }
    }

    return {
      plan: new TrainingPlan(defaultPlan, context),
    }
  }

  return null
}

export async function getWorkoutDay(
  args: GQLQueryGetWorkoutDayArgs,
  context: GQLContext,
) {
  const { dayId } = args
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  const WORKOUT_DAY_INCLUDE = {
    week: {
      select: {
        planId: true,
        weekNumber: true,
      },
    },
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
  } satisfies Prisma.TrainingDayInclude

  // Get the target day with all data in one efficient query
  let day

  if (dayId) {
    day = await prisma.trainingDay.findUnique({
      where: { id: dayId, week: { plan: { assignedToId: user.user.id } } },
      include: WORKOUT_DAY_INCLUDE,
    })
  } else {
    // Find today's scheduled day with all data
    const todayUTC = getTodayUTC('UTC')

    day = await prisma.trainingDay.findFirst({
      where: {
        week: {
          plan: {
            assignedToId: user.user.id,
            active: true,
          },
        },
        // OR: [{ scheduledAt: todayUTC }, { completedAt: null }],
        completedAt: null,
        isRestDay: false,
      },
      orderBy: [
        // Prioritize today's training, then most recent past trainings
        { scheduledAt: 'desc' },
      ],
      include: WORKOUT_DAY_INCLUDE,
    })

    if (!day) {
      day = await prisma.trainingDay.findFirst({
        where: {
          week: {
            plan: { assignedToId: user.user.id, createdById: user.user.id },
          },
          scheduledAt: {
            gte: todayUTC,
            lt: new Date(todayUTC.getTime() + 24 * 60 * 60 * 1000),
          },
        },
        include: WORKOUT_DAY_INCLUDE,
      })
    }
  }

  if (!day) {
    throw new GraphQLError('Day not found')
  }

  // Check if user has access to this day
  const planId = day.week.planId

  // Fetch previous exercise logs for all exercises in this day
  const currentWeekNumber = day.week.weekNumber
  const currentDayOfWeek = day.dayOfWeek

  // Extract baseIds (not names) for better matching
  const exerciseBaseIds = day.exercises
    .map((ex) => ex.baseId)
    .filter((baseId) => baseId !== null)
  const exerciseIds = day.exercises.map((ex) => ex.id)

  const cacheKey = cache.keys.exercises.previousExercises(planId, day.id)

  const cached = await cache.get<
    Prisma.TrainingExerciseGetPayload<{
      select: {
        id: true
        name: true
        baseId: true
        completedAt: true
        sets: {
          include: {
            log: true
          }
        }
        day: {
          select: {
            week: {
              select: {
                weekNumber: true
              }
            }
            dayOfWeek: true
          }
        }
      }
    }>[]
  >(cacheKey)

  if (cached) {
    const previousDayLogs = await getPreviousLogsByExerciseName(cached)
    return {
      day: new TrainingDay(day, context),
      previousDayLogs,
    }
  }

  // Find all previous exercises with matching baseIds (single query)
  // First, try to find exercises within the same plan
  // LIMIT to last 50 exercises to prevent memory issues with long training history
  const allPreviousExercises = await prisma.trainingExercise.findMany({
    where: {
      baseId: { in: exerciseBaseIds },
      id: { notIn: exerciseIds },
      completedAt: { not: null },
      day: {
        OR: [
          // Previous weeks
          {
            week: {
              planId: planId,
              weekNumber: { lt: currentWeekNumber },
            },
          },
          // Same week but earlier days
          {
            week: {
              planId: planId,
              weekNumber: currentWeekNumber,
            },
            dayOfWeek: { lt: currentDayOfWeek },
          },
        ],
      },
    },
    select: {
      id: true,
      name: true,
      baseId: true,
      completedAt: true,
      sets: {
        where: {
          log: { isNot: null },
        },
        include: {
          log: true,
        },
        orderBy: {
          order: 'asc',
        },
      },
      day: {
        select: {
          week: {
            select: {
              weekNumber: true,
            },
          },
          dayOfWeek: true,
        },
      },
    },
    orderBy: [{ completedAt: 'desc' }],
    take: 100,
  })

  const seenBaseIds = new Set<string>()
  const previousExercises = allPreviousExercises.filter((exercise) => {
    if (!exercise.baseId || seenBaseIds.has(exercise.baseId)) {
      return false
    }
    if (exercise.sets.length === 0) {
      return false
    }
    if (
      exercise.sets.every(
        (set) => set.log?.reps === null && set.log?.weight === null,
      )
    ) {
      return false
    }
    seenBaseIds.add(exercise.baseId)
    return true
  })

  // Fallback: Find exercises from ANY plan for baseIds not found in current plan
  const missingBaseIds = exerciseBaseIds.filter(
    (baseId) => !seenBaseIds.has(baseId),
  )

  if (missingBaseIds.length > 0) {
    const fallbackExercises = await prisma.trainingExercise.findMany({
      where: {
        baseId: { in: missingBaseIds },
        id: { notIn: exerciseIds },
        completedAt: { not: null },
        day: {
          week: {
            plan: {
              assignedToId: context.user?.user.id,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        baseId: true,
        completedAt: true,
        sets: {
          where: {
            log: { isNot: null },
          },
          include: {
            log: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        day: {
          select: {
            week: {
              select: {
                weekNumber: true,
              },
            },
            dayOfWeek: true,
          },
        },
      },
      orderBy: [{ completedAt: 'desc' }],
      take: 50,
    })

    // Add fallback exercises that meet the criteria
    for (const exercise of fallbackExercises) {
      if (!exercise.baseId || seenBaseIds.has(exercise.baseId)) {
        continue
      }
      if (exercise.sets.length === 0) {
        continue
      }
      if (
        exercise.sets.every(
          (set) => set.log?.reps === null && set.log?.weight === null,
        )
      ) {
        continue
      }
      seenBaseIds.add(exercise.baseId)
      previousExercises.push(exercise)
    }
  }

  await cache.set(cacheKey, previousExercises)

  const previousDayLogs = await getPreviousLogsByExerciseName(previousExercises)

  return {
    day: new TrainingDay(day, context),
    previousDayLogs,
  }
}

export async function getQuickWorkoutNavigation(context: GQLContext) {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  // Find user's Quick Workout plan
  const quickWorkoutPlan = await prisma.trainingPlan.findFirst({
    where: {
      assignedToId: user.user.id,
      createdById: user.user.id,
    },
    select: { id: true },
  })

  if (!quickWorkoutPlan) {
    return null
  }

  // Ensure current week + buffer exist
  await ensureQuickWorkoutWeeks(quickWorkoutPlan.id, 4)

  // Fetch plan with navigation data (lightweight query)
  const plan = await prisma.trainingPlan.findUnique({
    where: { id: quickWorkoutPlan.id },
    include: {
      weeks: {
        orderBy: { weekNumber: 'asc' },
        include: {
          days: {
            orderBy: { dayOfWeek: 'asc' },
            select: {
              id: true,
              dayOfWeek: true,
              isRestDay: true,
              completedAt: true,
              scheduledAt: true,
              exercises: {
                select: {
                  id: true,
                  completedAt: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!plan) {
    console.warn(
      '⚠️ getQuickWorkoutNavigation: Plan not found after ensureQuickWorkoutWeeks',
    )
    return null
  }

  const result = {
    plan: new TrainingPlan(plan, context),
  }

  return result
}

export async function getQuickWorkoutDay(
  args: GQLQueryGetWorkoutDayArgs,
  context: GQLContext,
) {
  const { dayId } = args
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  // Find user's Quick Workout plan
  const quickWorkoutPlan = await prisma.trainingPlan.findFirst({
    where: {
      assignedToId: user.user.id,
      createdById: user.user.id,
    },
    select: { id: true },
  })

  if (!quickWorkoutPlan) {
    throw new GraphQLError('Quick workout not found')
  }

  // Ensure current week + buffer exist
  await ensureQuickWorkoutWeeks(quickWorkoutPlan.id, 4)

  let day

  if (dayId) {
    // Direct lookup by dayId
    day = await prisma.trainingDay.findUnique({
      where: { id: dayId },
      include: {
        week: {
          include: {
            plan: {
              select: {
                id: true,
                assignedToId: true,
                createdById: true,
                active: true,
                weeks: {
                  select: {
                    weekNumber: true,
                  },
                },
              },
            },
          },
        },
        exercises: {
          orderBy: { order: 'asc' },
          include: {
            substitutedBy: {
              include: {
                base: {
                  include: {
                    muscleGroups: true,
                  },
                },
                sets: {
                  include: { log: true },
                  orderBy: { order: 'asc' },
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
              include: { log: true },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    })
  } else {
    // Find today's day by dayOfWeek in current week
    const todayDayOfWeek = (new Date().getUTCDay() + 6) % 7
    const weekStart = getWeekStartUTC(new Date(), 'UTC', 1)

    // Find week by date range instead of exact timestamp to handle timezone differences
    const weekEnd = new Date(weekStart)
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 7)

    day = await prisma.trainingDay.findFirst({
      where: {
        week: {
          planId: quickWorkoutPlan.id,
          scheduledAt: {
            gte: weekStart,
            lt: weekEnd,
          },
        },
        dayOfWeek: todayDayOfWeek,
      },
      include: {
        week: {
          include: {
            plan: {
              select: {
                id: true,
                assignedToId: true,
                createdById: true,
                active: true,
                weeks: {
                  select: {
                    weekNumber: true,
                  },
                },
              },
            },
          },
        },
        exercises: {
          orderBy: { order: 'asc' },
          include: {
            substitutedBy: {
              include: {
                base: {
                  include: {
                    muscleGroups: true,
                  },
                },
                sets: {
                  include: { log: true },
                  orderBy: { order: 'asc' },
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
              include: { log: true },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    })
  }

  if (!day) {
    throw new GraphQLError('Day not found')
  }

  // Verify access
  const plan = day.week.plan
  if (plan.assignedToId !== user.user.id || plan.createdById !== user.user.id) {
    throw new GraphQLError('Access denied')
  }

  // Fetch previous exercise logs
  const currentWeekNumber = day.week.weekNumber
  const currentDayOfWeek = day.dayOfWeek

  const exerciseBaseIds = day.exercises
    .map((ex) => ex.baseId)
    .filter((baseId) => baseId !== null)
  const exerciseIds = day.exercises.map((ex) => ex.id)

  const cacheKey = cache.keys.exercises.previousExercises(plan.id, day.id)

  const cached = await cache.get<
    Prisma.TrainingExerciseGetPayload<{
      select: {
        id: true
        name: true
        baseId: true
        completedAt: true
        sets: {
          include: {
            log: true
          }
        }
        day: {
          select: {
            week: {
              select: {
                weekNumber: true
              }
            }
            dayOfWeek: true
          }
        }
      }
    }>[]
  >(cacheKey)

  if (cached) {
    return {
      day: new TrainingDay(day, context),
      previousDayLogs: await getPreviousLogsByExerciseName(cached),
    }
  }

  // Find all previous exercises with matching baseIds
  // LIMIT to last 50 exercises to prevent memory issues
  const allPreviousExercises = await prisma.trainingExercise.findMany({
    where: {
      baseId: { in: exerciseBaseIds },
      id: { notIn: exerciseIds },
      completedAt: { not: null },
      day: {
        OR: [
          // Previous weeks
          {
            week: {
              planId: plan.id,
              weekNumber: { lt: currentWeekNumber },
            },
          },
          // Same week, earlier days
          {
            week: {
              planId: plan.id,
              weekNumber: currentWeekNumber,
            },
            dayOfWeek: { lt: currentDayOfWeek },
          },
        ],
      },
    },
    select: {
      id: true,
      name: true,
      baseId: true,
      completedAt: true,
      sets: {
        include: {
          log: true,
        },
      },
      day: {
        select: {
          week: {
            select: {
              weekNumber: true,
            },
          },
          dayOfWeek: true,
        },
      },
    },
    orderBy: [
      { day: { week: { weekNumber: 'desc' } } },
      { day: { dayOfWeek: 'desc' } },
    ],
    take: 50,
  })

  // Group by baseId and keep only the most recent occurrence
  const seenBaseIds = new Set<string>()
  const previousExercises = allPreviousExercises.filter((exercise) => {
    if (!exercise.baseId) {
      return false
    }
    if (seenBaseIds.has(exercise.baseId)) {
      return false
    }
    if (exercise.sets.length === 0) {
      return false
    }
    if (
      exercise.sets.every(
        (set) => set.log?.reps === null && set.log?.weight === null,
      )
    ) {
      return false
    }
    seenBaseIds.add(exercise.baseId)
    return true
  })

  await cache.set(cacheKey, previousExercises)
  const previousLogsByExerciseName =
    await getPreviousLogsByExerciseName(previousExercises)

  return {
    day: new TrainingDay(day, context),
    previousDayLogs: previousLogsByExerciseName,
  }
}

const getPreviousLogsByExerciseName = async (
  previousExercises: Prisma.TrainingExerciseGetPayload<{
    select: {
      id: true
      name: true
      baseId: true
      completedAt: true
      sets: {
        include: {
          log: true
        }
      }
    }
  }>[],
) => {
  const previousLogsByExerciseName = previousExercises
    .filter((exercise) => exercise !== null)
    .map((exercise) => ({
      id: exercise.id,
      exerciseName: exercise.name,
      baseId: exercise.baseId,
      completedAt: exercise.completedAt
        ? new Date(exercise.completedAt).toISOString()
        : null,
      sets: exercise.sets.map((set) => new ExerciseSet(set)),
    }))

  return previousLogsByExerciseName
}

export async function getPlanSummary(
  args: { planId: string },
  context: GQLContext,
) {
  const { planId } = args
  if (!context.user) {
    throw new Error('Unauthorized')
  }

  // Get the training plan with all weeks, days, exercises, and sets
  const plan = await prisma.trainingPlan.findUnique({
    where: { id: planId, assignedToId: context.user.user.id },
    include: {
      weeks: {
        include: {
          days: {
            include: {
              exercises: {
                include: {
                  sets: {
                    where: { completedAt: { not: null } },
                    include: { log: true },
                    orderBy: { completedAt: 'asc' },
                  },
                  base: {
                    select: { id: true, name: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { weekNumber: 'asc' },
      },
    },
  })

  if (!plan) {
    throw new Error('Training plan not found')
  }

  // Calculate journey overview
  const duration = {
    weeks: plan.weeks.length,
    startDate: plan.startDate?.toISOString() || plan.createdAt.toISOString(),
    endDate:
      plan.endDate?.toISOString() || plan.completedAt?.toISOString() || null,
  }

  // Calculate adherence from weeks/days data
  const allDays = plan.weeks
    .flatMap((week) => week.days)
    .filter(
      (day) => !day.isRestDay && day.exercises && day.exercises.length > 0,
    )
  const completedDays = allDays.filter((day) => day.completedAt)
  const adherence =
    allDays.length > 0
      ? Math.round((completedDays.length / allDays.length) * 100)
      : 0

  // Calculate completed workouts
  const workoutsCompleted = plan.weeks.reduce(
    (acc, week) =>
      acc + (week.days?.filter((day) => day.completedAt).length ?? 0),
    0,
  )

  // Calculate total workouts
  const totalWorkouts =
    plan.weeks?.reduce(
      (acc, week) =>
        acc +
        (week.days?.filter((day) => !day.isRestDay && day.exercises?.length)
          ?.length ?? 0),
      0,
    ) ?? 0

  // Calculate strength progressions
  const exerciseProgressions = calculateStrengthProgressionsForPlan(plan)

  // Get top 5 exercises by improvement
  const strengthProgress = exerciseProgressions
    .sort((a, b) => b.improvementPercentage - a.improvementPercentage)
    .slice(0, 5)

  // Calculate body composition changes
  const bodyComposition = await calculateBodyCompositionForPlan(
    context.user.user.id,
    plan.startDate || plan.createdAt,
    plan.endDate || plan.completedAt || new Date(),
  )

  // Get personal records achieved during this plan
  const personalRecords = await getPersonalRecordsForPlan(
    context.user.user.id,
    plan,
  )

  // Calculate total volume lifted
  const totalVolumeLifted = calculateTotalVolumeForPlan(plan)

  // Count total PRs
  const totalPRsAchieved = personalRecords.length

  return {
    duration,
    adherence,
    workoutsCompleted,
    totalWorkouts,
    strengthProgress,
    bodyComposition,
    personalRecords,
    totalVolumeLifted,
    totalPRsAchieved,
  }
}

type PlanWithProgressionData = Prisma.TrainingPlanGetPayload<{
  include: {
    weeks: {
      include: {
        days: {
          include: {
            exercises: {
              include: {
                sets: {
                  include: { log: true }
                }
                base: {
                  select: { id: true; name: true }
                }
              }
            }
          }
        }
      }
    }
  }
}>

/**
 * Calculate strength progressions for all exercises in the plan
 * Compares earliest logged performance vs latest logged performance
 */
function calculateStrengthProgressionsForPlan(plan: PlanWithProgressionData) {
  const exerciseMap = new Map<
    string,
    {
      name: string
      baseId: string | null
      performances: {
        weight: number
        reps: number
        date: Date
      }[]
    }
  >()

  // Collect all performances for each exercise
  for (const week of plan.weeks) {
    for (const day of week.days) {
      for (const exercise of day.exercises) {
        const key = exercise.baseId || exercise.name

        if (!exerciseMap.has(key)) {
          exerciseMap.set(key, {
            name: exercise.name,
            baseId: exercise.baseId,
            performances: [],
          })
        }

        const exerciseData = exerciseMap.get(key)!

        // Get completed sets with logs
        for (const set of exercise.sets) {
          if (set.log && set.log.weight && set.log.reps && set.completedAt) {
            exerciseData.performances.push({
              weight: set.log.weight,
              reps: set.log.reps,
              date: set.completedAt,
            })
          }
        }
      }
    }
  }

  // Calculate progressions
  const progressions = []

  for (const [_, data] of exerciseMap.entries()) {
    if (data.performances.length < 2) continue // Need at least 2 performances

    // Sort by date
    data.performances.sort((a, b) => a.date.getTime() - b.date.getTime())

    // Get best performance from first few sessions (up to first 3 sessions)
    const firstSessions = data.performances.slice(
      0,
      Math.min(3, data.performances.length),
    )
    const bestFirstPerf = firstSessions.reduce((best, current) => {
      const currentRM = calculateEstimated1RM(current.weight, current.reps)
      const bestRM = calculateEstimated1RM(best.weight, best.reps)
      return currentRM > bestRM ? current : best
    })

    // Get best performance from last few sessions (up to last 3 sessions)
    const lastSessions = data.performances.slice(
      -Math.min(3, data.performances.length),
    )
    const bestLastPerf = lastSessions.reduce((best, current) => {
      const currentRM = calculateEstimated1RM(current.weight, current.reps)
      const bestRM = calculateEstimated1RM(best.weight, best.reps)
      return currentRM > bestRM ? current : best
    })

    const first1RM = calculateEstimated1RM(
      bestFirstPerf.weight,
      bestFirstPerf.reps,
    )
    const last1RM = calculateEstimated1RM(
      bestLastPerf.weight,
      bestLastPerf.reps,
    )

    // Calculate improvement percentage
    const improvementPercentage =
      first1RM > 0 ? ((last1RM - first1RM) / first1RM) * 100 : 0

    progressions.push({
      exerciseName: data.name,
      baseExerciseId: data.baseId,
      firstPerformance: {
        weight: bestFirstPerf.weight,
        reps: bestFirstPerf.reps,
        estimated1RM: first1RM,
        date: bestFirstPerf.date.toISOString(),
      },
      lastPerformance: {
        weight: bestLastPerf.weight,
        reps: bestLastPerf.reps,
        estimated1RM: last1RM,
        date: bestLastPerf.date.toISOString(),
      },
      allPerformances: data.performances.map((perf) => ({
        weight: perf.weight,
        reps: perf.reps,
        estimated1RM: calculateEstimated1RM(perf.weight, perf.reps),
        date: perf.date.toISOString(),
      })),
      improvementPercentage: Math.round(improvementPercentage * 10) / 10,
      totalSessions: data.performances.length,
    })
  }

  return progressions
}

/**
 * Calculate body composition changes during the plan
 */
async function calculateBodyCompositionForPlan(
  userId: string,
  startDate: Date,
  endDate: Date,
) {
  // Get user profile
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { id: true, weightUnit: true },
  })

  if (!profile) {
    return null
  }

  // Fetch body progress logs (snapshots) during the plan period
  const bodyProgressLogs = await prisma.bodyProgressLog.findMany({
    where: {
      userProfileId: profile.id,
      loggedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      loggedAt: 'asc',
    },
    select: {
      id: true,
      loggedAt: true,
      image1Url: true,
      image2Url: true,
      image3Url: true,
    },
  })

  // Get body measurements for weight tracking
  const bodyMeasurements = await prisma.userBodyMeasure.findMany({
    where: {
      userProfileId: profile.id,
      measuredAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      measuredAt: 'asc',
    },
    select: {
      weight: true,
      measuredAt: true,
    },
  })

  if (bodyMeasurements.length < 2) {
    // Need at least 2 weight measurements to show change
    return null
  }

  const firstMeasurement = bodyMeasurements[0]
  const lastMeasurement = bodyMeasurements[bodyMeasurements.length - 1]

  const startWeight = firstMeasurement?.weight
  const endWeight = lastMeasurement?.weight

  if (!startWeight || !endWeight) {
    return null
  }

  const weightChange = endWeight - startWeight

  // Find snapshots closest to first and last measurements
  const firstSnapshot = bodyProgressLogs.length > 0 ? bodyProgressLogs[0] : null
  const lastSnapshot =
    bodyProgressLogs.length > 0
      ? bodyProgressLogs[bodyProgressLogs.length - 1]
      : null

  // Helper to find closest weight to a snapshot date
  const findClosestWeight = (date: Date) => {
    if (bodyMeasurements.length === 0) return null

    let closestMeasurement = bodyMeasurements[0]
    let closestDiff = Math.abs(
      new Date(date).getTime() -
        new Date(closestMeasurement.measuredAt).getTime(),
    )

    for (const measurement of bodyMeasurements) {
      const diff = Math.abs(
        new Date(date).getTime() - new Date(measurement.measuredAt).getTime(),
      )
      if (diff < closestDiff) {
        closestDiff = diff
        closestMeasurement = measurement
      }
    }

    return closestMeasurement.weight
  }

  return {
    startWeight,
    endWeight,
    weightChange,
    unit: profile.weightUnit || 'kg',
    progressLogs: bodyMeasurements
      .filter((m) => m.weight != null)
      .map((m) => ({
        measuredAt: m.measuredAt.toISOString(),
        weight: m.weight as number,
      })),
    startSnapshot: firstSnapshot
      ? {
          loggedAt: firstSnapshot.loggedAt.toISOString(),
          weight: findClosestWeight(firstSnapshot.loggedAt),
          image1Url: firstSnapshot.image1Url,
          image2Url: firstSnapshot.image2Url,
          image3Url: firstSnapshot.image3Url,
        }
      : null,
    endSnapshot: lastSnapshot
      ? {
          loggedAt: lastSnapshot.loggedAt.toISOString(),
          weight: findClosestWeight(lastSnapshot.loggedAt),
          image1Url: lastSnapshot.image1Url,
          image2Url: lastSnapshot.image2Url,
          image3Url: lastSnapshot.image3Url,
        }
      : null,
  }
}

type PersonalRecordWithDetails = Prisma.PersonalRecordGetPayload<{
  include: {
    baseExercise: {
      select: { name: true }
    }
    day: {
      include: {
        week: {
          select: { weekNumber: true }
        }
      }
    }
  }
}>

/**
 * Get personal records achieved during this plan
 */
async function getPersonalRecordsForPlan(
  userId: string,
  plan: PlanWithProgressionData,
) {
  const startDate = plan.startDate || plan.createdAt
  const endDate = plan.endDate || plan.completedAt || new Date()

  // Get all PRs for this user within the plan timeframe
  const prs = await prisma.personalRecord.findMany({
    where: {
      userId,
      achievedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      baseExercise: {
        select: { name: true },
      },
      day: {
        include: {
          week: {
            select: { weekNumber: true },
          },
        },
      },
    },
    orderBy: {
      estimated1RM: 'desc',
    },
  })

  // Group by exercise and get the best PR per exercise
  const bestPRsMap = new Map<string, PersonalRecordWithDetails>()

  for (const pr of prs) {
    const key = pr.baseExerciseId
    const existing = bestPRsMap.get(key)
    if (!existing || pr.estimated1RM > existing.estimated1RM) {
      bestPRsMap.set(key, pr)
    }
  }

  // Convert to array and format
  const personalRecords = Array.from(bestPRsMap.values()).map((pr) => ({
    exerciseName: pr.baseExercise.name,
    baseExerciseId: pr.baseExerciseId,
    bestEstimated1RM: pr.estimated1RM,
    weight: pr.weight,
    reps: pr.reps,
    achievedDate: pr.achievedAt.toISOString(),
    weekNumber: pr.day?.week?.weekNumber || null,
  }))

  // Sort by improvement (estimated 1RM)
  return personalRecords.sort((a, b) => b.bestEstimated1RM - a.bestEstimated1RM)
}

/**
 * Calculate total volume lifted during the plan
 */
function calculateTotalVolumeForPlan(plan: PlanWithProgressionData) {
  let totalVolume = 0

  for (const week of plan.weeks) {
    for (const day of week.days) {
      for (const exercise of day.exercises) {
        for (const set of exercise.sets) {
          if (set.log && set.log.weight && set.log.reps) {
            totalVolume += set.log.weight * set.log.reps
          }
        }
      }
    }
  }

  return Math.round(totalVolume * 10) / 10
}
