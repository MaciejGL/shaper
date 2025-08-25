'use client'

import { formatDate } from 'date-fns'
import { CheckCircle, Circle, Package } from 'lucide-react'

import { Loader } from '@/components/loader'
import { Badge, BadgeProps } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  GQLDeliveryStatus,
  GQLFitGetMyServiceDeliveriesQuery,
  useFitGetMyServiceDeliveriesQuery,
} from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

interface ClientServiceDeliveriesSectionProps {
  trainerId: string
}

export function ClientServiceDeliveriesSection({
  trainerId,
}: ClientServiceDeliveriesSectionProps) {
  const { data, isLoading } = useFitGetMyServiceDeliveriesQuery({})

  const serviceDeliveries = data?.getMyServiceDeliveries || []

  // Filter deliveries for the current trainer
  const trainerDeliveries = serviceDeliveries.filter(
    (delivery) => delivery.trainer?.id === trainerId,
  )

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (trainerDeliveries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Service Deliveries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              No service deliveries from your trainer yet.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Service Deliveries
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {trainerDeliveries.map((delivery) => (
          <ServiceDeliveryItem key={delivery.id} delivery={delivery} />
        ))}
      </CardContent>
    </Card>
  )
}

interface ServiceDeliveryItemProps {
  delivery: GQLFitGetMyServiceDeliveriesQuery['getMyServiceDeliveries'][number]
}

function ServiceDeliveryItem({ delivery }: ServiceDeliveryItemProps) {
  const getStatusColor = (status: GQLDeliveryStatus): BadgeProps['variant'] => {
    switch (status) {
      case GQLDeliveryStatus.Completed:
        return 'success'
      case GQLDeliveryStatus.InProgress:
        return 'warning'
      case GQLDeliveryStatus.Pending:
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case GQLDeliveryStatus.Completed:
        return 'Completed'
      case GQLDeliveryStatus.InProgress:
        return 'In Progress'
      case GQLDeliveryStatus.Pending:
        return 'Pending'
      default:
        return status
    }
  }

  const isCompleted = delivery.status === GQLDeliveryStatus.Completed

  return (
    <Card className="flex flex-row items-start gap-3 p-4 border rounded-lg">
      <div className="flex-shrink-0 mt-1">
        {isCompleted ? (
          <CheckCircle className="h-5 w-5 text-success" />
        ) : (
          <Circle
            className={cn('h-5 w-5', {
              'text-muted-foreground':
                delivery.status === GQLDeliveryStatus.Pending,
              'text-success': delivery.status === GQLDeliveryStatus.Completed,
              'text-amber-600':
                delivery.status === GQLDeliveryStatus.InProgress,
            })}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3
              className={cn(
                'font-medium',
                isCompleted ? 'line-through text-muted-foreground' : '',
              )}
            >
              {delivery.packageName}
            </h3>
            <p className="text-sm text-muted-foreground capitalize">
              {delivery.serviceType?.replaceAll('_', ' ')}
            </p>
            {delivery.quantity && delivery.quantity > 1 && (
              <p className="text-xs text-muted-foreground">
                Quantity: {delivery.quantity}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge variant={getStatusColor(delivery.status)}>
              {getStatusText(delivery.status)}
            </Badge>

            <div className="text-xs text-muted-foreground text-right">
              <p>
                Ordered{' '}
                <span className="font-medium whitespace-nowrap">
                  {formatDate(new Date(delivery.createdAt), 'MMM d, yyyy')}
                </span>
              </p>
              {delivery.deliveredAt && (
                <p>
                  Delivered{' '}
                  <span className="font-medium whitespace-nowrap">
                    {formatDate(new Date(delivery.deliveredAt), 'MMM d, yyyy')}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        {delivery.deliveryNotes && (
          <div className="mt-3 p-3 bg-muted/50 rounded-md">
            <p className="text-sm">{delivery.deliveryNotes}</p>
          </div>
        )}
      </div>
    </Card>
  )
}
