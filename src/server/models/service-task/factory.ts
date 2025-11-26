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
  // Find the first pending task that matches this auto-complete action
  const pendingTask = await prisma.serviceTask.findFirst({
    where: {
      serviceDelivery: {
        trainerId,
        clientId,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
      },
      status: TaskStatus.PENDING,
      metadata: {
        path: ['autoCompleteOn'],
        equals: action,
      },
    },
    orderBy: [{ createdAt: 'asc' }, { order: 'asc' }],
  })

  if (!pendingTask) {
    return null
  }

  const updatedTask = await prisma.serviceTask.update({
    where: { id: pendingTask.id },
    data: {
      status: TaskStatus.COMPLETED,
      completedAt: new Date(),
      metadata: {
        ...(pendingTask.metadata as object),
        completedBy: 'auto',
        relatedItemId,
      },
    },
  })

  console.info(
    `✅ Auto-completed task "${updatedTask.title}" for client ${clientId} (action: ${action})`,
  )

  // Check if all tasks for the delivery are complete
  await checkAndUpdateDeliveryStatus(pendingTask.serviceDeliveryId)

  return updatedTask
}

async function checkAndUpdateDeliveryStatus(serviceDeliveryId: string) {
  const tasks = await prisma.serviceTask.findMany({
    where: { serviceDeliveryId },
  })

  const allCompleted = tasks.every(
    (t) =>
      t.status === TaskStatus.COMPLETED || t.status === TaskStatus.CANCELLED,
  )

  if (allCompleted && tasks.length > 0) {
    await prisma.serviceDelivery.update({
      where: { id: serviceDeliveryId },
      data: {
        status: 'COMPLETED',
        deliveredAt: new Date(),
      },
    })

    console.info(
      `✅ All tasks complete - marked ServiceDelivery ${serviceDeliveryId} as COMPLETED`,
    )
  }
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

  // Add autoCompleteOn to metadata
  const tasksWithMetadata = taskData.map((task) => ({
    serviceDeliveryId: task.serviceDeliveryId,
    templateId: task.templateId,
    title: task.title,
    taskType: task.taskType,
    status: task.status,
    order: task.order,
    isRequired: task.isRequired,
    metadata: task.autoCompleteOn
      ? { autoCompleteOn: task.autoCompleteOn }
      : undefined,
  }))

  await prisma.serviceTask.createMany({
    data: tasksWithMetadata,
  })

  console.info(
    `📋 Created ${taskData.length} tasks for ${serviceType} (recurring: ${isRecurringPayment})`,
  )

  return taskData
}
