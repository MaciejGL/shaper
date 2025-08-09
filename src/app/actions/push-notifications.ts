'use server'

import { prisma } from '@/lib/db'
import { sendMobilePushNotifications } from '@/lib/notifications/mobile-push-service'

/**
 * Send push notifications to users (Mobile-only)
 * Replaced PWA/web push with native mobile push notifications
 */
export async function sendPushNotificationToUsers(
  userIds: string[],
  title: string,
  body: string,
  url?: string,
) {
  try {
    // Send only to mobile devices now
    const mobileResults = await sendMobilePushNotifications({
      userIds,
      title,
      body,
      data: { url: url || '/fitspace' },
    })

    console.info(
      `📱 Mobile push notifications sent: ${mobileResults.sent}/${mobileResults.sent + mobileResults.failed} devices`,
    )

    return {
      success: true,
      sent: mobileResults.sent,
      failed: mobileResults.failed,
      total: mobileResults.sent + mobileResults.failed,
      message: `Sent to ${mobileResults.sent} mobile devices${mobileResults.failed > 0 ? `, ${mobileResults.failed} failed` : ''}`,
    }
  } catch (error) {
    console.error('❌ Error sending push notifications:', error)
    return { success: false, error: 'Failed to send push notifications' }
  }
}

/**
 * Get mobile push subscription count (for admin/testing)
 */
export async function getSubscriptionCount() {
  const mobileTokens = await prisma.mobilePushToken.findMany({
    where: { pushNotificationsEnabled: true },
  })

  return {
    count: mobileTokens.length,
    total: mobileTokens.length,
    platform: 'mobile-only',
  }
}

/**
 * Send test notification to mobile devices
 */
export async function sendTestNotification(message: string) {
  try {
    // Get all mobile push tokens with enabled notifications
    const enabledTokens = await prisma.mobilePushToken.findMany({
      where: { pushNotificationsEnabled: true },
      include: { user: { select: { id: true } } },
    })

    if (enabledTokens.length === 0) {
      return {
        success: false,
        error: 'No mobile users with push notifications enabled',
      }
    }

    const userIds = enabledTokens
      .map((token) => token.userId)
      .filter((id): id is string => id !== null)

    const result = await sendMobilePushNotifications({
      userIds,
      title: '🏋️ Hypertro Test',
      body: message,
      data: { url: '/fitspace' },
    })

    return {
      success: true,
      message: `Sent to ${result.sent} mobile devices${result.failed > 0 ? `, ${result.failed} failed` : ''}`,
      sent: result.sent,
      failed: result.failed,
    }
  } catch (error) {
    console.error('❌ Error sending test notification:', error)
    return { success: false, error: 'Failed to send test notification' }
  }
}
