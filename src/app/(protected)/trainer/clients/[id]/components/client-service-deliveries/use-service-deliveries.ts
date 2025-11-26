import { useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import {
  GQLDeliveryStatus,
  GQLGetTrainerServiceDeliveriesQuery,
  useGetTrainerServiceDeliveriesQuery,
  useUpdateServiceDeliveryMutation,
} from '@/generated/graphql-client'

export type ClientDelivery = NonNullable<
  GQLGetTrainerServiceDeliveriesQuery['getTrainerDeliveries']
>[number]

export function useServiceDeliveries(clientId: string, userId: string) {
  const queryClient = useQueryClient()
  const [updatingDeliveryId, setUpdatingDeliveryId] = useState<string | null>(
    null,
  )

  const queryKey = useGetTrainerServiceDeliveriesQuery.getKey({
    trainerId: userId,
  })

  const { data, isLoading } = useGetTrainerServiceDeliveriesQuery(
    { trainerId: userId },
    {
      enabled: !!userId,
    },
  )

  const updateMutation = useUpdateServiceDeliveryMutation()

  const clientDeliveries = useMemo(() => {
    if (!data?.getTrainerDeliveries) {
      return []
    }

    return data.getTrainerDeliveries.filter(
      (delivery) => delivery.client?.id === clientId,
    )
  }, [data, clientId])

  const handleStatusChange = async (
    deliveryId: string,
    newStatus: GQLDeliveryStatus,
  ) => {
    setUpdatingDeliveryId(deliveryId)

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
      setUpdatingDeliveryId(null)
    }
  }

  return {
    clientDeliveries,
    handleStatusChange,
    updatingDeliveryId,
    isLoading,
  }
}
