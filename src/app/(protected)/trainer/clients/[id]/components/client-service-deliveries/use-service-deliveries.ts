import { useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import {
  GQLGetTrainerServiceDeliveriesQuery,
  GQLGetTrainerTasksQuery,
  GQLTaskStatus,
  useGetTrainerServiceDeliveriesQuery,
  useGetTrainerTasksQuery,
  useUpdateServiceTaskMutation,
} from '@/generated/graphql-client'

interface TaskWithDelivery {
  id: string
  title: string
  status: string
  taskType: string
  requiresScheduling?: boolean
  scheduledAt?: string | null
  updatedAt: string
  serviceDelivery: {
    packageName: string
    serviceType: string
  }
}

interface ServiceDeliveryWithTasks {
  delivery: NonNullable<
    GQLGetTrainerServiceDeliveriesQuery['getTrainerDeliveries']
  >[number]
  tasks: TaskWithDelivery[]
}

export function useServiceDeliveries(clientId: string, userId: string) {
  const queryClient = useQueryClient()

  // Optimistic updates state
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    Record<string, { status: string }>
  >({})

  // Track which specific task is being updated
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null)

  // Fetch service deliveries and tasks
  const { data: deliveriesData, isLoading: deliveriesLoading } =
    useGetTrainerServiceDeliveriesQuery(
      { trainerId: userId },
      {
        enabled: !!userId,
        placeholderData: (previousData) => previousData,
      },
    )

  const { data: tasksData, isLoading: tasksLoading } = useGetTrainerTasksQuery(
    { trainerId: userId },
    {
      enabled: !!userId,
      placeholderData: (previousData) => previousData,
    },
  )

  // Mutation handler with immediate cache updates to prevent UI flashing
  const { mutate: updateTask } = useUpdateServiceTaskMutation({
    onSuccess: (data, variables) => {
      // Update the query cache immediately with the new task data
      const queryKey = useGetTrainerTasksQuery.getKey({
        trainerId: userId,
      })
      queryClient.setQueryData<GQLGetTrainerTasksQuery>(queryKey, (oldData) => {
        if (!oldData?.getTrainerTasks) return oldData

        return {
          ...oldData,
          getTrainerTasks: oldData.getTrainerTasks.map((task) =>
            task.id === variables.taskId
              ? { ...task, ...data.updateServiceTask } // Extract task from mutation response
              : task,
          ),
        }
      })

      // Clear optimistic update for this task after cache is updated
      setOptimisticUpdates((prev) => {
        const updated = { ...prev }
        delete updated[variables.taskId]
        return updated
      })

      // Clear the updating task ID
      setUpdatingTaskId(null)
    },
    onError: (error, variables) => {
      console.error('Failed to update task:', error)
      // Clear optimistic update on error
      setOptimisticUpdates((prev) => {
        const updated = { ...prev }
        delete updated[variables.taskId]
        return updated
      })
      // Clear the updating task ID
      setUpdatingTaskId(null)
    },
  })

  // Filter tasks for this specific client and group by service delivery
  const clientServiceDeliveries = useMemo(() => {
    if (!deliveriesData?.getTrainerDeliveries || !tasksData?.getTrainerTasks) {
      return []
    }

    // Filter deliveries for this client
    const clientDeliveries = deliveriesData.getTrainerDeliveries.filter(
      (delivery) => delivery.client?.id === clientId,
    )

    // Group tasks by service delivery for this client
    const grouped: Record<string, ServiceDeliveryWithTasks> = {}

    clientDeliveries.forEach((delivery) => {
      const deliveryTasks = tasksData.getTrainerTasks.filter(
        (task) => task.serviceDeliveryId === delivery.id,
      )

      if (deliveryTasks.length > 0) {
        grouped[delivery.id] = {
          delivery,
          tasks: deliveryTasks.map((task) => {
            // Apply optimistic updates if they exist
            const optimisticUpdate = optimisticUpdates[task.id]
            return {
              ...task,
              // Override with optimistic status if available, keep original updatedAt
              status: optimisticUpdate?.status || task.status,
              serviceDelivery: {
                packageName: delivery.packageName,
                serviceType: delivery.serviceType?.toString() || 'Unknown',
              },
            }
          }),
        }
      }
    })

    return Object.values(grouped)
  }, [deliveriesData, tasksData, clientId, optimisticUpdates])

  const handleTaskStatusChange = (taskId: string, newStatus: string) => {
    // Set which task is being updated to disable only its dropdown
    setUpdatingTaskId(taskId)

    // Set optimistic update immediately for instant UI feedback
    // Note: We only update status, not updatedAt, to prevent tasks from jumping
    // position when status changes. Backend handles stable ordering by status/order/createdAt.
    setOptimisticUpdates((prev) => ({
      ...prev,
      [taskId]: {
        status: newStatus,
      },
    }))

    // Perform actual mutation
    updateTask({
      taskId,
      input: {
        status: newStatus as GQLTaskStatus,
      },
    })
  }

  return {
    clientServiceDeliveries,
    handleTaskStatusChange,
    updatingTaskId,
    isLoading: deliveriesLoading || tasksLoading,
  }
}
