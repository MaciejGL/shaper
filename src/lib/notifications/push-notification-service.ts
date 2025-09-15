/**
 * Centralized Push Notification Service
 *
 * This file contains all push notification logic for the Shaper app.
 * Import specific functions where needed to trigger notifications.
 */
import { sendPushNotificationToUsers } from '@/app/actions/push-notifications'

// ================================
// COACHING & COLLABORATION
// ================================

/**
 * Send push notification when new message is received
 */
export async function notifyNewMessage(
  recipientId: string,
  senderName: string,
  message: string,
) {
  return await sendPushNotificationToUsers(
    [recipientId],
    `New message${senderName ? ` from ${senderName}` : ''}`,
    message,
    '/fitspace/messages',
  )
}

/**
 * Send push notification when coaching request is received
 */
export async function notifyCoachingRequest(
  recipientId: string,
  senderName: string,
) {
  return await sendPushNotificationToUsers(
    [recipientId],
    'New coaching request',
    `You have a new coaching request${senderName ? ` from ${senderName}` : ''}.`,
    '/fitspace/my-trainer',
  )
}

/**
 * Send push notification when coaching request is accepted
 */
export async function notifyCoachingRequestAccepted(
  senderId: string,
  acceptorName: string,
) {
  return await sendPushNotificationToUsers(
    [senderId],
    'Coaching request accepted',
    `${acceptorName} has accepted your coaching request.`,
    '/fitspace/my-trainer',
  )
}

/**
 * Send push notification when coaching request is rejected
 */
export async function notifyCoachingRequestRejected(
  senderId: string,
  rejectorName: string,
) {
  return await sendPushNotificationToUsers(
    [senderId],
    'Coaching request declined',
    `${rejectorName} has declined your coaching request.`,
  )
}

/**
 * Send push notification when client cancels coaching relationship
 */
export async function notifyCoachingCancelled(
  trainerId: string,
  clientName: string,
) {
  return await sendPushNotificationToUsers(
    [trainerId],
    'Coaching relationship ended',
    `${clientName} has ended their coaching relationship with you.`,
    '/fitspace/clients',
  )
}

// ================================
// PLAN ASSIGNMENTS
// ================================

/**
 * Send push notification when training plan is assigned
 */
export async function notifyTrainingPlanAssigned(
  clientId: string,
  planTitle: string,
  trainerName?: string,
) {
  return await sendPushNotificationToUsers(
    [clientId],
    'New training plan assigned',
    `"${planTitle}" has been assigned to you${trainerName ? ` by ${trainerName}` : ''}.`,
    '/fitspace/my-plans',
  )
}

/**
 * Send push notification when meal plan is assigned
 */
export async function notifyMealPlanAssigned(
  clientId: string,
  planTitle: string,
  trainerName?: string,
) {
  return await sendPushNotificationToUsers(
    [clientId],
    'New meal plan assigned',
    `"${planTitle}" has been assigned to you${trainerName ? ` by ${trainerName}` : ''}.`,
    '/fitspace/meal-plan',
  )
}

// ================================
// WORKOUT ACHIEVEMENTS
// ================================

/**
 * Send push notification when client completes workout (to trainer)
 */
export async function notifyTrainerWorkoutCompleted(
  trainerId: string,
  clientName: string,
  workoutType?: string,
) {
  const workoutDetail = workoutType ? ` (${workoutType})` : ''
  return await sendPushNotificationToUsers(
    [trainerId],
    'Client workout completed',
    `${clientName} has completed their workout${workoutDetail}.`,
    '/trainer/clients',
  )
}

/**
 * Send push notification when user completes workout (to user)
 */
export async function notifyWorkoutCompleted(
  userId: string,
  workoutType?: string,
) {
  const workoutDetail = workoutType ? ` ${workoutType}` : ''
  return await sendPushNotificationToUsers(
    [userId],
    'Workout completed',
    `You have completed your${workoutDetail} workout.`,
    '/fitspace/progress',
  )
}

/**
 * Send push notification for workout streaks
 */
export async function notifyWorkoutStreak(userId: string, streakDays: number) {
  return await sendPushNotificationToUsers(
    [userId],
    `${streakDays}-day workout streak`,
    `You have completed ${streakDays} consecutive days of training.`,
    '/fitspace/progress',
  )
}

/**
 * Send push notification when week is completed
 */
export async function notifyWeekCompleted(
  userId: string,
  weekNumber: number,
  planTitle: string,
) {
  return await sendPushNotificationToUsers(
    [userId],
    'Week completed',
    `You have completed week ${weekNumber} of "${planTitle}".`,
    '/fitspace/progress',
  )
}

/**
 * Send push notification when entire plan is completed
 */
export async function notifyPlanCompleted(userId: string, planTitle: string) {
  return await sendPushNotificationToUsers(
    [userId],
    'Training plan completed',
    `You have completed "${planTitle}".`,
    '/fitspace/progress',
  )
}

// ================================
// EXERCISE COMMENTS & NOTES
// ================================

/**
 * Send push notification when exercise comment is replied to
 */
export async function notifyExerciseCommentReply(
  recipientId: string,
  replierName: string,
  replyText: string,
) {
  const truncatedText =
    replyText.length > 50 ? `${replyText.substring(0, 50)}...` : replyText
  return await sendPushNotificationToUsers(
    [recipientId],
    'Exercise comment reply',
    `${replierName} replied to your exercise note: "${truncatedText}"`,
    '/fitspace/workout',
  )
}

/**
 * Send push notification when client adds exercise note (to trainer)
 */
export async function notifyTrainerExerciseNote(
  trainerId: string,
  clientName: string,
  noteText: string,
) {
  const truncatedText =
    noteText.length > 50 ? `${noteText.substring(0, 50)}...` : noteText
  return await sendPushNotificationToUsers(
    [trainerId],
    'Exercise note added',
    `${clientName} added a note to their exercise: "${truncatedText}"`,
    '/trainer/clients',
  )
}

/**
 * Send push notification when trainer replies to client's exercise note
 */
export async function notifyClientTrainerReply(
  clientId: string,
  trainerName: string,
  replyText: string,
) {
  const truncatedText =
    replyText.length > 50 ? `${replyText.substring(0, 50)}...` : replyText
  return await sendPushNotificationToUsers(
    [clientId],
    'Trainer reply',
    `${trainerName} responded to your exercise note: "${truncatedText}"`,
    '/fitspace/workout',
  )
}

/**
 * Send push notification when trainer shares a note with client
 */
export async function notifyClientTrainerNote(
  clientId: string,
  trainerName: string,
  noteText: string,
) {
  const truncatedText =
    noteText.length > 50 ? `${noteText.substring(0, 50)}...` : noteText
  return await sendPushNotificationToUsers(
    [clientId],
    'Trainer note shared',
    `${trainerName} shared a note with you: "${truncatedText}"`,
    '/fitspace/my-trainer',
  )
}

/**
 * Send push notification when client shares body progress snapshots with trainer
 */
export async function notifyTrainerBodyProgressShared(
  trainerId: string,
  clientName: string,
  clientId: string,
) {
  return await sendPushNotificationToUsers(
    [trainerId],
    '📸 New Progress Snapshot',
    `${clientName} shared new body progress snapshots with you`,
    `/trainer/clients/${clientId}?tab=body-progress-logs`,
  )
}

// ================================
// REMINDERS & MOTIVATION
// ================================

/**
 * Send push notification for workout reminders
 */
export async function notifyWorkoutReminder(
  userId: string,
  workoutName: string,
  scheduledTime?: string,
) {
  const timeDetail = scheduledTime ? ` scheduled for ${scheduledTime}` : ''
  return await sendPushNotificationToUsers(
    [userId],
    'Workout reminder',
    `Time for your ${workoutName} workout${timeDetail}.`,
    '/fitspace/workout',
  )
}

/**
 * Send push notification for rest day reminders
 */
export async function notifyRestDay(userId: string) {
  return await sendPushNotificationToUsers(
    [userId],
    'Rest day',
    'Today is your scheduled rest day. Consider light activity or stretching for recovery.',
    '/fitspace/progress',
  )
}

/**
 * Send push notification for weekly progress summary
 */
export async function notifyWeeklyProgress(
  userId: string,
  workoutsCompleted: number,
  totalWorkouts: number,
) {
  const percentage = Math.round((workoutsCompleted / totalWorkouts) * 100)
  return await sendPushNotificationToUsers(
    [userId],
    'Weekly progress report',
    `This week: ${workoutsCompleted}/${totalWorkouts} workouts completed (${percentage}%).`,
    '/fitspace/progress',
  )
}

// ================================
// TEAM INVITATIONS
// ================================

/**
 * Send push notification for team invitations
 */
export async function notifyTeamInvitation(
  invitedUserId: string,
  inviterName: string,
  teamName: string,
) {
  return await sendPushNotificationToUsers(
    [invitedUserId],
    'Team invitation received',
    `${inviterName} invited you to join the ${teamName} team.`,
    '/fitspace/teams',
  )
}

/**
 * Send push notification for trainer package offers
 */
export async function notifyTrainerOfferReceived(
  clientUserId: string,
  trainerName: string,
  packageDescription: string,
  offerToken: string,
) {
  return await sendPushNotificationToUsers(
    [clientUserId],
    `Training offer from ${trainerName}`,
    `You have a new training offer from ${trainerName}.`,
    `/offer/${offerToken}`,
  )
}

// ================================
// SYSTEM NOTIFICATIONS
// ================================

/**
 * Send push notification for system announcements
 */
export async function notifySystemAnnouncement(
  userIds: string[],
  title: string,
  message: string,
) {
  return await sendPushNotificationToUsers(
    userIds,
    title,
    message,
    '/fitspace/workout',
  )
}

/**
 * Send push notification for app updates
 */
export async function notifyAppUpdate(userIds: string[]) {
  return await sendPushNotificationToUsers(
    userIds,
    'App update available',
    'A new version of Hypro is available with new features and improvements.',
    '/fitspace/workout',
  )
}

// ================================
// HELPER FUNCTIONS
// ================================

/**
 * Send multiple notifications in batch
 */
export async function sendBatchNotifications(
  notifications: {
    userIds: string[]
    title: string
    message: string
    url?: string
  }[],
) {
  const results = await Promise.allSettled(
    notifications.map((notification) =>
      sendPushNotificationToUsers(
        notification.userIds,
        notification.title,
        notification.message,
        notification.url || '/fitspace/workout',
      ),
    ),
  )

  const successful = results.filter(
    (result) => result.status === 'fulfilled',
  ).length
  const failed = results.filter((result) => result.status === 'rejected').length

  return {
    success: failed === 0,
    successful,
    failed,
    total: notifications.length,
  }
}
