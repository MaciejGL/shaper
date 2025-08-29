import {
  GQLDeliveryStatus,
  GQLMutationUpdateServiceTaskArgs,
  GQLQueryGetServiceDeliveryTasksArgs,
  GQLQueryGetTrainerTasksArgs,
  GQLTaskStatus,
} from '@/generated/graphql-server'
import { Prisma } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

import { updateServiceDelivery } from '../subscription/factory'

import ServiceTask from './model'

/**
 * Get tasks for a specific service delivery
 */
export async function getServiceDeliveryTasks(
  args: GQLQueryGetServiceDeliveryTasksArgs,
  context: GQLContext,
) {
  if (!context.user?.user) {
    throw new Error('Authentication required')
  }

  // Verify access to this service delivery
  const serviceDelivery = await prisma.serviceDelivery.findUnique({
    where: { id: args.serviceDeliveryId },
    select: { trainerId: true, clientId: true },
  })

  if (!serviceDelivery) {
    throw new Error('Service delivery not found')
  }

  // Allow access if user is either the trainer or the client
  const userId = context.user.user.id
  const hasAccess =
    serviceDelivery.trainerId === userId || serviceDelivery.clientId === userId

  if (!hasAccess) {
    throw new Error('Unauthorized: Cannot access this service delivery')
  }

  const tasks = await prisma.serviceTask.findMany({
    where: {
      serviceDeliveryId: args.serviceDeliveryId,
    },
    include: {
      serviceDelivery: {
        include: {
          trainer: {
            include: {
              profile: true,
            },
          },
          client: {
            include: {
              profile: true,
            },
          },
        },
      },
    },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  })

  return tasks.map((task) => new ServiceTask(task, context))
}

/**
 * Get all tasks for trainer's service deliveries
 */
export async function getTrainerTasks(
  args: GQLQueryGetTrainerTasksArgs,
  context: GQLContext,
) {
  if (!context.user?.user) {
    throw new Error('Authentication required')
  }

  // Only allow trainers to view their own tasks (or admin)
  if (context.user.user.id !== args.trainerId) {
    // TODO: Add admin check here if needed
    throw new Error('Unauthorized: Can only view your own tasks')
  }

  // Build where clause
  const where: Prisma.ServiceTaskWhereInput = {
    serviceDelivery: {
      trainerId: args.trainerId,
    },
    ...(args.status && { status: args.status }),
    ...(args.serviceDeliveryId && {
      serviceDeliveryId: args.serviceDeliveryId,
    }),
  }

  const tasks = await prisma.serviceTask.findMany({
    where,
    include: {
      serviceDelivery: {
        include: {
          trainer: {
            include: {
              profile: true,
            },
          },
          client: {
            include: {
              profile: true,
            },
          },
        },
      },
    },
    orderBy: [
      { status: 'asc' }, // PENDING first, then IN_PROGRESS, etc.
      { order: 'asc' },
      { createdAt: 'desc' },
    ],
  })

  return tasks.map((task) => new ServiceTask(task, context))
}

/**
 * Update service task
 */
export async function updateServiceTask(
  args: GQLMutationUpdateServiceTaskArgs,
  context: GQLContext,
) {
  if (!context.user?.user) {
    throw new Error('Authentication required')
  }

  // Find the task and verify trainer ownership
  const task = await prisma.serviceTask.findUnique({
    where: { id: args.taskId },
    include: {
      serviceDelivery: true,
    },
  })

  if (!task) {
    throw new Error('Service task not found')
  }

  // Only the assigned trainer can update the task
  if (task.serviceDelivery.trainerId !== context.user.user.id) {
    throw new Error(
      'Unauthorized: Only the assigned trainer can update this task',
    )
  }

  // Prepare update data
  const updateData: Prisma.ServiceTaskUpdateInput = {
    updatedAt: new Date(),
  }

  if (args.input.status) {
    updateData.status = args.input.status
    // Set completedAt when marked as completed
    if (args.input.status === GQLTaskStatus.Completed) {
      updateData.completedAt = new Date()
    }
    // Clear completedAt if moving back from completed
    if (args.input.status !== GQLTaskStatus.Completed) {
      updateData.completedAt = null
    }
  }

  if (args.input.notes !== undefined) {
    updateData.notes = args.input.notes
  }

  if (args.input.scheduledAt !== undefined) {
    updateData.scheduledAt = args.input.scheduledAt
      ? new Date(args.input.scheduledAt)
      : null
  }

  // Handle location in metadata
  if (args.input.location !== undefined) {
    const currentMetadata = (task.metadata as { location?: string }) || {}
    updateData.metadata = {
      ...currentMetadata,
      location: args.input.location,
    }
  }

  const updatedTask = await prisma.serviceTask.update({
    where: { id: args.taskId },
    data: updateData,
    include: {
      serviceDelivery: {
        include: {
          trainer: {
            include: {
              profile: true,
            },
          },
          client: {
            include: {
              profile: true,
            },
          },
        },
      },
    },
  })

  // Check if all tasks in this service delivery are completed
  // and update delivery status accordingly
  await checkAndUpdateServiceDeliveryStatus(
    updatedTask.serviceDeliveryId,
    context,
  )

  return new ServiceTask(updatedTask, context)
}

/**
 * Check if all tasks in a service delivery are completed and update delivery status
 */
async function checkAndUpdateServiceDeliveryStatus(
  serviceDeliveryId: string,
  context: GQLContext,
) {
  // Get the current service delivery
  const serviceDelivery = await prisma.serviceDelivery.findUnique({
    where: { id: serviceDeliveryId },
    select: { status: true },
  })

  if (!serviceDelivery) {
    return // Service delivery not found, nothing to update
  }

  // Skip if already completed or cancelled
  if (
    serviceDelivery.status === 'COMPLETED' ||
    serviceDelivery.status === 'CANCELLED'
  ) {
    return
  }

  // Get all tasks for this service delivery
  const allTasks = await prisma.serviceTask.findMany({
    where: { serviceDeliveryId },
    select: { status: true, isRequired: true },
  })

  // Check if all required tasks are completed
  const requiredTasks = allTasks.filter((task) => task.isRequired)
  const completedRequiredTasks = requiredTasks.filter(
    (task) => task.status === GQLTaskStatus.Completed,
  )

  // If all required tasks are completed, mark delivery as completed
  if (
    requiredTasks.length > 0 &&
    completedRequiredTasks.length === requiredTasks.length
  ) {
    await updateServiceDelivery(
      serviceDeliveryId,
      GQLDeliveryStatus.Completed,
      'All required tasks completed automatically',
      context,
    )
  }
  // If at least one task is in progress, mark delivery as in progress
  else if (
    allTasks.some((task) => task.status === GQLTaskStatus.InProgress) &&
    serviceDelivery.status === 'PENDING'
  ) {
    await updateServiceDelivery(
      serviceDeliveryId,
      GQLDeliveryStatus.InProgress,
      undefined,
      context,
    )
  }
}
