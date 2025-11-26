'use client'

import { format, formatDistanceToNow } from 'date-fns'
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock,
  User,
} from 'lucide-react'
import { useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ButtonLink } from '@/components/ui/button-link'
import { Card, CardContent } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GQLDeliveryStatus, GQLTaskStatus } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { Delivery } from './types'

interface DeliverableCardProps {
  delivery: Delivery
  onStatusChange: (deliveryId: string, status: GQLDeliveryStatus) => void
  onTaskStatusChange?: (taskId: string, status: GQLTaskStatus) => void
  isUpdating: boolean
}

export function DeliverableCard({
  delivery,
  onStatusChange,
  onTaskStatusChange,
  isUpdating,
}: DeliverableCardProps) {
  const [isTasksOpen, setIsTasksOpen] = useState(false)
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

  const hasTasks = delivery.tasks && delivery.tasks.length > 0
  const taskProgress = delivery.taskProgress ?? 0

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

          <div className="flex-1 min-w-0 space-y-2">
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

            {hasTasks && (
              <Collapsible open={isTasksOpen} onOpenChange={setIsTasksOpen}>
                <div className="flex items-center gap-2">
                  <Progress value={taskProgress} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground shrink-0">
                    {delivery.completedTaskCount}/{delivery.totalTaskCount}
                  </span>
                  <CollapsibleTrigger className="p-1 hover:bg-muted rounded">
                    <ChevronDown
                      className={cn(
                        'size-4 transition-transform',
                        isTasksOpen && 'rotate-180',
                      )}
                    />
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="pt-2">
                  <div className="space-y-1 pl-1">
                    {delivery.tasks?.map((task) => {
                      const isTaskCompleted =
                        task.status === GQLTaskStatus.Completed
                      return (
                        <button
                          key={task.id}
                          className={cn(
                            'flex items-center gap-2 w-full text-left py-1 px-2 rounded hover:bg-muted/50 transition-colors',
                            isUpdating && 'pointer-events-none opacity-50',
                          )}
                          onClick={() =>
                            onTaskStatusChange?.(
                              task.id,
                              isTaskCompleted
                                ? GQLTaskStatus.Pending
                                : GQLTaskStatus.Completed,
                            )
                          }
                        >
                          {isTaskCompleted ? (
                            <CheckCircle2 className="size-4 text-primary shrink-0" />
                          ) : (
                            <Circle className="size-4 text-muted-foreground shrink-0" />
                          )}
                          <span
                            className={cn(
                              'text-sm flex-1',
                              isTaskCompleted &&
                                'line-through text-muted-foreground',
                            )}
                          >
                            {task.title}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            <div className="flex items-center justify-between gap-2 pt-1">
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
