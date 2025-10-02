/**
 * Integration helper for push notifications with existing notification system
 *
 * This file helps integrate push notifications with your existing GraphQL notification system.
 * When you create notifications through your existing system, you can also trigger push notifications.
 */
import { GQLNotificationType } from '@/generated/graphql-server'

import {
  notifyCoachingCancelled,
  notifyCoachingRequest,
  notifyCoachingRequestAccepted,
  notifyCoachingRequestRejected,
  notifyExerciseCommentReply,
  notifyMealPlanAssigned,
  notifyMeetingReminder,
  notifyNewMessage,
  notifyPlanCompleted,
  notifySystemAnnouncement,
  notifyTeamInvitation,
  notifyTrainerExerciseNote,
  notifyTrainerOfferReceived,
  notifyTrainerWorkoutCompleted,
  notifyTrainingPlanAssigned,
  notifyWorkoutCompleted,
} from './push-notification-service'
// Legacy helper functions - use centralized service instead
import {
  notifyTrainerBodyProgressShared,
  notifyWorkoutReminder,
  sendBatchNotifications,
} from './push-notification-service'

// Map notification types to specific push notification functions
export async function sendPushForNotification(
  userId: string,
  type: GQLNotificationType,
  message: string,
  link?: string,
  additionalData?: {
    senderName?: string
    planTitle?: string
    workoutType?: string
    noteText?: string
    clientName?: string
    clientId?: string
    trainerName?: string
    packageDescription?: string
    offerToken?: string
    teamName?: string
  },
) {
  if ('development' === process.env.NODE_ENV) {
    userId = 'cma8vis7c0004uh392ewu2vnb'
  }

  try {
    switch (type) {
      case GQLNotificationType.MeetingReminder:
        return await notifyMeetingReminder(
          userId,
          message,
          'soon',
          additionalData?.trainerName || 'your trainer',
        )

      case GQLNotificationType.CoachingRequest:
        return await notifyCoachingRequest(
          userId,
          additionalData?.senderName || 'Someone',
        )

      case GQLNotificationType.CoachingRequestAccepted:
        return await notifyCoachingRequestAccepted(
          userId,
          additionalData?.senderName || 'Someone',
        )

      case GQLNotificationType.CoachingRequestRejected:
        return await notifyCoachingRequestRejected(
          userId,
          additionalData?.senderName || 'Someone',
        )

      case GQLNotificationType.CoachingCancelled:
        return await notifyCoachingCancelled(
          userId,
          additionalData?.clientName || 'Someone',
        )

      case GQLNotificationType.NewTrainingPlanAssigned:
        return await notifyTrainingPlanAssigned(
          userId,
          additionalData?.planTitle || 'Training Plan',
          additionalData?.senderName,
        )

      case GQLNotificationType.NewMealPlanAssigned:
        return await notifyMealPlanAssigned(
          userId,
          additionalData?.planTitle || 'Meal Plan',
          additionalData?.senderName,
        )

      // New coaching-related notifications
      case GQLNotificationType.WorkoutCompleted:
        return await notifyWorkoutCompleted(userId, additionalData?.workoutType)

      case GQLNotificationType.PlanCompleted:
        return await notifyPlanCompleted(
          userId,
          additionalData?.planTitle || 'Training Plan',
        )

      case GQLNotificationType.ExerciseNoteAdded:
        return await notifyTrainerExerciseNote(
          userId,
          additionalData?.clientName || 'Client',
          additionalData?.noteText || 'Added a note to their exercise',
        )

      case GQLNotificationType.ExerciseNoteReply:
        return await notifyExerciseCommentReply(
          userId,
          additionalData?.senderName || 'Someone',
          additionalData?.noteText || 'Replied to your exercise note',
        )

      case GQLNotificationType.TrainerWorkoutCompleted:
        return await notifyTrainerWorkoutCompleted(
          userId,
          additionalData?.clientName || 'Client',
          additionalData?.workoutType,
        )

      case GQLNotificationType.TrainerOfferReceived:
        return await notifyTrainerOfferReceived(
          userId,
          additionalData?.trainerName || 'Your trainer',
          additionalData?.packageDescription || 'training package',
          additionalData?.offerToken || '',
        )

      case GQLNotificationType.TeamInvitation:
        return await notifyTeamInvitation(
          userId,
          additionalData?.senderName || 'Someone',
          additionalData?.teamName || 'a team',
        )
      case GQLNotificationType.Message:
        return await notifyNewMessage(
          userId,
          additionalData?.senderName || '',
          message,
        )

      case GQLNotificationType.BodyProgressShared:
        return await notifyTrainerBodyProgressShared(
          userId,
          additionalData?.clientName || 'Client',
          additionalData?.clientId || '',
        )

      case GQLNotificationType.System:
      case GQLNotificationType.Reminder:
        return await notifySystemAnnouncement([userId], 'Notification', message)

      default:
        console.warn(`No push notification handler for type: ${type}`)
        return await notifySystemAnnouncement([userId], 'Notification', message)
    }
  } catch (error) {
    console.error('Error sending push notification:', error)
    return { success: false, error: 'Failed to send push notification' }
  }
}

/**
 * @deprecated Use sendBatchNotifications from push-notification-service instead
 */
export async function sendBulkPushNotifications(
  userIds: string[],
  title: string,
  message: string,
  link?: string,
) {
  return await sendBatchNotifications([
    {
      userIds,
      title,
      message,
      url: link,
    },
  ])
}

/**
 * @deprecated Use specific notification functions from push-notification-service instead
 */
export async function sendWorkoutReminderPush(
  userId: string,
  workoutName: string,
  scheduledTime?: string,
) {
  return await notifyWorkoutReminder(userId, workoutName, scheduledTime)
}
