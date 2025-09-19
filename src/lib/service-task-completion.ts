import { GQLTaskStatus, GQLTaskType } from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { updateServiceTask } from '@/server/models/service-task/factory'
import { GQLContext } from '@/types/gql-context'

/**
 * Interface for meal plan task completion result
 */
export interface MealPlanTaskCompletionResult {
  completedTasks: {
    taskId: string
    title: string
    serviceDeliveryId: string
  }[]
  alreadyCompleted: {
    taskId: string
    title: string
    serviceDeliveryId: string
  }[]
  errors: {
    taskId: string
    error: string
  }[]
}

/**
 * Find pending meal plan delivery tasks for a specific trainer-client relationship
 */
async function findPendingMealPlanTasks(
  trainerId: string,
  clientId: string,
): Promise<
  {
    taskId: string
    title: string
    serviceDeliveryId: string
    templateId: string
  }[]
> {
  try {
    // Find all pending PLAN_DELIVERY tasks for MEAL_PLAN service deliveries
    // between this trainer and client
    const pendingTasks = await prisma.serviceTask.findMany({
      where: {
        taskType: GQLTaskType.PlanDelivery,
        status: GQLTaskStatus.Pending,
        serviceDelivery: {
          trainerId,
          clientId,
          serviceType: 'MEAL_PLAN',
          status: {
            in: ['PENDING', 'IN_PROGRESS'],
          },
        },
      },
      include: {
        serviceDelivery: {
          select: {
            id: true,
            serviceType: true,
            packageName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc', // Complete oldest tasks first
      },
    })

    // Filter for meal plan delivery tasks specifically
    const mealPlanDeliveryTasks = pendingTasks.filter(
      (task) => task.templateId === 'deliver_meal_plan',
    )

    return mealPlanDeliveryTasks.map((task) => ({
      taskId: task.id,
      title: task.title,
      serviceDeliveryId: task.serviceDeliveryId,
      templateId: task.templateId,
    }))
  } catch (error) {
    console.error('Error finding pending meal plan tasks:', error)
    return []
  }
}

/**
 * Complete meal plan delivery tasks for a trainer-client relationship
 * This should be called when a nutrition plan is shared with a client
 */
async function completeMealPlanTasks(
  trainerId: string,
  clientId: string,
  nutritionPlanId: string,
  context: GQLContext,
): Promise<MealPlanTaskCompletionResult> {
  const result: MealPlanTaskCompletionResult = {
    completedTasks: [],
    alreadyCompleted: [],
    errors: [],
  }

  try {
    // Find all pending meal plan delivery tasks for this trainer-client pair
    const pendingTasks = await findPendingMealPlanTasks(trainerId, clientId)

    if (pendingTasks.length === 0) {
      console.info(
        `📋 No pending meal plan delivery tasks found for trainer ${trainerId} and client ${clientId}`,
      )
      return result
    }

    // Complete each pending task
    for (const task of pendingTasks) {
      try {
        // Check if task is still pending (avoid race conditions)
        const currentTask = await prisma.serviceTask.findUnique({
          where: { id: task.taskId },
          select: { status: true },
        })

        if (!currentTask) {
          result.errors.push({
            taskId: task.taskId,
            error: 'Task not found',
          })
          continue
        }

        if (currentTask.status === GQLTaskStatus.Completed) {
          result.alreadyCompleted.push({
            taskId: task.taskId,
            title: task.title,
            serviceDeliveryId: task.serviceDeliveryId,
          })
          continue
        }

        // Complete the task
        await updateServiceTask(
          {
            taskId: task.taskId,
            input: {
              status: GQLTaskStatus.Completed,
              notes: `Nutrition plan shared with client (Plan ID: ${nutritionPlanId})`,
            },
          },
          context,
        )

        result.completedTasks.push({
          taskId: task.taskId,
          title: task.title,
          serviceDeliveryId: task.serviceDeliveryId,
        })

        console.info(
          `✅ Completed meal plan delivery task: ${task.title} (${task.taskId})`,
        )
      } catch (error) {
        console.error(`❌ Failed to complete task ${task.taskId}:`, error)
        result.errors.push({
          taskId: task.taskId,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    // Log summary
    if (result.completedTasks.length > 0) {
      console.info(
        `📋 Meal plan task completion summary: ${result.completedTasks.length} completed, ${result.alreadyCompleted.length} already completed, ${result.errors.length} errors`,
      )
    }

    return result
  } catch (error) {
    console.error('Error completing meal plan tasks:', error)
    result.errors.push({
      taskId: 'unknown',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return result
  }
}

/**
 * Find all pending meal plan tasks for a trainer across all clients
 * Useful for displaying trainer's pending deliveries
 */
async function findTrainerPendingMealPlanTasks(trainerId: string): Promise<
  {
    taskId: string
    title: string
    serviceDeliveryId: string
    clientId: string
    clientName: string | null
    packageName: string
    createdAt: Date
  }[]
> {
  try {
    const pendingTasks = await prisma.serviceTask.findMany({
      where: {
        taskType: GQLTaskType.PlanDelivery,
        status: GQLTaskStatus.Pending,
        templateId: 'deliver_meal_plan',
        serviceDelivery: {
          trainerId,
          serviceType: 'MEAL_PLAN',
          status: {
            in: ['PENDING', 'IN_PROGRESS'],
          },
        },
      },
      include: {
        serviceDelivery: {
          select: {
            id: true,
            clientId: true,
            packageName: true,
            client: {
              select: {
                name: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return pendingTasks.map((task) => {
      const client = task.serviceDelivery.client
      const clientName =
        client.profile?.firstName && client.profile?.lastName
          ? `${client.profile.firstName} ${client.profile.lastName}`
          : client.name

      return {
        taskId: task.id,
        title: task.title,
        serviceDeliveryId: task.serviceDeliveryId,
        clientId: task.serviceDelivery.clientId,
        clientName,
        packageName: task.serviceDelivery.packageName,
        createdAt: task.createdAt,
      }
    })
  } catch (error) {
    console.error('Error finding trainer pending meal plan tasks:', error)
    return []
  }
}

/**
 * Check if a specific service delivery has pending meal plan tasks
 */
async function hasServiceDeliveryPendingMealPlanTasks(
  serviceDeliveryId: string,
): Promise<boolean> {
  try {
    const pendingTaskCount = await prisma.serviceTask.count({
      where: {
        serviceDeliveryId,
        taskType: GQLTaskType.PlanDelivery,
        status: GQLTaskStatus.Pending,
        templateId: 'deliver_meal_plan',
      },
    })

    return pendingTaskCount > 0
  } catch (error) {
    console.error('Error checking service delivery pending tasks:', error)
    return false
  }
}

/**
 * Service for managing meal plan task completion
 * Centralized object containing all meal plan task operations
 */
export const MealPlanTaskService = {
  findPendingTasks: findPendingMealPlanTasks,
  completeTasks: completeMealPlanTasks,
  findTrainerPendingTasks: findTrainerPendingMealPlanTasks,
  hasServiceDeliveryPendingTasks: hasServiceDeliveryPendingMealPlanTasks,
} as const

// Export individual functions for backward compatibility
export {
  findPendingMealPlanTasks,
  completeMealPlanTasks,
  findTrainerPendingMealPlanTasks,
  hasServiceDeliveryPendingMealPlanTasks,
}
