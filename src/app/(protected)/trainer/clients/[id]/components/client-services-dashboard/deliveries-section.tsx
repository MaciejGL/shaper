import { useQueryClient } from '@tanstack/react-query'
import { orderBy } from 'lodash'
import { Package } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Loader } from '@/components/loader'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  GQLDeliveryStatus,
  GQLGetTrainerServiceDeliveriesQuery,
  GQLTaskStatus,
  useGetTrainerServiceDeliveriesQuery,
  useUpdateServiceDeliveryMutation,
  useUpdateServiceTaskMutation,
} from '@/generated/graphql-client'

import { DeliveryCard } from './delivery-card'

interface DeliveriesSectionProps {
  clientId: string
  trainerId: string
}

export function DeliveriesSection({
  clientId,
  trainerId,
}: DeliveriesSectionProps) {
  const queryClient = useQueryClient()
  const queryKey = useGetTrainerServiceDeliveriesQuery.getKey({ trainerId })

  const { data, isLoading } = useGetTrainerServiceDeliveriesQuery(
    { trainerId },
    { enabled: !!trainerId },
  )

  const updateDeliveryMutation = useUpdateServiceDeliveryMutation({
    onMutate: async ({ deliveryId, status }) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(
        queryKey,
        (old: GQLGetTrainerServiceDeliveriesQuery | undefined) => {
          if (!old?.getTrainerDeliveries) return old
          return {
            ...old,
            getTrainerDeliveries: old.getTrainerDeliveries.map((d) => {
              if (d.id !== deliveryId) return d

              // When marking delivery as completed, also mark all tasks as completed
              if (status === GQLDeliveryStatus.Completed && d.tasks) {
                const updatedTasks = d.tasks.map((t) => ({
                  ...t,
                  status: GQLTaskStatus.Completed,
                  updatedAt: new Date().toISOString(),
                }))
                return {
                  ...d,
                  status,
                  tasks: updatedTasks,
                  completedTaskCount: updatedTasks.length,
                  taskProgress: 100,
                  updatedAt: new Date().toISOString(),
                }
              }

              return { ...d, status }
            }),
          }
        },
      )

      return { previous }
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const updateTaskMutation = useUpdateServiceTaskMutation({
    onMutate: async ({ taskId, input }) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(
        queryKey,
        (old: GQLGetTrainerServiceDeliveriesQuery | undefined) => {
          if (!old?.getTrainerDeliveries) return old
          return {
            ...old,
            getTrainerDeliveries: old.getTrainerDeliveries.map((d) => {
              if (!d.tasks) return d

              const updatedTasks = d.tasks.map((t) =>
                t.id === taskId
                  ? {
                      ...t,
                      status: input.status,
                      updatedAt: new Date().toISOString(),
                    }
                  : t,
              )

              const hasTaskUpdate = d.tasks.some((t) => t.id === taskId)
              if (!hasTaskUpdate) return d

              const completedCount = updatedTasks.filter(
                (t) => t.status === GQLTaskStatus.Completed,
              ).length
              const totalCount = updatedTasks.length
              const taskProgress =
                totalCount > 0
                  ? Math.round((completedCount / totalCount) * 100)
                  : 0

              // Determine delivery status based on task completion:
              // - All tasks completed → Completed
              // - Some tasks completed → InProgress
              // - No tasks completed → Pending
              let newDeliveryStatus: GQLDeliveryStatus
              if (completedCount === totalCount) {
                newDeliveryStatus = GQLDeliveryStatus.Completed
              } else if (completedCount > 0) {
                newDeliveryStatus = GQLDeliveryStatus.InProgress
              } else {
                newDeliveryStatus = GQLDeliveryStatus.Pending
              }

              return {
                ...d,
                status: newDeliveryStatus,
                tasks: updatedTasks,
                completedTaskCount: completedCount,
                taskProgress,
                updatedAt: new Date().toISOString(),
              }
            }),
          }
        },
      )

      return { previous }
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const clientDeliveries = useMemo(() => {
    if (!data?.getTrainerDeliveries) return []
    return data.getTrainerDeliveries.filter((d) => d.client?.id === clientId)
  }, [data, clientId])

  const sortedDeliveries = useMemo(
    () =>
      orderBy(
        clientDeliveries,
        [
          (d) => d.status === GQLDeliveryStatus.Completed,
          (d) => (d.isOverdue ? -1 : d.daysUntilDue),
        ],
        ['asc', 'asc'],
      ),
    [clientDeliveries],
  )

  const pendingCount = clientDeliveries.filter(
    (d) => d.status !== GQLDeliveryStatus.Completed,
  ).length
  const overdueCount = clientDeliveries.filter(
    (d) => d.isOverdue && d.status !== GQLDeliveryStatus.Completed,
  ).length

  const handleStatusChange = async (
    deliveryId: string,
    status: GQLDeliveryStatus,
  ) => {
    setUpdatingId(deliveryId)
    try {
      // Update delivery status
      await updateDeliveryMutation.mutateAsync({ deliveryId, status })

      // When marking delivery as completed, also complete all pending tasks
      if (status === GQLDeliveryStatus.Completed) {
        const delivery = clientDeliveries.find((d) => d.id === deliveryId)
        const pendingTasks =
          delivery?.tasks?.filter(
            (t) => t.status !== GQLTaskStatus.Completed,
          ) || []

        // Complete all pending tasks in parallel
        await Promise.all(
          pendingTasks.map((task) =>
            updateTaskMutation.mutateAsync({
              taskId: task.id,
              input: { status: GQLTaskStatus.Completed },
            }),
          ),
        )
      }
    } finally {
      setUpdatingId(null)
    }
  }

  const handleTaskToggle = async (
    taskId: string,
    currentStatus: GQLTaskStatus,
    deliveryId: string,
  ) => {
    setUpdatingId(taskId)
    try {
      const newStatus =
        currentStatus === GQLTaskStatus.Completed
          ? GQLTaskStatus.Pending
          : GQLTaskStatus.Completed

      await updateTaskMutation.mutateAsync({
        taskId,
        input: { status: newStatus },
      })

      // Calculate new delivery status based on task completion
      const delivery = clientDeliveries.find((d) => d.id === deliveryId)
      if (delivery?.tasks) {
        const updatedTasks = delivery.tasks.map((t) =>
          t.id === taskId ? { ...t, status: newStatus } : t,
        )
        const completedCount = updatedTasks.filter(
          (t) => t.status === GQLTaskStatus.Completed,
        ).length
        const totalCount = updatedTasks.length

        // Determine new delivery status:
        // - All tasks completed → Completed
        // - Some tasks completed → InProgress
        // - No tasks completed → Pending
        let newDeliveryStatus: GQLDeliveryStatus
        if (completedCount === totalCount) {
          newDeliveryStatus = GQLDeliveryStatus.Completed
        } else if (completedCount > 0) {
          newDeliveryStatus = GQLDeliveryStatus.InProgress
        } else {
          newDeliveryStatus = GQLDeliveryStatus.Pending
        }

        // Update delivery status if it changed
        if (delivery.status !== newDeliveryStatus) {
          await updateDeliveryMutation.mutateAsync({
            deliveryId,
            status: newDeliveryStatus,
          })
        }
      }
    } finally {
      setUpdatingId(null)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2">
            <Loader />
            <span className="text-muted-foreground">Loading deliveries...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Deliveries & Tasks</CardTitle>
          <div className="flex items-center gap-2">
            {overdueCount > 0 && (
              <Badge variant="destructive">{overdueCount} overdue</Badge>
            )}
            {pendingCount > 0 && (
              <Badge variant="outline">{pendingCount} pending</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sortedDeliveries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="size-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No deliveries yet</p>
            <p className="text-xs mt-1">Send an offer to create deliverables</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedDeliveries.map((delivery) => (
              <DeliveryCard
                key={delivery.id}
                delivery={delivery}
                onStatusChange={handleStatusChange}
                onTaskToggle={handleTaskToggle}
                updatingId={updatingId}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

