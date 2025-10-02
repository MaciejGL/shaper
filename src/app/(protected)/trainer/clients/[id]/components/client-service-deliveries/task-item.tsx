'use client'

import { Calendar, CheckCircle, Circle, Clock } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

import { ScheduleMeetingModal } from '../client-meetings/schedule-meeting-modal'

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
  clientId?: string
  clientName?: string
  serviceDeliveryId?: string
}

export function TaskItem({
  task,
  onStatusChange,
  isUpdating,
  clientId,
  clientName,
  serviceDeliveryId,
}: TaskItemProps) {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)

  return (
    <>
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
              {task.requiresScheduling && task.scheduledAt && (
                <span className="ml-2">
                  • Scheduled {new Date(task.scheduledAt).toLocaleDateString()}
                </span>
              )}
            </p>
          </div>
          {task.requiresScheduling && !task.scheduledAt && (
            <Clock className="h-4 w-4 text-accent-foreground" />
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Schedule Meeting Button */}
          {task.requiresScheduling &&
            !task.scheduledAt &&
            clientId &&
            clientName && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsScheduleModalOpen(true)}
                iconStart={<Calendar className="h-4 w-4" />}
              >
                Schedule
              </Button>
            )}

          {task.updatedAt && (
            <p className="text-xs text-muted-foreground hidden sm:block">
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

      {/* Schedule Modal */}
      {clientId && clientName && (
        <ScheduleMeetingModal
          open={isScheduleModalOpen}
          onOpenChange={setIsScheduleModalOpen}
          traineeId={clientId}
          traineeName={clientName}
          serviceDeliveryId={serviceDeliveryId}
          serviceTaskId={task.id}
        />
      )}
    </>
  )
}
