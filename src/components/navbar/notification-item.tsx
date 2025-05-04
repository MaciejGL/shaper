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
        notification.read ? 'bg-white' : 'bg-violet-50',
        'hover:bg-slate-50',
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-slate-900 truncate">
            {getNotificationTitle(notification)}
          </h4>
          {!notification.read && (
            <span className="flex-shrink-0 h-2 w-2 rounded-full bg-violet-500" />
          )}
        </div>

        <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
          {notification.message}
        </p>

        {notification.createdAt && (
          <div className="flex items-center mt-1.5 text-xs text-slate-500">
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
      return 'Shaper Team'
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
