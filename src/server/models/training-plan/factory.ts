import { prisma } from '@lib/db'
import { Prisma } from '@prisma/client'

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
    where: { assignedToId: clientId, createdById: user.user.id },
  })

  return plans.map((plan) => new TrainingPlan(plan))
}

export async function createTrainingPlan(
  args: GQLMutationCreateTrainingPlanArgs,
) {
  const user = await getCurrentUserOrThrow()

  const { title, isPublic, isDraft, description, weeks } = args.input

  await prisma.trainingPlan.create({
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
                  sets: {
                    create: exercise.sets?.map((set) => ({
                      order: set.order,
                      reps: set.reps,
                      weight: set.weight ?? null,
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

  return true
}

export async function updateTrainingPlan(
  args: GQLMutationUpdateTrainingPlanArgs,
) {
  const { input } = args

  const user = await getCurrentUserOrThrow()
  await prisma.$transaction(async (tx) => {
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
                    sets: {
                      create: exercise.sets?.map((set) => ({
                        order: set.order,
                        reps: set.reps,
                        weight: set.weight ?? null,
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
  })

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
    message: `New training plan ${plan.title} has been assigned to you${senderName ? ` by ${senderName}` : ''}.`,
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
