import { differenceInDays, format } from 'date-fns'
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  Clock,
  Dumbbell,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { ButtonLink } from '@/components/ui/button-link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { GQLGetTrainerServiceDeliveriesQuery } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { Client } from './clients-tabs'
import { DeliveryCountdownBadge } from './delivery-countdown-badge'

type Delivery = NonNullable<
  GQLGetTrainerServiceDeliveriesQuery['getTrainerDeliveries']
>[number]

interface ClientCardProps {
  client: Client
  deliveries?: Delivery[]
}

export default function ClientCard({
  client,
  deliveries = [],
}: ClientCardProps) {
  const daysLeft = differenceInDays(
    new Date(client.activePlan?.endDate ?? ''),
    new Date(),
  )

  const pendingDeliveries = deliveries.filter((d) => d.status !== 'COMPLETED')
  const overdueDeliveries = deliveries.filter((d) => d.isOverdue)

  return (
    <Card className="overflow-hidden py-0 gap-0">
      <CardHeader className="p-0">
        <div className="bg-primary/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative h-10 w-10 rounded-full overflow-hidden">
                <Image
                  src={client.image || '/avatar-male.png'}
                  alt={`${client.firstName} ${client.lastName}`}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold">
                  {client.firstName ?? ''} {client.lastName ?? ''}
                </h3>
                <p className="text-xs text-muted-foreground">{client.email}</p>
              </div>
            </div>
            <ButtonLink
              size="icon-sm"
              variant="ghost"
              href={`/trainer/clients/${client.id}`}
              iconOnly={<ChevronRight />}
            >
              View Profile
            </ButtonLink>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Dumbbell className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="font-medium">Current Plan:</span>
            <span className="ml-1">
              {client.activePlan?.title
                ? client.activePlan.title
                : 'No plan assigned'}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="font-medium">Last Active:</span>
            <span className="ml-1">
              {client.activePlan?.lastSessionActivity
                ? format(
                    new Date(client.activePlan.lastSessionActivity),
                    'dd MMM HH:mm',
                  )
                : 'No activity'}
            </span>
          </div>

          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="font-medium">Plan ends:</span>
            <span className="ml-1">
              {client.activePlan?.endDate
                ? `${format(new Date(client.activePlan.endDate), 'dd MMM')}`
                : 'No end date'}
            </span>
            {daysLeft > 0 && daysLeft < 7 && (
              <span className="ml-1 text-xs text-amber-500">
                {daysLeft} days left
              </span>
            )}
            {daysLeft <= 0 && (
              <span className="ml-1 text-xs text-red-500">Plan ended</span>
            )}
          </div>
        </div>

        {client.activePlan && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Progress</span>
              <span>{client.activePlan?.progress ?? 0}%</span>
            </div>
            <Progress
              value={client.activePlan?.progress ?? 0}
              className="h-2"
            />
          </div>
        )}

        {deliveries.length > 0 && (
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">Deliverables</span>
              </div>
              <div className="flex items-center gap-1">
                {overdueDeliveries.length > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {overdueDeliveries.length} overdue
                  </Badge>
                )}
                {pendingDeliveries.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {pendingDeliveries.length} pending
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {deliveries.map((delivery) => {
                const isCompleted = delivery.status === 'COMPLETED'
                const dueDate = new Date(delivery.dueDate)

                return (
                  <Link
                    key={delivery.id}
                    href={`/trainer/clients/${client.id}?tab=services`}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-xl transition-all hover:shadow-sm',
                      delivery.isOverdue && !isCompleted
                        ? 'bg-destructive/10 hover:bg-destructive/15'
                        : 'bg-muted hover:bg-muted/80',
                    )}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                      ) : delivery.isOverdue ? (
                        <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-sm font-medium truncate',
                            isCompleted && 'line-through text-muted-foreground',
                          )}
                        >
                          {delivery.deliverableLabel}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isCompleted
                            ? 'Delivered'
                            : `Due ${format(dueDate, 'MMM d')}`}
                        </p>
                      </div>
                    </div>
                    <DeliveryCountdownBadge
                      daysUntilDue={delivery.daysUntilDue}
                      isOverdue={delivery.isOverdue}
                      isCompleted={isCompleted}
                    />
                    <ChevronRight className="size-4 ml-4 text-muted-foreground flex-shrink-0" />
                  </Link>
                )
              })}

              {deliveries.length > 3 && (
                <p className="text-xs text-muted-foreground text-center py-1">
                  +{deliveries.length - 3} more
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
