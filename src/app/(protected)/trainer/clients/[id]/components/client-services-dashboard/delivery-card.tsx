import { format } from 'date-fns'
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
} from 'lucide-react'
import { useState } from 'react'

import { Loader } from '@/components/loader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

import { Delivery, Task } from './types'

interface DeliveryCardProps {
  delivery: Delivery
  onStatusChange: (id: string, status: GQLDeliveryStatus) => void
  onTaskToggle: (
    taskId: string,
    currentStatus: GQLTaskStatus,
    deliveryId: string,
  ) => void
  updatingId: string | null
}

export function DeliveryCard({
  delivery,
  onStatusChange,
  onTaskToggle,
  updatingId,
}: DeliveryCardProps) {
  const isCompleted = delivery.status === GQLDeliveryStatus.Completed
  const hasTasks = delivery.tasks && delivery.tasks.length > 0
  const progress = delivery.taskProgress ?? 0
  const allTasksCompleted = progress === 100
  const isDeliveryUpdating = updatingId === delivery.id

  const [expanded, setExpanded] = useState(!allTasksCompleted && hasTasks)

  return (
    <div
      className={cn(
        'border rounded-lg transition-all',
        delivery.isOverdue &&
          !isCompleted &&
          'border-destructive/50 bg-destructive/5',
      )}
    >
      <div className="p-3">
        <div className="flex items-start gap-3">
          {/* Status Icon */}
          <div className="pt-0.5">
            {isCompleted ? (
              <CheckCircle2 className="size-5 text-primary" />
            ) : delivery.isOverdue ? (
              <AlertCircle className="size-5 text-destructive" />
            ) : (
              <Clock className="size-5 text-muted-foreground" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className={cn('font-medium text-sm')}>
                  {delivery.deliverableLabel}
                </p>
                <p className="text-xs text-muted-foreground">
                  {delivery.packageName}
                </p>
              </div>
              <StatusBadge delivery={delivery} />
            </div>

            {/* Progress bar for tasks */}
            {hasTasks && !isCompleted && (
              <div className="flex items-center gap-2 mt-2">
                <Progress value={progress} className="h-1.5 flex-1" />
                <span className="text-xs text-muted-foreground">
                  {delivery.completedTaskCount}/{delivery.totalTaskCount}
                </span>
              </div>
            )}

            {/* Actions row */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1">
                {hasTasks && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setExpanded(!expanded)}
                    iconEnd={
                      <ChevronRight
                        className={cn(
                          'size-3 transition-transform',
                          expanded && 'rotate-90',
                        )}
                      />
                    }
                  >
                    Tasks
                  </Button>
                )}
              </div>

              <Select
                value={delivery.status}
                onValueChange={(v) =>
                  onStatusChange(delivery.id, v as GQLDeliveryStatus)
                }
                disabled={isDeliveryUpdating}
              >
                <SelectTrigger className="h-7 text-xs" variant="outline">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={GQLDeliveryStatus.Pending}>
                    Not Started
                  </SelectItem>
                  <SelectItem value={GQLDeliveryStatus.InProgress}>
                    Doing
                  </SelectItem>
                  <SelectItem value={GQLDeliveryStatus.Completed}>
                    Completed
                  </SelectItem>
                  <SelectItem value={GQLDeliveryStatus.Cancelled}>
                    Cancelled
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded tasks */}
      {expanded && hasTasks && (
        <div className="border-t px-3 py-2 bg-card-on-card">
          <div className="space-y-1">
            {delivery.tasks?.map((task: Task) => {
              const isTaskDone = task.status === GQLTaskStatus.Completed
              const isTaskUpdating = updatingId === task.id
              return (
                <button
                  key={task.id}
                  className={cn(
                    'flex items-center gap-2 w-full text-left py-1.5 px-2 rounded hover:bg-muted transition-colors text-sm',
                    isTaskUpdating && 'pointer-events-none opacity-50',
                  )}
                  onClick={() =>
                    onTaskToggle(task.id, task.status, delivery.id)
                  }
                  disabled={isTaskUpdating}
                >
                  {isTaskUpdating ? (
                    <div className="size-4 shrink-0">
                      <Loader />
                    </div>
                  ) : isTaskDone ? (
                    <CheckCircle2 className="size-4 text-primary shrink-0" />
                  ) : (
                    <Circle className="size-4 text-muted-foreground shrink-0" />
                  )}
                  <span
                    className={cn(
                      'flex-1',
                      isTaskDone && 'line-through text-muted-foreground',
                    )}
                  >
                    {task.title}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ delivery }: { delivery: Delivery }) {
  if (delivery.status === GQLDeliveryStatus.Completed) {
    return (
      <Badge variant="success" className="text-xs">
        Done
      </Badge>
    )
  }
  if (delivery.isOverdue) {
    return (
      <Badge variant="destructive" className="text-xs">
        Overdue
      </Badge>
    )
  }
  if (delivery.daysUntilDue === 0) {
    return (
      <Badge variant="warning" className="text-xs">
        Due today
      </Badge>
    )
  }
  if (delivery.daysUntilDue <= 2) {
    return (
      <Badge variant="warning" className="text-xs">
        {delivery.daysUntilDue}d left
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="text-xs">
      {format(new Date(delivery.dueDate), 'MMM d')}
    </Badge>
  )
}
