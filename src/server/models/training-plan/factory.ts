import { prisma } from '@lib/db'
import { Prisma } from '@prisma/client'

import {
  GQLMutationActivatePlanArgs,
  GQLMutationClosePlanArgs,
  GQLMutationDeletePlanArgs,
  GQLMutationPausePlanArgs,
  GQLQueryGetClientActivePlanArgs,
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
import { getCurrentUser, getCurrentUserOrThrow } from '@/lib/getUser'

import { createNotification } from '../notification/factory'
import { duplicatePlan, getFullPlanById } from '../training-utils.server'

import TrainingPlan from './model'

export async function getTrainingPlanById(
  args: GQLQueryGetTrainingPlanByIdArgs,
) {
  const { id } = args
  const user = await getCurrentUserOrThrow()
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
  return new TrainingPlan(trainingPlan)
}

export async function getTemplates(args: GQLQueryGetTemplatesArgs) {
  const user = await getCurrentUserOrThrow()

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
  return templates.map((template) => new TrainingPlan(template))
}

export async function getClientTrainingPlans(
  args: GQLQueryGetClientTrainingPlansArgs,
) {
  const { clientId } = args
  const user = await getCurrentUserOrThrow()
  const plans = await prisma.trainingPlan.findMany({
    where: {
      assignedToId: clientId,
      createdById: user.user.id,
      startDate: null,
    },
  })

  return plans.map((plan) => new TrainingPlan(plan))
}

export async function getClientActivePlan(
  args: GQLQueryGetClientActivePlanArgs,
) {
  const { clientId } = args
  const user = await getCurrentUserOrThrow()
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
                      logs: true,
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
  return plan ? new TrainingPlan(plan) : null
}

export async function getMyPlansOverview() {
  const user = await getCurrentUserOrThrow()
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
    activePlan: activePlan ? new TrainingPlan(activePlan) : null,
    availablePlans: availablePlans.map((plan) => new TrainingPlan(plan)),
    completedPlans: completedPlans.map((plan) => new TrainingPlan(plan)),
  }
}

export async function createTrainingPlan(
  args: GQLMutationCreateTrainingPlanArgs,
) {
  const user = await getCurrentUserOrThrow()

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
                      reps: set.reps ?? set.maxReps ?? set.minReps ?? null,
                      minReps: set.minReps ?? set.reps ?? null,
                      maxReps: set.maxReps ?? set.reps ?? null,
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
) {
  const { input } = args

  const user = await getCurrentUserOrThrow()
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
) {
  const [user, plan] = await Promise.all([
    getCurrentUserOrThrow(),
    getFullPlanById(args.id),
  ])

  if (!plan || plan.createdById !== user.user.id) {
    throw new Error('Training plan not found or unauthorized')
  }

  const duplicated = await duplicatePlan({ plan, asTemplate: true })

  return duplicated.id
}

export async function deleteTrainingPlan(
  args: GQLMutationDeleteTrainingPlanArgs,
) {
  const user = await getCurrentUserOrThrow()

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
) {
  const { clientId, planId, startDate } = args.input

  const [user, plan] = await Promise.all([
    getCurrentUser(),
    getFullPlanById(planId),
  ])

  if (!plan || plan.createdById !== user?.user.id) {
    throw new Error('Training plan not found or unauthorized')
  }

  const duplicated = await duplicatePlan({ plan, asTemplate: false })

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

  await createNotification({
    createdBy: user.user.id,
    userId: clientId,
    relatedItemId: duplicated.id,
    message: `New training plan "${plan.title}" has been assigned to you${senderName ? ` by ${senderName}` : ''}.`,
    type: GQLNotificationType.NewTrainingPlanAssigned,
  })

  return true
}

export async function removeTrainingPlanFromClient(
  args: GQLMutationRemoveTrainingPlanFromClientArgs,
) {
  const user = await getCurrentUserOrThrow()
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

export async function activatePlan(args: GQLMutationActivatePlanArgs) {
  const { planId, startDate, resume } = args

  const [user, fullPlan] = await Promise.all([
    getCurrentUserOrThrow(),
    resume ? null : getFullPlanById(planId),
  ])
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

  return true
}

export async function pausePlan(args: GQLMutationPausePlanArgs) {
  const { planId } = args

  const user = await getCurrentUserOrThrow()

  await prisma.trainingPlan.update({
    where: { id: planId, assignedToId: user.user.id },
    data: { active: false },
  })

  return true
}

export async function closePlan(args: GQLMutationClosePlanArgs) {
  const { planId } = args

  const user = await getCurrentUserOrThrow()

  await prisma.trainingPlan.update({
    where: { id: planId, assignedToId: user.user.id },
    data: { completedAt: new Date(), active: false },
  })

  return true
}

export async function deletePlan(args: GQLMutationDeletePlanArgs) {
  const { planId } = args

  const user = await getCurrentUserOrThrow()

  await prisma.trainingPlan.delete({
    where: { id: planId, assignedToId: user.user.id, isTemplate: false },
  })

  return true
}
