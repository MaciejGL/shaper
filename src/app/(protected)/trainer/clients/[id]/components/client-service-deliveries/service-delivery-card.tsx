'use client'

import { CheckCircle, Circle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GQLGetTrainerServiceDeliveriesQuery } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { TaskItem } from './task-item'

interface TaskWithDelivery {
  id: string
  title: string
  status: string
  taskType: string
  requiresScheduling?: boolean
  scheduledAt?: string | null
  updatedAt: string
  serviceDelivery: {
    packageName: string
    serviceType: string
  }
}

interface ServiceDeliveryCardProps {
  delivery: NonNullable<
    GQLGetTrainerServiceDeliveriesQuery['getTrainerDeliveries']
  >[number]
  tasks: TaskWithDelivery[]
  onTaskStatusChange: (taskId: string, newStatus: string) => void
  updatingTaskId: string | null
}

export function ServiceDeliveryCard({
  delivery,
  tasks,
  onTaskStatusChange,
  updatingTaskId,
}: ServiceDeliveryCardProps) {
  const completedTasks = tasks.filter(
    (task) => task.status === 'COMPLETED',
  ).length
  const totalTasks = tasks.length
  const isCompleted = completedTasks === totalTasks

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isCompleted ? (
              <CheckCircle className="h-5 w-5 text-success" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <CardTitle
                className={cn(
                  'text-lg',
                  isCompleted ? 'line-through text-muted-foreground' : '',
                )}
              >
                {delivery.packageName}
              </CardTitle>
              <p className="text-sm text-muted-foreground capitalize">
                {delivery.serviceType?.replaceAll('_', ' ')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {completedTasks}/{totalTasks} completed
            </Badge>
            {isCompleted && <Badge variant="success">Complete</Badge>}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Tasks are ordered by backend: status (PENDING first), order field, createdAt */}
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onStatusChange={onTaskStatusChange}
              isUpdating={updatingTaskId === task.id}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
