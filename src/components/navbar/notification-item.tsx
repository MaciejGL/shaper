'use client'

import { format } from 'date-fns'
import { Clock } from 'lucide-react'

import {
  GQLNotification,
  GQLNotificationType,
} from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

interface NotificationItemProps {
  notification: Pick<
    GQLNotification,
    'id' | 'read' | 'type' | 'message' | 'link' | 'createdAt'
  >
}

export function NotificationItem({ notification }: NotificationItemProps) {
  return (
    <div
      className={cn(
        'flex gap-3 p-3 w-full transition-colors',
        notification.read
          ? 'bg-white dark:bg-zinc-700'
          : 'bg-zinc-100 dark:bg-zinc-800',
        'hover:bg-zinc-200 dark:hover:bg-zinc-700',
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
            {getNotificationTitle(notification)}
          </h4>
          {!notification.read && (
            <span className="flex-shrink-0 h-2 w-2 rounded-full bg-orange-500" />
          )}
        </div>

        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 line-clamp-2">
          {notification.message}
        </p>

        {notification.createdAt && (
          <div className="flex items-center mt-1.5 text-xs text-slate-500 dark:text-zinc-400">
            <Clock className="h-3 w-3 mr-1" />
            <span>{formatTime(new Date(notification.createdAt))}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function getNotificationTitle(
  notification: Pick<GQLNotification, 'type' | 'message'>,
) {
  switch (notification.type) {
    case GQLNotificationType.CoachingRequest:
      return 'Coaching Request'
    case GQLNotificationType.CoachingRequestAccepted:
      return 'Coaching Accepted'
    case GQLNotificationType.CoachingRequestRejected:
      return 'Coaching Rejected'
    case GQLNotificationType.Message:
      return 'New Message'
    case GQLNotificationType.Reminder:
      return 'Reminder'
    case GQLNotificationType.System:
      return 'Fitspace Team'
    default:
      return null
  }
}

function formatTime(date: Date): string {
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 24) {
    return format(date, 'h:mm a')
  } else if (diffInHours < 48) {
    return 'Yesterday'
  } else {
    return format(date, 'MMM d')
  }
}
