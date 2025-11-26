'use client'

import { format, formatDistanceToNow } from 'date-fns'
import { AlertCircle, Calendar, CheckCircle2, Clock, User } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ButtonLink } from '@/components/ui/button-link'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GQLDeliveryStatus } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { Delivery } from './types'

interface DeliverableCardProps {
  delivery: Delivery
  onStatusChange: (deliveryId: string, status: GQLDeliveryStatus) => void
  isUpdating: boolean
}

export function DeliverableCard({
  delivery,
  onStatusChange,
  isUpdating,
}: DeliverableCardProps) {
  const isCompleted = delivery.status === GQLDeliveryStatus.Completed
  const clientName =
    delivery.client?.name || delivery.client?.email || 'Unknown'
  const clientInitials = clientName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const dueDate = new Date(delivery.dueDate)
  const dueDateFormatted = format(dueDate, 'MMM d')
  const dueTimeAgo = formatDistanceToNow(dueDate, { addSuffix: true })

  return (
    <Card
      className={cn(
        'transition-all',
        isCompleted && 'opacity-60',
        delivery.isOverdue && !isCompleted && 'border-destructive/50',
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="size-10 shrink-0">
            <AvatarImage
              src={delivery.client?.image || undefined}
              alt={clientName}
            />
            <AvatarFallback className="text-xs">
              {clientInitials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p
                  className={cn(
                    'font-medium truncate',
                    isCompleted && 'line-through text-muted-foreground',
                  )}
                >
                  {delivery.deliverableLabel}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {clientName} - {delivery.packageName}
                </p>
              </div>

              <DueDateBadge
                isOverdue={delivery.isOverdue}
                daysUntilDue={delivery.daysUntilDue}
                dueDateFormatted={dueDateFormatted}
                dueTimeAgo={dueTimeAgo}
                isCompleted={isCompleted}
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <ButtonLink
                variant="ghost"
                size="sm"
                href={`/trainer/clients/${delivery.client?.id}`}
                iconStart={<User className="size-3" />}
                className="text-xs h-7 px-2"
              >
                View Client
              </ButtonLink>

              <Select
                value={delivery.status}
                onValueChange={(value) =>
                  onStatusChange(delivery.id, value as GQLDeliveryStatus)
                }
                disabled={isUpdating}
              >
                <SelectTrigger className="w-32 h-8" variant="ghost">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={GQLDeliveryStatus.Pending}>
                    Pending
                  </SelectItem>
                  <SelectItem value={GQLDeliveryStatus.InProgress}>
                    In Progress
                  </SelectItem>
                  <SelectItem value={GQLDeliveryStatus.Completed}>
                    Completed
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DueDateBadge({
  isOverdue,
  daysUntilDue,
  dueDateFormatted,
  dueTimeAgo,
  isCompleted,
}: {
  isOverdue: boolean
  daysUntilDue: number
  dueDateFormatted: string
  dueTimeAgo: string
  isCompleted: boolean
}) {
  if (isCompleted) {
    return (
      <Badge variant="success" className="shrink-0">
        <CheckCircle2 className="size-3 mr-1" />
        Done
      </Badge>
    )
  }

  if (isOverdue) {
    return (
      <Badge variant="destructive" className="shrink-0">
        <AlertCircle className="size-3 mr-1" />
        Overdue
      </Badge>
    )
  }

  if (daysUntilDue === 0) {
    return (
      <Badge variant="warning" className="shrink-0">
        <Clock className="size-3 mr-1" />
        Due today
      </Badge>
    )
  }

  if (daysUntilDue <= 2) {
    return (
      <Badge variant="warning" className="shrink-0">
        <Calendar className="size-3 mr-1" />
        {dueTimeAgo}
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="shrink-0">
      <Calendar className="size-3 mr-1" />
      {dueDateFormatted}
    </Badge>
  )
}
