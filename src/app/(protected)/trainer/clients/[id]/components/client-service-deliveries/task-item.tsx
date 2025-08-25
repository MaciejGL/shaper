'use client'

import { CheckCircle, Circle, Clock } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GQLTaskStatus } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

interface TaskItemProps {
  task: {
    id: string
    title: string
    status: string
    taskType: string
    requiresScheduling?: boolean
    scheduledAt?: string | null
    updatedAt: string
  }
  onStatusChange: (taskId: string, newStatus: string) => void
  isUpdating: boolean
}

export function TaskItem({ task, onStatusChange, isUpdating }: TaskItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {task.status === 'COMPLETED' ? (
          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
        ) : (
          <Circle
            className={cn('h-4 w-4 flex-shrink-0', {
              'text-green-600': task.status === 'COMPLETED',
              'text-amber-600': task.status === 'IN_PROGRESS',
              'text-muted-foreground': task.status === 'PENDING',
              'text-red-600': task.status === 'CANCELLED',
            })}
          />
        )}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'font-medium text-sm',
              task.status === 'COMPLETED'
                ? 'text-muted-foreground'
                : 'text-foreground',
            )}
          >
            {task.title}
          </p>
          <p className="text-xs text-muted-foreground capitalize">
            {task.taskType.replaceAll('_', ' ')}
          </p>
        </div>
        {task.requiresScheduling && !task.scheduledAt && (
          <Clock className="h-4 w-4 text-accent-foreground" />
        )}
      </div>

      <div className="flex items-center gap-2">
        {task.updatedAt && (
          <p className="text-xs text-muted-foreground">
            Updated{' '}
            {new Date(task.updatedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
        <Select
          value={task.status}
          onValueChange={(value) => onStatusChange(task.id, value)}
          disabled={isUpdating}
        >
          <SelectTrigger className="w-32" variant="ghost">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
