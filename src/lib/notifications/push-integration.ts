/**
 * Integration helper for push notifications with existing notification system
 *
 * This file helps integrate push notifications with your existing GraphQL notification system.
 * When you create notifications through your existing system, you can also trigger push notifications.
 */
import { sendPushNotificationToUsers } from '@/app/actions/push-notifications'
import { GQLNotificationType } from '@/generated/graphql-server'

// Map notification types to push notification content
export async function sendPushForNotification(
  userId: string,
  type: GQLNotificationType,
  message: string,
  link?: string,
) {
  const notificationMap: Record<
    GQLNotificationType,
    { title: string; icon?: string }
  > = {
    [GQLNotificationType.CoachingRequest]: {
      title: '👨‍💼 New Coaching Request',
      icon: '/favicons/android-chrome-192x192.png',
    },
    [GQLNotificationType.CoachingRequestAccepted]: {
      title: '✅ Coaching Request Accepted',
      icon: '/favicons/android-chrome-192x192.png',
    },
    [GQLNotificationType.CoachingRequestRejected]: {
      title: '❌ Coaching Request Declined',
      icon: '/favicons/android-chrome-192x192.png',
    },
    [GQLNotificationType.NewTrainingPlanAssigned]: {
      title: '🏋️ New Training Plan',
      icon: '/favicons/android-chrome-192x192.png',
    },
    [GQLNotificationType.NewMealPlanAssigned]: {
      title: '🍽️ New Meal Plan',
      icon: '/favicons/android-chrome-192x192.png',
    },
    [GQLNotificationType.CollaborationInvitation]: {
      title: '🤝 Collaboration Invitation',
      icon: '/favicons/android-chrome-192x192.png',
    },
    [GQLNotificationType.CollaborationResponse]: {
      title: '📝 Collaboration Response',
      icon: '/favicons/android-chrome-192x192.png',
    },
    [GQLNotificationType.TrainingPlanCollaboration]: {
      title: '🏋️ Training Plan Update',
      icon: '/favicons/android-chrome-192x192.png',
    },
    [GQLNotificationType.TrainingPlanCollaborationRemoved]: {
      title: '🏋️ Training Plan Access Removed',
      icon: '/favicons/android-chrome-192x192.png',
    },
    [GQLNotificationType.MealPlanCollaboration]: {
      title: '🍽️ Meal Plan Update',
      icon: '/favicons/android-chrome-192x192.png',
    },
    [GQLNotificationType.MealPlanCollaborationRemoved]: {
      title: '🍽️ Meal Plan Access Removed',
      icon: '/favicons/android-chrome-192x192.png',
    },
    [GQLNotificationType.Reminder]: {
      title: '⏰ Reminder',
      icon: '/favicons/android-chrome-192x192.png',
    },
    [GQLNotificationType.System]: {
      title: '🔔 System Notification',
      icon: '/favicons/android-chrome-192x192.png',
    },
    [GQLNotificationType.Message]: {
      title: '💬 New Message',
      icon: '/favicons/android-chrome-192x192.png',
    },
  }

  const config = notificationMap[type]
  if (!config) {
    console.warn(`No push notification config for type: ${type}`)
    return
  }

  return await sendPushNotificationToUsers(
    [userId],
    config.title,
    message,
    link,
    config.icon,
  )
}

// Bulk push notifications for multiple users
export async function sendBulkPushNotifications(
  userIds: string[],
  title: string,
  message: string,
  link?: string,
) {
  return await sendPushNotificationToUsers(userIds, title, message, link)
}

// Helper to extend your existing createNotification function
export async function createNotificationWithPush(notification: {
  userId: string
  type: GQLNotificationType
  message: string
  link?: string
  createdBy?: string
  relatedItemId?: string
}) {
  // First create the regular notification using your existing system
  // You would call your existing createNotification function here

  // Then send push notification
  await sendPushForNotification(
    notification.userId,
    notification.type,
    notification.message,
    notification.link,
  )
}

// Workout reminder helper
export async function sendWorkoutReminderPush(
  userId: string,
  workoutName: string,
  scheduledTime?: string,
) {
  const message = scheduledTime
    ? `Your ${workoutName} workout is scheduled for ${scheduledTime}. Ready to get stronger? 💪`
    : `Time for your ${workoutName} workout! Ready to get stronger? 💪`

  return await sendPushNotificationToUsers(
    [userId],
    '🏋️ Workout Reminder',
    message,
    '/fitspace/workouts',
  )
}

// Meal reminder helper
export async function sendMealReminderPush(
  userId: string,
  mealName: string,
  scheduledTime?: string,
) {
  const message = scheduledTime
    ? `Time to log your ${mealName}! Scheduled for ${scheduledTime}. 🍽️`
    : `Don't forget to log your ${mealName}! 🍽️`

  return await sendPushNotificationToUsers(
    [userId],
    '🍽️ Meal Reminder',
    message,
    '/fitspace/nutrition',
  )
}
