'use client'

import { orderBy } from 'lodash'
import { useMemo } from 'react'

import { useUser } from '@/context/user-context'

import { ServiceDeliveriesEmptyState } from './service-deliveries-empty-state'
import { ServiceDeliveriesHeader } from './service-deliveries-header'
import { ServiceDeliveriesLoadingState } from './service-deliveries-loading-state'
import { ServiceDeliveryCard } from './service-delivery-card'
import { useServiceDeliveries } from './use-service-deliveries'

// Service type priority for sorting
const SERVICE_TYPE_PRIORITY = {
  coaching_complete: 1,
  workout_plan: 2,
  meal_plan: 3,
  in_person_meeting: 4,
} as const

interface ClientServiceDeliveriesProps {
  clientId: string
  clientName: string
}

export function ClientServiceDeliveries({
  clientId,
  clientName,
}: ClientServiceDeliveriesProps) {
  const { user } = useUser()
  const {
    clientServiceDeliveries,
    handleTaskStatusChange,
    updatingTaskId,
    isLoading,
  } = useServiceDeliveries(clientId, user?.id || '')

  // Sort service deliveries by priority
  const sortedServiceDeliveries = useMemo(
    () =>
      orderBy(
        clientServiceDeliveries,
        [
          // Primary sort: completed deliveries go to bottom
          (item) => {
            const completedTasks = item.tasks.filter(
              (task) => task.status === 'COMPLETED',
            ).length
            const totalTasks = item.tasks.length
            return completedTasks === totalTasks // true for completed, false for incomplete
          },
          // Secondary sort: by service type priority
          (item) =>
            SERVICE_TYPE_PRIORITY[
              item.delivery.serviceType?.toLowerCase() as keyof typeof SERVICE_TYPE_PRIORITY
            ] || 999,
          // Tertiary sort: by creation date ascending
          (item) => new Date(item.delivery.createdAt || 0),
        ],
        ['asc', 'asc', 'asc'],
      ),
    [clientServiceDeliveries],
  )

  if (isLoading) {
    return <ServiceDeliveriesLoadingState />
  }

  if (sortedServiceDeliveries.length === 0) {
    return <ServiceDeliveriesEmptyState clientName={clientName} />
  }

  return (
    <div className="space-y-6">
      <ServiceDeliveriesHeader count={sortedServiceDeliveries.length} />

      <div className="space-y-4">
        {sortedServiceDeliveries.map(({ delivery, tasks }) => (
          <ServiceDeliveryCard
            key={delivery.id}
            delivery={delivery}
            tasks={tasks}
            onTaskStatusChange={handleTaskStatusChange}
            updatingTaskId={updatingTaskId}
            clientId={clientId}
            clientName={clientName}
          />
        ))}
      </div>
    </div>
  )
}
