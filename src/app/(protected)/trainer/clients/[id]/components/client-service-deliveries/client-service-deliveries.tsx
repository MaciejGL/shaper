'use client'

import { orderBy } from 'lodash'
import { useMemo } from 'react'

import { useUser } from '@/context/user-context'
import { GQLDeliveryStatus } from '@/generated/graphql-client'

import { ServiceDeliveriesEmptyState } from './service-deliveries-empty-state'
import { ServiceDeliveriesHeader } from './service-deliveries-header'
import { ServiceDeliveriesLoadingState } from './service-deliveries-loading-state'
import { ServiceDeliveryCard } from './service-delivery-card'
import { useServiceDeliveries } from './use-service-deliveries'

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
    clientDeliveries,
    handleStatusChange,
    updatingDeliveryId,
    isLoading,
  } = useServiceDeliveries(clientId, user?.id || '')

  const sortedDeliveries = useMemo(
    () =>
      orderBy(
        clientDeliveries,
        [
          (d) => d.status === GQLDeliveryStatus.Completed,
          (d) => (d.isOverdue ? -1 : d.daysUntilDue),
          (d) => new Date(d.createdAt),
        ],
        ['asc', 'asc', 'desc'],
      ),
    [clientDeliveries],
  )

  if (isLoading) {
    return <ServiceDeliveriesLoadingState />
  }

  if (sortedDeliveries.length === 0) {
    return <ServiceDeliveriesEmptyState clientName={clientName} />
  }

  return (
    <div className="space-y-6">
      <ServiceDeliveriesHeader count={sortedDeliveries.length} />

      <div className="space-y-4">
        {sortedDeliveries.map((delivery) => (
          <ServiceDeliveryCard
            key={delivery.id}
            delivery={delivery}
            onStatusChange={handleStatusChange}
            isUpdating={updatingDeliveryId === delivery.id}
          />
        ))}
      </div>
    </div>
  )
}
