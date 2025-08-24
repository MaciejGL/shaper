'use client'

import { formatRelative } from 'date-fns'
import { enGB } from 'date-fns/locale'
import { Clock } from 'lucide-react'

import {
  GQLNotification,
  GQLNotificationType,
} from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { Card } from '../ui/card'

interface NotificationItemProps {
  notification: Pick<
    GQLNotification,
    'id' | 'read' | 'type' | 'message' | 'link' | 'createdAt'
  >
}

export function NotificationItem({ notification }: NotificationItemProps) {
  return (
    <Card
      variant="secondary"
      className={cn(
        'flex gap-3 p-3 w-full transition-colors rounded-none',
        notification.read
          ? 'hover:bg-muted/50'
          : 'bg-muted/80 hover:bg-muted/50',
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
            {getNotificationTitle(notification) || 'New Notification'}
          </h4>
          {!notification.read && (
            <span className="flex-shrink-0 h-2 w-2 rounded-full bg-amber-500" />
          )}
        </div>

        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 line-clamp-4">
          {notification.message}
        </p>

        {notification.createdAt && (
          <div className="flex items-center mt-1.5 text-xs text-slate-500 dark:text-zinc-400">
            <Clock className="h-3 w-3 mr-1" />
            <span>
              {formatRelative(new Date(notification.createdAt), new Date(), {
                weekStartsOn: 1,
                locale: enGB,
              })}
            </span>
          </div>
        )}
      </div>
    </Card>
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
    case GQLNotificationType.NewTrainingPlanAssigned:
      return 'New Training Plan'
    case GQLNotificationType.NewMealPlanAssigned:
      return 'New Meal Plan'
    case GQLNotificationType.CollaborationInvitation:
      return 'Collaboration Invitation'
    case GQLNotificationType.CollaborationResponse:
      return 'Collaboration Response'
    case GQLNotificationType.MealPlanCollaboration:
      // Check if this is a permission update or initial collaboration
      if (
        notification.message.includes('updated your collaboration permission')
      ) {
        return 'Meal Plan Permission Updated'
      }
      return 'Meal Plan Access Granted'
    case GQLNotificationType.MealPlanCollaborationRemoved:
      return 'Meal Plan Access Removed'
    case GQLNotificationType.TrainingPlanCollaboration:
      // Check if this is a permission update or initial collaboration
      if (
        notification.message.includes('updated your collaboration permission')
      ) {
        return 'Training Plan Permission Updated'
      }
      return 'Training Plan Access Granted'
    case GQLNotificationType.TrainingPlanCollaborationRemoved:
      return 'Training Plan Access Removed'
    case GQLNotificationType.TrainerOfferReceived:
      return 'New Training Offer'

    default:
      return null
  }
}
