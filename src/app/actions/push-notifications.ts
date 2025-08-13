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
