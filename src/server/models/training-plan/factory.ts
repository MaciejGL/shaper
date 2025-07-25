import { prisma } from '@lib/db'
import { Prisma } from '@prisma/client'
import * as crypto from 'crypto'
import { addDays, addWeeks, differenceInCalendarDays } from 'date-fns'
import { GraphQLError } from 'graphql'

import {
  GQLMutationActivatePlanArgs,
  GQLMutationClosePlanArgs,
  GQLMutationDeletePlanArgs,
  GQLMutationExtendPlanArgs,
  GQLMutationPausePlanArgs,
  GQLQueryGetClientActivePlanArgs,
  GQLQueryGetWorkoutArgs,
} from '@/generated/graphql-client'
import {
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
} from '@/generated/graphql-server'
import {
  CollaborationAction,
  checkTrainingPlanPermission,
} from '@/lib/permissions/collaboration-permissions'
import { getWeekStartUTC } from '@/lib/server-date-utils'
import { GQLContext } from '@/types/gql-context'

import { createNotification } from '../notification/factory'
import { duplicatePlan, getFullPlanById } from '../training-utils.server'

import TrainingPlan from './model'

export async function getTrainingPlanById(
  args: GQLQueryGetTrainingPlanByIdArgs,
  context: GQLContext,
) {
  const { id } = args
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  // Check collaboration permissions
  await checkTrainingPlanPermission(
    context,
    user.user.id,
    id,
    CollaborationAction.VIEW,
    'view training plan',
  )

  try {
    const trainingPlan = await prisma.trainingPlan.findUnique({
      where: { id },
      include: {
        createdBy: {
          include: {
            profile: true,
          },
        },
        collaborators: {
          include: {
            collaborator: {
              include: {
                profile: true,
              },
            },
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

    if (
      trainingPlan.isTemplate &&
      !trainingPlan.assignedToId &&
      trainingPlan.createdById !== user.user.id
    ) {
      const scopedTrainingPlan = {
        ...trainingPlan,
        weeks: trainingPlan.weeks.map((week, weekIndex) => ({
          ...week,
          days: weekIndex === 0 ? week.days.map((day) => day) : undefined,
        })),
      } as typeof trainingPlan
      return new TrainingPlan(scopedTrainingPlan, context)
    }

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

export async function getCollaborationTemplates(
  args: GQLQueryGetTemplatesArgs,
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const where: Prisma.TrainingPlanWhereInput = {
    isTemplate: true,
    createdById: { not: user.user.id }, // Not created by current user
    collaborators: {
      some: {
        collaboratorId: user.user.id, // Current user is a collaborator
      },
    },
  }

  if (typeof args.draft === 'boolean') {
    where.isDraft = args.draft
  }

  const templates = await prisma.trainingPlan.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      createdBy: {
        include: {
          profile: true,
        },
      },
      collaborators: {
        include: {
          collaborator: {
            include: {
              profile: true,
            },
          },
        },
      },
    },
  })
  return templates.map((template) => new TrainingPlan(template, context))
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
  const plans = await prisma.trainingPlan.findMany({
    where: {
      assignedToId: clientId,
      createdById: user.user.id,
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
  const plan = await prisma.trainingPlan.findFirst({
    where: {
      assignedToId: clientId,
      createdById: user.user.id,
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
  const completedPlans = plans.filter((plan) => plan.completedAt !== null)

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
  const completedPlans = plans.filter((plan) => plan.completedAt !== null)

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
  const completedPlans = plans.filter((plan) => plan.completedAt !== null)

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

export async function getWorkout(
  args: GQLQueryGetWorkoutArgs,
  context: GQLContext,
) {
  const { trainingId } = args
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }
  let id = trainingId
  if (!id) {
    const plan = await prisma.trainingPlan.findFirst({
      where: { assignedToId: user.user.id, active: true },
    })
    id = plan?.id
  }
  if (!id) {
    return null
  }

  const plan = await getFullPlanById(id)

  if (!plan || plan.assignedToId !== user.user.id) {
    return null
  }

  if (plan.assignedToId === user.user.id && plan.createdById === user.user.id) {
    return {
      plan: new TrainingPlan(plan, context),
    }
  }

  if (!plan.startDate) {
    return null
  }

  return {
    plan: new TrainingPlan(plan, context),
  }
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
                  instructions: exercise.instructions,
                  additionalInstructions: exercise.additionalInstructions,
                  type: exercise.type,
                  order: exercise.order,
                  warmupSets: exercise.warmupSets,
                  baseId: exercise.baseId ?? undefined,
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

  // Check collaboration permissions
  await checkTrainingPlanPermission(
    context,
    user.user.id,
    input.id,
    CollaborationAction.EDIT,
    'update training plan',
  )

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
                        instructions: exerciseInput.instructions,
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
                        instructions: exerciseInput.instructions,
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
                      tempo: exerciseInput.tempo,
                      instructions: exerciseInput.instructions,
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

  // Check collaboration permissions - only ADMIN level users can duplicate plans
  await checkTrainingPlanPermission(
    context,
    user.user.id,
    args.id,
    CollaborationAction.MANAGE_COLLABORATORS,
    'duplicate training plan',
  )

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

  // Check collaboration permissions - only creators can delete plans
  await checkTrainingPlanPermission(
    context,
    user.user.id,
    id,
    CollaborationAction.DELETE,
    'delete training plan',
  )

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

  // Check collaboration permissions
  await checkTrainingPlanPermission(
    context,
    user.user.id,
    planId,
    CollaborationAction.SHARE,
    'assign training plan to client',
  )

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

  // Check collaboration permissions
  await checkTrainingPlanPermission(
    context,
    user.user.id,
    planId,
    CollaborationAction.DELETE,
    'remove training plan from client',
  )

  await prisma.trainingPlan.delete({
    where: {
      id: planId,
      assignedToId: clientId,
      isTemplate: false,
    },
  })

  return true
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

  const fullPlan = await getFullPlanById(planId)

  if (!fullPlan) {
    throw new Error('Training plan not found')
  }

  if (resume) {
    const resumeDate = new Date(startDate)
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

      // Update ALL days scheduling using weekIndex (0-based) like regular activation
      ...fullPlan.weeks.flatMap((week, weekIndex) =>
        week.days.map((day) =>
          prisma.trainingDay.updateMany({
            where: { id: day.id },
            data: {
              scheduledAt: week.completedAt
                ? day.scheduledAt // Keep completed days at their original schedule
                : addDays(
                    getWeekStartUTC(addWeeks(planStartDate, weekIndex)),
                    day.dayOfWeek,
                  ), // Reschedule unfinished days with proper alignment
            },
          }),
        ),
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

        // Optimize: Calculate scheduling from original plan instead of fetching duplicated plan
        const baseStartDate = new Date(startDate)

        // Use bulk operations for much better performance
        await Promise.all([
          // Activate the plan
          tx.trainingPlan.update({
            where: { id: duplicated.id, assignedToId: user.user.id },
            data: { active: true, startDate: baseStartDate },
          }),

          // Bulk update all weeks scheduling
          ...fullPlan.weeks.map((week, weekIndex) =>
            tx.trainingWeek.updateMany({
              where: {
                planId: duplicated.id,
                weekNumber: week.weekNumber,
              },
              data: { scheduledAt: addWeeks(baseStartDate, weekIndex) },
            }),
          ),

          // Bulk update all days scheduling
          ...fullPlan.weeks.flatMap((week, weekIndex) =>
            week.days.map((day) =>
              tx.trainingDay.updateMany({
                where: {
                  week: {
                    planId: duplicated.id,
                    weekNumber: week.weekNumber,
                  },
                  dayOfWeek: day.dayOfWeek,
                },
                data: {
                  scheduledAt: addDays(
                    addWeeks(baseStartDate, weekIndex),
                    day.dayOfWeek,
                  ),
                },
              }),
            ),
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

export async function extendPlan(args: GQLMutationExtendPlanArgs) {
  const { planId, weeks } = args

  const plan = await getFullPlanById(planId)
  if (!plan) throw new GraphQLError('Training plan not found')

  const toClone = plan.weeks
    .filter((w) => weeks.includes(w.id))
    .sort((a, b) => a.weekNumber - b.weekNumber)

  if (toClone.length === 0) throw new GraphQLError('No weeks to extend')

  const maxWeekNumber = Math.max(...plan.weeks.map((w) => w.weekNumber))
  let nextWeekNumber = maxWeekNumber + 1
  let nextWeekStart = plan.weeks
    .sort((a, b) => a.weekNumber - b.weekNumber)
    .at(-1)?.scheduledAt

  // Prepare bulk data for all entities across all weeks
  const weeksData = []
  const daysData = []
  const exercisesData = []
  const setsData = []

  // Build up all the data for bulk operations
  for (const week of toClone) {
    nextWeekStart = nextWeekStart ? addWeeks(nextWeekStart, 1) : null
    const newWeekId = crypto.randomUUID()

    weeksData.push({
      id: newWeekId,
      planId,
      name: week.name,
      description: week.description,
      weekNumber: nextWeekNumber++,
      scheduledAt: nextWeekStart,
      completedAt: null,
      isExtra: true,
    })

    for (const day of week.days) {
      const offset =
        week.scheduledAt && day.scheduledAt
          ? differenceInCalendarDays(day.scheduledAt, week.scheduledAt)
          : null

      const scheduledAt =
        offset != null && nextWeekStart ? addDays(nextWeekStart, offset) : null

      const newDayId = crypto.randomUUID()
      daysData.push({
        id: newDayId,
        weekId: newWeekId,
        dayOfWeek: day.dayOfWeek,
        workoutType: day.workoutType,
        isRestDay: day.isRestDay,
        scheduledAt,
        completedAt: null,
        isExtra: true,
      })

      for (const ex of day.exercises) {
        const newExerciseId = crypto.randomUUID()
        exercisesData.push({
          id: newExerciseId,
          dayId: newDayId,
          name: ex.name,
          baseId: ex.baseId,
          restSeconds: ex.restSeconds,
          order: ex.order,
          isExtra: true,
          additionalInstructions: ex.additionalInstructions,
          completedAt: null,
          instructions: ex.instructions,
          tempo: ex.tempo,
          type: ex.type,
          warmupSets: ex.warmupSets,
        })

        for (const set of ex.sets) {
          setsData.push({
            id: crypto.randomUUID(),
            exerciseId: newExerciseId,
            reps: set.reps,
            weight: set.weight,
            rpe: set.rpe,
            order: set.order,
            isExtra: true,
            maxReps: set.maxReps,
            minReps: set.minReps,
            completedAt: null,
          })
        }
      }
    }
  }

  // Execute bulk operations in parallel for maximum performance
  await Promise.all([
    weeksData.length > 0
      ? prisma.trainingWeek.createMany({ data: weeksData })
      : Promise.resolve(),
    daysData.length > 0
      ? prisma.trainingDay.createMany({ data: daysData })
      : Promise.resolve(),
    exercisesData.length > 0
      ? prisma.trainingExercise.createMany({ data: exercisesData })
      : Promise.resolve(),
    setsData.length > 0
      ? prisma.exerciseSet.createMany({ data: setsData })
      : Promise.resolve(),
  ])

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

  // Check collaboration permissions - only ADMIN level users can remove weeks
  await checkTrainingPlanPermission(
    context,
    user.user.id,
    planId,
    CollaborationAction.EDIT,
    'remove week',
  )

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

export async function getCurrentWorkoutWeek(context: GQLContext) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const plan = await prisma.trainingPlan.findFirst({
    where: { assignedToId: user.user.id, active: true },
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
                    orderBy: {
                      order: 'asc',
                    },
                  },
                  base: {
                    include: {
                      muscleGroups: true,
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

  if (!plan) {
    return null
  }

  const today = new Date()
  const planStartDate = plan.startDate ? new Date(plan.startDate) : today
  const daysSinceStart = Math.floor(
    (today.getTime() - planStartDate.getTime()) / (1000 * 60 * 60 * 24),
  )
  const currentWeekIndex = Math.floor(daysSinceStart / 7)

  // Instead of manipulating the structure, just return the plan with limited weeks
  const limitedWeeks = plan.weeks.slice(
    Math.max(0, currentWeekIndex - 4),
    currentWeekIndex + 1,
  )

  const limitedPlan = {
    ...plan,
    weeks: limitedWeeks,
  }

  return {
    plan: new TrainingPlan(limitedPlan, context),
    currentWeekIndex,
    totalWeeks: plan.weeks.length,
  }
}
