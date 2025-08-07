'use server'

import webpush from 'web-push'

import { auth } from '@/lib/auth'
import { getAllPushSubscriptionsForNotification } from '@/server/models/push-subscription/factory'
import {
  createPushSubscription,
  deletePushSubscriptionsForUser,
} from '@/server/models/push-subscription/factory'

// Configure VAPID details
webpush.setVapidDetails(
  process.env.NEXT_PUBLIC_VAPID_SUBJECT || 'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

export async function subscribeUser(sub: {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Authentication required' }
    }

    // Store subscription in database
    await createPushSubscription(
      {
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
        userAgent: undefined, // Could be passed from client if needed
      },
      session.user.id,
      { user: session.user },
    )

    console.info('✅ User subscribed to push notifications:', sub.endpoint)
    return { success: true }
  } catch (error) {
    console.error('❌ Error subscribing user:', error)
    return { success: false, error: 'Failed to subscribe user' }
  }
}

export async function unsubscribeUser() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Authentication required' }
    }

    // Remove all subscriptions for this user from database
    await deletePushSubscriptionsForUser(session.user.id)

    console.info('✅ User unsubscribed from push notifications')
    return { success: true }
  } catch (error) {
    console.error('❌ Error unsubscribing user:', error)
    return { success: false, error: 'Failed to unsubscribe user' }
  }
}

export async function sendTestNotification(message: string) {
  try {
    // Get all push subscriptions from database (with user preferences)
    const subscriptions = await getAllPushSubscriptionsForNotification()

    // Filter only users who have push notifications enabled
    const enabledSubscriptions = subscriptions.filter(
      (sub) => sub.pushNotificationsEnabled,
    )

    if (enabledSubscriptions.length === 0) {
      return {
        success: false,
        error: 'No subscriptions available or push notifications disabled',
      }
    }

    const payload = JSON.stringify({
      title: '🏋️ Shaper Notification',
      body: message,
      icon: '/favicons/android-chrome-192x192.png',
      badge: '/favicons/android-chrome-192x192.png',
      url: '/fitspace',
    })

    // Send to all enabled subscriptions
    const results = await Promise.allSettled(
      enabledSubscriptions.map((subscription) =>
        webpush.sendNotification(subscription, payload),
      ),
    )

    const successful = results.filter(
      (result) => result.status === 'fulfilled',
    ).length
    const failed = results.filter(
      (result) => result.status === 'rejected',
    ).length

    // Log detailed error information for failed notifications
    const failedResults = results.filter(
      (result) => result.status === 'rejected',
    ) as PromiseRejectedResult[]

    if (failedResults.length > 0) {
      failedResults.forEach((result, index) => {
        console.error(`Notification ${index + 1} failed:`, result.reason)
      })
    }

    console.info(
      `📧 Sent notification to ${successful} users, ${failed} failed`,
    )

    return {
      success: true,
      message: `Sent to ${successful} subscriptions${failed > 0 ? `, ${failed} failed` : ''}`,
    }
  } catch (error) {
    console.error('❌ Error sending push notification:', error)
    return { success: false, error: 'Failed to send notification' }
  }
}

// Helper functions for different notification types
export async function sendWorkoutReminder(workoutName: string) {
  return await sendTestNotification(`Time for your ${workoutName} workout! 💪`)
}

export async function sendMealReminder(mealName: string) {
  return await sendTestNotification(`Don't forget to log your ${mealName}! 🍽️`)
}

export async function sendCoachingNotification(message: string) {
  return await sendTestNotification(`📝 Coach update: ${message}`)
}

export async function sendAchievementNotification(achievement: string) {
  return await sendTestNotification(`🎉 Achievement unlocked: ${achievement}`)
}

// Function to get subscription count (for testing/admin purposes)
export async function getSubscriptionCount() {
  const subscriptions = await getAllPushSubscriptionsForNotification()
  const enabledCount = subscriptions.filter(
    (sub) => sub.pushNotificationsEnabled,
  ).length
  return { count: enabledCount, total: subscriptions.length }
}

// Integration with existing notification system
export async function sendPushNotificationToUsers(
  userIds: string[],
  title: string,
  body: string,
  url?: string,
  icon?: string,
) {
  try {
    // Get push subscriptions for specific users
    const subscriptions = await getAllPushSubscriptionsForNotification(userIds)

    // Filter only users who have push notifications enabled
    const enabledSubscriptions = subscriptions.filter(
      (sub) => sub.pushNotificationsEnabled,
    )

    if (enabledSubscriptions.length === 0) {
      console.info('No users with push notifications enabled')
      return { success: true, sent: 0, message: 'No enabled subscriptions' }
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: icon || '/favicons/android-chrome-192x192.png',
      badge: '/favicons/android-chrome-192x192.png',
      url: url || '/fitspace',
    })

    // Send to all enabled subscriptions
    const results = await Promise.allSettled(
      enabledSubscriptions.map((subscription) =>
        webpush.sendNotification(subscription, payload),
      ),
    )

    const successful = results.filter(
      (result) => result.status === 'fulfilled',
    ).length
    const failed = results.filter(
      (result) => result.status === 'rejected',
    ).length

    // Log detailed error information for failed notifications
    const failedResults = results.filter(
      (result) => result.status === 'rejected',
    ) as PromiseRejectedResult[]

    if (failedResults.length > 0) {
      failedResults.forEach((result, index) => {
        console.error(`Push notification ${index + 1} failed:`, result.reason)
      })
    }

    console.info(
      `📧 Sent push notifications to ${successful}/${enabledSubscriptions.length} users`,
    )

    return {
      success: true,
      sent: successful,
      failed,
      total: enabledSubscriptions.length,
      message: `Sent to ${successful} users${failed > 0 ? `, ${failed} failed` : ''}`,
    }
  } catch (error) {
    console.error('❌ Error sending push notifications:', error)
    return { success: false, error: 'Failed to send push notifications' }
  }
}
