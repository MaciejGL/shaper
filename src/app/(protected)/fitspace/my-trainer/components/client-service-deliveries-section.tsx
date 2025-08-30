'use client'

import { formatDate } from 'date-fns'
import { CheckCircle, Package } from 'lucide-react'

import { LoadingSkeleton } from '@/components/loading-skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
      <Card borderless>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Purchased Services
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <LoadingSkeleton count={3} withBorder />
        </CardContent>
      </Card>
    )
  }

  if (trainerDeliveries.length === 0) {
    return (
      <Card borderless>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            No services purchased yet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
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
    <Card borderless>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Purchased Services
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
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
  const isCompleted = delivery.status === GQLDeliveryStatus.Completed

  return (
    <Card>
      <CardContent className="flex flex-row gap-3">
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              'font-medium',
              isCompleted ? 'text-muted-foreground' : '',
            )}
          >
            {delivery.packageName.replaceAll('[TEST]', ' ')}
          </h3>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <p>
          Ordered{' '}
          <span className="font-medium whitespace-nowrap">
            {formatDate(new Date(delivery.createdAt), 'd. MMM yyyy')}
          </span>
        </p>

        {(delivery.status === GQLDeliveryStatus.Pending ||
          delivery.status === GQLDeliveryStatus.InProgress) && (
          <Badge variant="secondary">In progress</Badge>
        )}

        {delivery.status === GQLDeliveryStatus.Cancelled && (
          <Badge variant="secondary">Cancelled</Badge>
        )}
        {isCompleted && delivery.deliveredAt && (
          <Badge variant="secondary">
            <CheckCircle className="text-green-500 mr-1" />
            {formatDate(new Date(delivery.deliveredAt), 'd. MMM yyyy')}
          </Badge>
        )}
      </CardFooter>
    </Card>
  )
}
