import { AutoCompleteAction, TaskStatus } from '@/constants/task-templates'
import {
  GQLMutationUpdateServiceTaskArgs,
  GQLQueryGetServiceDeliveryTasksArgs,
  GQLQueryGetTrainerTasksArgs,
  GQLTaskStatus,
} from '@/generated/graphql-server'
import { Prisma, ServiceType } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

import ServiceTask from './model'

export async function getServiceDeliveryTasks(
  args: GQLQueryGetServiceDeliveryTasksArgs,
  context: GQLContext,
) {
  if (!context.user?.user) {
    throw new Error('Authentication required')
  }

  const tasks = await prisma.serviceTask.findMany({
    where: {
      serviceDeliveryId: args.serviceDeliveryId,
    },
    include: {
      serviceDelivery: {
        include: {
          trainer: { include: { profile: true } },
          client: { include: { profile: true } },
        },
      },
    },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  })

  return tasks.map((task) => new ServiceTask(task, context))
}

export async function getTrainerTasks(
  args: GQLQueryGetTrainerTasksArgs,
  context: GQLContext,
) {
  if (!context.user?.user) {
    throw new Error('Authentication required')
  }

  if (context.user.user.id !== args.trainerId) {
    throw new Error('Unauthorized: Can only view your own tasks')
  }

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
          trainer: { include: { profile: true } },
          client: { include: { profile: true } },
        },
      },
    },
    orderBy: [{ status: 'asc' }, { order: 'asc' }, { createdAt: 'desc' }],
  })

  return tasks.map((task) => new ServiceTask(task, context))
}

export async function updateServiceTask(
  args: GQLMutationUpdateServiceTaskArgs,
  context: GQLContext,
) {
  if (!context.user?.user) {
    throw new Error('Authentication required')
  }

  const task = await prisma.serviceTask.findUnique({
    where: { id: args.taskId },
    include: {
      serviceDelivery: true,
    },
  })

  if (!task) {
    throw new Error('Task not found')
  }

  if (task.serviceDelivery.trainerId !== context.user.user.id) {
    throw new Error('Unauthorized: Can only update your own tasks')
  }

  const updateData: Prisma.ServiceTaskUpdateInput = {}

  if (args.input.status) {
    updateData.status = args.input.status
    if (args.input.status === GQLTaskStatus.Completed) {
      updateData.completedAt = new Date()
      updateData.metadata = {
        ...(task.metadata as object),
        completedBy: 'manual',
      }
    }
  }

  if (args.input.notes !== undefined) {
    updateData.notes = args.input.notes
  }

  const updatedTask = await prisma.serviceTask.update({
    where: { id: args.taskId },
    data: updateData,
    include: {
      serviceDelivery: {
        include: {
          trainer: { include: { profile: true } },
          client: { include: { profile: true } },
        },
      },
    },
  })

  // Update delivery status based on task completion
  await checkAndUpdateDeliveryStatus(task.serviceDeliveryId)

  return new ServiceTask(updatedTask, context)
}

interface CompleteTaskByActionParams {
  trainerId: string
  clientId: string
  action: AutoCompleteAction
  relatedItemId?: string
}

export async function completeTaskByAction({
  trainerId,
  clientId,
  action,
  relatedItemId,
}: CompleteTaskByActionParams) {
  // Find the first pending or in-progress task that matches this auto-complete action
  const task = await prisma.serviceTask.findFirst({
    where: {
      serviceDelivery: {
        trainerId,
        clientId,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
      },
      status: { in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS] },
      metadata: {
        path: ['autoCompleteOn'],
        equals: action,
      },
    },
    orderBy: [{ createdAt: 'asc' }, { order: 'asc' }],
  })

  if (!task) {
    return null
  }

  interface TaskMetadata {
    autoCompleteOn?: string
    requiredCompletions?: number
    completions?: number
    completedItems?: { relatedItemId?: string; completedAt: string }[]
    completedBy?: string
  }

  const metadata = (task.metadata as TaskMetadata) || {}
  const requiredCompletions = metadata.requiredCompletions || 1
  const currentCompletions = (metadata.completions || 0) + 1
  const completedItems = [...(metadata.completedItems || [])]

  // Add the new completion
  completedItems.push({
    relatedItemId,
    completedAt: new Date().toISOString(),
  })

  // Check if we've reached the required number of completions
  const isFullyCompleted = currentCompletions >= requiredCompletions

  const updatedTask = await prisma.serviceTask.update({
    where: { id: task.id },
    data: {
      status: isFullyCompleted ? TaskStatus.COMPLETED : TaskStatus.IN_PROGRESS,
      ...(isFullyCompleted && { completedAt: new Date() }),
      metadata: {
        ...metadata,
        completions: currentCompletions,
        requiredCompletions,
        completedItems,
        ...(isFullyCompleted && { completedBy: 'auto' }),
      },
    },
  })

  console.info(
    `✅ Progress on task "${updatedTask.title}" for client ${clientId}: ${currentCompletions}/${requiredCompletions} completions (action: ${action})`,
  )

  // Check if all tasks for the delivery are complete
  if (isFullyCompleted) {
    await checkAndUpdateDeliveryStatus(task.serviceDeliveryId)
  }

  return updatedTask
}

export async function checkAndUpdateDeliveryStatus(serviceDeliveryId: string) {
  const tasks = await prisma.serviceTask.findMany({
    where: { serviceDeliveryId },
  })

  if (tasks.length === 0) return

  const completedCount = tasks.filter(
    (t) =>
      t.status === TaskStatus.COMPLETED || t.status === TaskStatus.CANCELLED,
  ).length
  const totalCount = tasks.length

  // Determine new delivery status based on task completion:
  // - All tasks completed → COMPLETED
  // - Some tasks completed → IN_PROGRESS
  // - No tasks completed → PENDING
  let newStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  if (completedCount === totalCount) {
    newStatus = 'COMPLETED'
  } else if (completedCount > 0) {
    newStatus = 'IN_PROGRESS'
  } else {
    newStatus = 'PENDING'
  }

  await prisma.serviceDelivery.update({
    where: { id: serviceDeliveryId },
    data: {
      status: newStatus,
      ...(newStatus === 'COMPLETED' && { deliveredAt: new Date() }),
    },
  })

  console.info(
    `📦 Updated ServiceDelivery ${serviceDeliveryId} status to ${newStatus} (${completedCount}/${totalCount} tasks complete)`,
  )
}

export async function createTasksForDelivery(
  serviceDeliveryId: string,
  serviceType: ServiceType,
  isRecurringPayment: boolean,
) {
  const { generateTasks } = await import('@/constants/task-templates')

  const taskData = generateTasks({
    serviceDeliveryId,
    serviceType,
    isRecurringPayment,
  })

  if (taskData.length === 0) {
    return []
  }

  // Add autoCompleteOn and requiredCompletions to metadata
  const tasksWithMetadata = taskData.map((task) => ({
    serviceDeliveryId: task.serviceDeliveryId,
    templateId: task.templateId,
    title: task.title,
    taskType: task.taskType,
    status: task.status,
    order: task.order,
    isRequired: task.isRequired,
    metadata: {
      ...(task.autoCompleteOn && { autoCompleteOn: task.autoCompleteOn }),
      requiredCompletions: task.requiredCompletions || 1,
      completions: 0,
      completedItems: [],
    },
  }))

  await prisma.serviceTask.createMany({
    data: tasksWithMetadata,
  })

  console.info(
    `📋 Created ${taskData.length} tasks for ${serviceType} (recurring: ${isRecurringPayment})`,
  )

  return taskData
}
