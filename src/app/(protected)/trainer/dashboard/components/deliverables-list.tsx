'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import { LoadingSkeleton } from '@/components/loading-skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useUser } from '@/context/user-context'
import {
  GQLDeliveryStatus,
  GQLTaskStatus,
  useGetTrainerServiceDeliveriesQuery,
  useUpdateServiceDeliveryMutation,
  useUpdateServiceTaskMutation,
} from '@/generated/graphql-client'

import { DeliverableCard } from './deliverable-card'
import { Delivery, UrgencyGroup } from './types'

function groupDeliveriesByUrgency(
  deliveries: Delivery[],
): Record<UrgencyGroup, Delivery[]> {
  const groups: Record<UrgencyGroup, Delivery[]> = {
    overdue: [],
    'due-today': [],
    'due-soon': [],
    upcoming: [],
    completed: [],
  }

  for (const delivery of deliveries) {
    if (delivery.status === GQLDeliveryStatus.Completed) {
      groups.completed.push(delivery)
    } else if (delivery.isOverdue) {
      groups.overdue.push(delivery)
    } else if (delivery.daysUntilDue === 0) {
      groups['due-today'].push(delivery)
    } else if (delivery.daysUntilDue <= 2) {
      groups['due-soon'].push(delivery)
    } else {
      groups.upcoming.push(delivery)
    }
  }

  return groups
}

const GROUP_CONFIG: Record<
  UrgencyGroup,
  {
    title: string
    emptyMessage: string
    variant: 'destructive' | 'warning' | 'default' | 'outline'
  }
> = {
  overdue: {
    title: 'Overdue',
    emptyMessage: 'No overdue deliverables',
    variant: 'destructive',
  },
  'due-today': {
    title: 'Due Today',
    emptyMessage: 'Nothing due today',
    variant: 'warning',
  },
  'due-soon': {
    title: 'Due Soon',
    emptyMessage: 'Nothing due soon',
    variant: 'warning',
  },
  upcoming: {
    title: 'Upcoming',
    emptyMessage: 'No upcoming deliverables',
    variant: 'default',
  },
  completed: {
    title: 'Completed',
    emptyMessage: 'No completed deliverables',
    variant: 'outline',
  },
}

export function DeliverablesList() {
  const { user } = useUser()
  const queryClient = useQueryClient()
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [completedOpen, setCompletedOpen] = useState(false)

  const queryKey = useGetTrainerServiceDeliveriesQuery.getKey({
    trainerId: user?.id || '',
  })

  const { data, isLoading } = useGetTrainerServiceDeliveriesQuery(
    { trainerId: user?.id || '' },
    {
      enabled: !!user?.id,
      refetchOnWindowFocus: false,
    },
  )

  const updateMutation = useUpdateServiceDeliveryMutation()
  const updateTaskMutation = useUpdateServiceTaskMutation()

  const handleStatusChange = async (
    deliveryId: string,
    newStatus: GQLDeliveryStatus,
  ) => {
    setUpdatingId(deliveryId)

    const previousData = queryClient.getQueryData<typeof data>(queryKey)

    queryClient.setQueryData<typeof data>(queryKey, (old) => {
      if (!old?.getTrainerDeliveries) return old
      return {
        ...old,
        getTrainerDeliveries: old.getTrainerDeliveries.map((d) =>
          d.id === deliveryId ? { ...d, status: newStatus } : d,
        ),
      }
    })

    try {
      await updateMutation.mutateAsync({
        deliveryId,
        status: newStatus,
      })
    } catch {
      queryClient.setQueryData(queryKey, previousData)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleTaskStatusChange = async (
    taskId: string,
    newStatus: GQLTaskStatus,
  ) => {
    setUpdatingId(taskId)

    const previousData = queryClient.getQueryData<typeof data>(queryKey)

    // Optimistically update task status
    queryClient.setQueryData<typeof data>(queryKey, (old) => {
      if (!old?.getTrainerDeliveries) return old
      return {
        ...old,
        getTrainerDeliveries: old.getTrainerDeliveries.map((d) => ({
          ...d,
          tasks: d.tasks?.map((t) =>
            t.id === taskId ? { ...t, status: newStatus } : t,
          ),
          completedTaskCount:
            d.tasks?.filter((t) =>
              t.id === taskId
                ? newStatus === GQLTaskStatus.Completed
                : t.status === GQLTaskStatus.Completed,
            ).length ?? 0,
          taskProgress: (() => {
            const total = d.tasks?.length ?? 0
            if (total === 0) return 100
            const completed =
              d.tasks?.filter((t) =>
                t.id === taskId
                  ? newStatus === GQLTaskStatus.Completed
                  : t.status === GQLTaskStatus.Completed,
              ).length ?? 0
            return Math.round((completed / total) * 100)
          })(),
        })),
      }
    })

    try {
      await updateTaskMutation.mutateAsync({
        taskId,
        input: { status: newStatus },
      })
      // Refetch to get accurate server state
      queryClient.invalidateQueries({ queryKey })
    } catch {
      queryClient.setQueryData(queryKey, previousData)
    } finally {
      setUpdatingId(null)
    }
  }

  const groupedDeliveries = useMemo(() => {
    if (!data?.getTrainerDeliveries) {
      return null
    }
    return groupDeliveriesByUrgency(data.getTrainerDeliveries)
  }, [data])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton count={3} variant="lg" />
      </div>
    )
  }

  if (!groupedDeliveries) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No deliverables found
      </div>
    )
  }

  const activeGroups: UrgencyGroup[] = [
    'overdue',
    'due-today',
    'due-soon',
    'upcoming',
  ]
  const hasActiveDeliverables = activeGroups.some(
    (group) => groupedDeliveries[group].length > 0,
  )

  return (
    <div className="space-y-8">
      {activeGroups.map((group) => {
        const deliveries = groupedDeliveries[group]
        const config = GROUP_CONFIG[group]

        if (deliveries.length === 0) return null

        return (
          <section key={group} className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-medium">{config.title}</h2>
            </div>

            <div className="grid gap-3">
              {deliveries.map((delivery) => (
                <DeliverableCard
                  key={delivery.id}
                  delivery={delivery}
                  onStatusChange={handleStatusChange}
                  onTaskStatusChange={handleTaskStatusChange}
                  isUpdating={
                    updatingId === delivery.id ||
                    delivery.tasks?.some((t) => t.id === updatingId)
                  }
                />
              ))}
            </div>
          </section>
        )
      })}

      {!hasActiveDeliverables && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-medium">All caught up!</p>
          <p className="text-sm">You have no pending deliverables</p>
        </div>
      )}

      {groupedDeliveries.completed.length > 0 && (
        <Collapsible open={completedOpen} onOpenChange={setCompletedOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg font-medium">Completed</span>
                <Badge variant="outline">
                  {groupedDeliveries.completed.length}
                </Badge>
              </div>
              <span className="text-sm text-muted-foreground">
                {completedOpen ? 'Hide' : 'Show'}
              </span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <div className="grid gap-3">
              {groupedDeliveries.completed.map((delivery) => (
                <DeliverableCard
                  key={delivery.id}
                  delivery={delivery}
                  onStatusChange={handleStatusChange}
                  onTaskStatusChange={handleTaskStatusChange}
                  isUpdating={
                    updatingId === delivery.id ||
                    delivery.tasks?.some((t) => t.id === updatingId)
                  }
                />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  )
}
