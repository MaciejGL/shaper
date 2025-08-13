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
 * Send push notification when coaching request is received
 */
export async function notifyCoachingRequest(
  recipientId: string,
  senderName: string,
) {
  return await sendPushNotificationToUsers(
    [recipientId],
    'New Coaching Request',
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
    'Coaching Request Accepted',
    `${acceptorName} has accepted your coaching request! Time to start your fitness journey together!`,
    '/fitspace/dashboard',
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
    'Coaching Request Declined',
    `${rejectorName} has declined your coaching request. Don't give up - there are many great trainers out there!`,
    '/fitspace/dashboard',
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
    'New Training Plan',
    `New training plan "${planTitle}" has been assigned to you${trainerName ? ` by ${trainerName}` : ''}. Ready to get stronger?`,
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
    'New Meal Plan',
    `New meal plan "${planTitle}" has been assigned to you${trainerName ? ` by ${trainerName}` : ''}. Let's fuel your success!`,
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
    'Client Workout Complete!',
    `${clientName} just finished their workout${workoutDetail}! Great coaching!`,
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
    'Workout Complete!',
    `Amazing job! You crushed your${workoutDetail} workout. You're getting stronger every day!`,
    '/fitspace/progress',
  )
}

/**
 * Send push notification for workout streaks
 */
export async function notifyWorkoutStreak(userId: string, streakDays: number) {
  return await sendPushNotificationToUsers(
    [userId],
    `${streakDays} Day Streak!`,
    `You're on fire! ${streakDays} days of consistent training. Keep the momentum going, champion!`,
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
    'Week Complete!',
    `Incredible! You've completed week ${weekNumber} of "${planTitle}". You're unstoppable!`,
    '/fitspace/progress',
  )
}

/**
 * Send push notification when entire plan is completed
 */
export async function notifyPlanCompleted(userId: string, planTitle: string) {
  return await sendPushNotificationToUsers(
    [userId],
    'Training Plan Complete!',
    `Congratulations! You've completed "${planTitle}". What an incredible achievement! Time to level up!`,
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
    'New Exercise Comment',
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
    'New Exercise Note',
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
    'Trainer Reply',
    `${trainerName} responded to your exercise note: "${truncatedText}"`,
    '/fitspace/workout',
  )
}

// ================================
// MEAL & NUTRITION
// ================================

/**
 * Send push notification when daily nutrition goal is completed
 */
export async function notifyDailyNutritionCompleted(userId: string) {
  return await sendPushNotificationToUsers(
    [userId],
    'Daily Nutrition Complete!',
    "Fantastic! You've logged all your meals for today. Your nutrition game is on point!",
    '/fitspace/meal-plan',
  )
}

/**
 * Send push notification for meal reminders
 */
export async function notifyMealReminder(
  userId: string,
  mealType: string,
  scheduledTime?: string,
) {
  const timeDetail = scheduledTime ? ` scheduled for ${scheduledTime}` : ''
  return await sendPushNotificationToUsers(
    [userId],
    'Meal Reminder',
    `Time to log your ${mealType}${timeDetail}! Proper nutrition fuels your success!`,
    '/fitspace/meal-plan',
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
    'Workout Reminder',
    `Time for your ${workoutName} workout${timeDetail}! Ready to get stronger?`,
    '/fitspace/workout',
  )
}

/**
 * Send push notification for rest day reminders
 */
export async function notifyRestDay(userId: string) {
  return await sendPushNotificationToUsers(
    [userId],
    'Rest Day Today',
    'Today is your rest day! Take time to recover, stretch, or do some light activity. Your body will thank you!',
    '/fitspace/progress',
  )
}

/**
 * Send push notification for hydration reminders
 */
export async function notifyHydrationReminder(userId: string) {
  return await sendPushNotificationToUsers(
    [userId],
    'Hydration Check',
    'Time for a water break! Staying hydrated helps with performance and recovery.',
    '/fitspace/dashboard',
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
    'Weekly Progress Report',
    `This week: ${workoutsCompleted}/${totalWorkouts} workouts completed (${percentage}%)! ${percentage >= 80 ? 'Amazing consistency!' : 'Keep pushing forward!'}`,
    '/fitspace/progress',
  )
}

// ================================
// COLLABORATION
// ================================

/**
 * Send push notification for collaboration invitations
 */
export async function notifyCollaborationInvitation(
  recipientId: string,
  inviterName: string,
  planTitle: string,
) {
  return await sendPushNotificationToUsers(
    [recipientId],
    'Collaboration Invitation',
    `${inviterName} invited you to collaborate on "${planTitle}". Ready to work together?`,
    '/fitspace/my-plans',
  )
}

/**
 * Send push notification for collaboration responses
 */
export async function notifyCollaborationResponse(
  senderId: string,
  responderName: string,
  accepted: boolean,
  planTitle: string,
) {
  const status = accepted ? 'accepted' : 'declined'
  return await sendPushNotificationToUsers(
    [senderId],
    `Collaboration ${accepted ? 'Accepted' : 'Declined'}`,
    `${responderName} ${status} your collaboration invitation for "${planTitle}".`,
    '/fitspace/my-plans',
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
    `🔔 ${title}`,
    message,
    '/fitspace/dashboard',
  )
}

/**
 * Send push notification for app updates
 */
export async function notifyAppUpdate(userIds: string[]) {
  return await sendPushNotificationToUsers(
    userIds,
    'App Update Available',
    'A new version of Shaper is available with exciting features and improvements!',
    '/fitspace/dashboard',
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
        notification.url || '/fitspace/dashboard',
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
