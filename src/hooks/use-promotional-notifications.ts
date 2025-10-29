import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'

import { useUser } from '@/context/user-context'
import {
  GQLNotification,
  GQLNotificationType,
  useMarkNotificationAsReadMutation,
  useNotificationsQuery,
} from '@/generated/graphql-client'

import { useQuerySubscription } from './use-query-subscription'

const DISMISSED_NOTIFICATIONS_KEY = 'dismissed-promotional-toasts'

const PROMOTIONAL_NOTIFICATION_TYPES = [
  GQLNotificationType.TrainerOfferReceived,
  GQLNotificationType.CoachingRequest,
  GQLNotificationType.CoachingRequestAccepted,
  GQLNotificationType.NewTrainingPlanAssigned,
  GQLNotificationType.NewMealPlanAssigned,
]

function getDismissedNotifications(): string[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(DISMISSED_NOTIFICATIONS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function markNotificationAsDismissed(notificationId: string): void {
  if (typeof window === 'undefined') return

  try {
    const dismissed = getDismissedNotifications()
    if (!dismissed.includes(notificationId)) {
      dismissed.push(notificationId)
      localStorage.setItem(
        DISMISSED_NOTIFICATIONS_KEY,
        JSON.stringify(dismissed),
      )
    }
  } catch (error) {
    console.error('Failed to save dismissed notification:', error)
  }
}

export function usePromotionalNotifications() {
  const { user } = useUser()
  const [currentIndex, setCurrentIndex] = useState(0)
  const queryClient = useQueryClient()
  const { mutateAsync: markNotificationAsRead } =
    useMarkNotificationAsReadMutation()

  // Read from existing notifications query cache instead of creating a new query
  const queryKey = useNotificationsQuery.getKey({
    userId: user?.id || '',
    skip: 0,
    take: 10,
  })

  // Subscribe to query updates - automatically re-renders when query refetches
  const data = useQuerySubscription<{ notifications: GQLNotification[] }>(
    queryKey,
  )

  // Filter and sort promotional notifications
  const promotionalNotifications = (data?.notifications || [])
    .filter(
      (notification) =>
        PROMOTIONAL_NOTIFICATION_TYPES.includes(notification.type) &&
        !notification.read &&
        !getDismissedNotifications().includes(notification.id),
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

  const currentNotification: GQLNotification | null =
    promotionalNotifications[currentIndex] || null

  const dismissAndShowNext = useCallback(
    async (notificationId: string) => {
      // Mark as dismissed in localStorage (for backup)
      markNotificationAsDismissed(notificationId)

      // Mark as read in database
      try {
        await markNotificationAsRead({ id: notificationId })

        // Invalidate notifications query to update unread count
        if (user?.id) {
          queryClient.invalidateQueries({
            queryKey: useNotificationsQuery.getKey({ userId: user.id }),
          })
        }
      } catch (error) {
        console.error('Failed to mark notification as read:', error)
      }

      // Move to next notification in queue
      const nextIndex = currentIndex + 1
      if (nextIndex < promotionalNotifications.length) {
        setCurrentIndex(nextIndex)
      } else {
        setCurrentIndex(0)
      }
    },
    [
      currentIndex,
      promotionalNotifications.length,
      markNotificationAsRead,
      queryClient,
      user?.id,
    ],
  )

  return {
    currentNotification,
    totalPending: promotionalNotifications.length,
    dismissAndShowNext,
  }
}
