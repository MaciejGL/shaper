'use server'

import webpush from 'web-push'

import { getCurrentUser } from '@/lib/getUser'
import { sendMobilePushNotifications } from '@/lib/notifications/mobile-push-service'
import { getAllPushSubscriptionsForNotification } from '@/server/models/push-subscription/factory'
import {
  createPushSubscription,
  deletePushSubscriptionsForUser,
} from '@/server/models/push-subscription/factory'
import { GQLContext } from '@/types/gql-context'

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
    const userSession = await getCurrentUser()
    if (!userSession?.user?.id) {
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
      userSession.user.id,
      {
        user: userSession,
        loaders: {} as unknown as GQLContext['loaders'], // Context not used in PushSubscription model
      },
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
    const userSession = await getCurrentUser()
    if (!userSession?.user?.id) {
      return { success: false, error: 'Authentication required' }
    }

    // Remove all subscriptions for this user from database
    await deletePushSubscriptionsForUser(userSession.user.id)

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

// Legacy helper functions - deprecated, use centralized push-notification-service instead

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
    // Send to both web and mobile platforms in parallel
    const [webResults, mobileResults] = await Promise.allSettled([
      // Web push notifications (existing system)
      sendWebPushNotifications(userIds, title, body, url, icon),
      // Mobile push notifications (new system)
      sendMobilePushNotifications({
        userIds,
        title,
        body,
        data: { url: url || '/fitspace' },
      }),
    ])

    // Aggregate results
    const webStats =
      webResults.status === 'fulfilled'
        ? webResults.value
        : { sent: 0, failed: 0, total: 0 }
    const mobileStats =
      mobileResults.status === 'fulfilled'
        ? mobileResults.value
        : { sent: 0, failed: 0, total: 0 }

    const totalSent = webStats.sent + mobileStats.sent
    const totalFailed = webStats.failed + mobileStats.failed
    const totalAttempted = webStats.total + (mobileStats.total ?? 0)

    console.info(
      `📧 Push notifications sent: ${totalSent}/${totalAttempted} total (Web: ${webStats.sent}/${webStats.total}, Mobile: ${mobileStats.sent}/${mobileStats.total})`,
    )

    return {
      success: true,
      sent: totalSent,
      failed: totalFailed,
      total: totalAttempted,
      breakdown: {
        web: webStats,
        mobile: mobileStats,
      },
      message: `Sent to ${totalSent} devices${totalFailed > 0 ? `, ${totalFailed} failed` : ''}`,
    }
  } catch (error) {
    console.error('❌ Error sending push notifications:', error)
    return { success: false, error: 'Failed to send push notifications' }
  }
}

// Separate web push function (extracted from original)
async function sendWebPushNotifications(
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
      console.info('No web users with push notifications enabled')
      return { success: true, sent: 0, failed: 0, total: 0 }
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
        console.error(
          `Web push notification ${index + 1} failed:`,
          result.reason,
        )
      })
    }

    return {
      success: true,
      sent: successful,
      failed,
      total: enabledSubscriptions.length,
    }
  } catch (error) {
    console.error('❌ Error sending web push notifications:', error)
    return { success: false, sent: 0, failed: 0, total: 0 }
  }
}
