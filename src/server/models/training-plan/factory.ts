import { prisma } from '@lib/db'
import { Prisma } from '@prisma/client'
import { getDay, getWeek, isAfter } from 'date-fns'
import { enGB } from 'date-fns/locale'

import {
  GQLMutationActivatePlanArgs,
  GQLMutationClosePlanArgs,
  GQLMutationDeletePlanArgs,
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
  const trainingPlan = await prisma.trainingPlan.findUnique({
    where: {
      id,
      OR: [{ createdById: user.user.id }, { assignedToId: user.user.id }],
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
  return new TrainingPlan(trainingPlan, context)
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
  const plans = await prisma.trainingPlan.findMany({
    where: { assignedToId: user.user.id },
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
  }
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
  const currentDate = new Date()
  if (!plan.startDate) {
    return null
  }

  if (!isAfter(currentDate, plan.startDate)) {
    return {
      navigation: {
        currentWeekIndex: 0,
        currentDayIndex: 0,
        firstUncompletedWeekIndex: 0,
        firstUncompletedDayIndex: 0,
      },
      plan: new TrainingPlan(plan, context),
    }
  }

  const weekOfYear = getWeek(currentDate, { weekStartsOn: 1, locale: enGB })
  const planStartDate = new Date(plan.startDate)
  const planWeekOfYear = getWeek(planStartDate, {
    weekStartsOn: 1,
    locale: enGB,
  })

  const currentWeekIndex = weekOfYear - planWeekOfYear
  const currentDayIndex =
    getDay(currentDate) === 0 ? 6 : getDay(currentDate) - 1

  const firstUncompletedWeekIndex = plan.weeks.findIndex(
    (week) => week.completedAt === null,
  )
  const firstUncompletedDayIndex = plan.weeks[
    firstUncompletedWeekIndex
  ].days.findIndex((day) => day.completedAt === null && day.isRestDay === false)

  const navigation = {
    currentWeekIndex,
    currentDayIndex,
    firstUncompletedWeekIndex,
    firstUncompletedDayIndex,
  }

  return {
    navigation,
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
  await prisma.$transaction(
    async (tx) => {
      await tx.trainingWeek.deleteMany({
        where: { planId: input.id },
      })

      await tx.trainingPlan.update({
        where: { id: input.id, createdById: user.user.id },
        data: {
          title: input.title ?? undefined,
          description: input.description ?? undefined,
          isPublic: input.isPublic ?? false,
          isDraft: input.isDraft ?? false,
          isTemplate: true,
          weeks: {
            create: input.weeks?.map((week) => ({
              weekNumber: week.weekNumber,
              name: week.name ?? '', // fallback if needed
              description: week.description ?? undefined,
              days: {
                create: week.days?.map((day) => ({
                  dayOfWeek: day.dayOfWeek,
                  isRestDay: day.isRestDay ?? false,
                  workoutType: day.workoutType ?? undefined,
                  exercises: {
                    create: day.exercises?.map((exercise) => ({
                      name: exercise.name ?? '',
                      restSeconds: exercise.restSeconds ?? undefined,
                      tempo: exercise.tempo ?? undefined,
                      instructions: exercise.instructions ?? undefined,
                      order: exercise.order,
                      warmupSets: exercise.warmupSets ?? undefined,
                      baseId: exercise.baseId ?? undefined,
                      sets: {
                        create: exercise.sets?.map((set) => ({
                          order: set.order,
                          reps: set.reps ?? null,
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
    },
    { timeout: 15000 },
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

  if (!plan || plan.createdById !== user.user.id) {
    throw new Error('Training plan not found or unauthorized')
  }

  const duplicated = await duplicatePlan({ plan, asTemplate: true })
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

  // First check if the training plan exists and user has permission
  const trainingPlan = await prisma.trainingPlan.findUnique({
    where: { id, createdById: user.user.id },
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

  if (!plan || plan.createdById !== user?.user.id) {
    throw new Error('Training plan not found or unauthorized')
  }

  const duplicated = await duplicatePlan({ plan, asTemplate: false })

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

  await prisma.trainingPlan.delete({
    where: {
      id: planId,
      assignedToId: clientId,
      isTemplate: false,
      createdById: user.user.id,
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

  const fullPlan = resume ? null : await getFullPlanById(planId)

  if (resume) {
    await prisma.trainingPlan.update({
      where: { id: planId, assignedToId: user.user.id },
      data: { active: true },
    })

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

        // Then activate the new plan
        await tx.trainingPlan.update({
          where: {
            id: duplicated.id,
            assignedToId: user.user.id, // Ensure the plan belongs to the user
          },
          data: { active: true, startDate },
        })
      },
      { timeout: 15000, maxWait: 15000 },
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
