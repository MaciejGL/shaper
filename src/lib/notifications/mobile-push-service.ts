/**
 * Mobile Push Notification Service
 * Sends push notifications to mobile devices using Expo Push Service
 * Works alongside the existing web push notification system
 */
import { Expo, ExpoPushMessage } from 'expo-server-sdk'

import { prisma } from '../db'

// Create a new Expo SDK client
const expo = new Expo()

export interface MobilePushNotification {
  userIds: string[]
  title: string
  body: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: Record<string, any>
  sound?: 'default' | null
  badge?: number
}

/**
 * Send push notifications to mobile users via Expo
 */
export async function sendMobilePushNotifications({
  userIds,
  title,
  body,
  data = {},
  sound = 'default',
  badge,
}: MobilePushNotification) {
  try {
    // Get mobile push tokens for the specified users
    const mobilePushTokens = await prisma.mobilePushToken.findMany({
      where: {
        userId: { in: userIds },
        pushNotificationsEnabled: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (mobilePushTokens.length === 0) {
      console.info('📱 No mobile push tokens found for users:', userIds)
      return { success: true, sent: 0, failed: 0, errors: [] }
    }

    // Create the messages that Expo will send
    const messages: ExpoPushMessage[] = mobilePushTokens
      .filter((token) => Expo.isExpoPushToken(token.expoPushToken))
      .map((token) => ({
        to: token.expoPushToken,
        sound,
        title,
        body,
        data: {
          ...data,
          userId: token.userId,
          // Add deep linking URL if provided
          url: data.url || '/fitspace',
        },
        ...(badge !== undefined && { badge }),
      }))

    if (messages.length === 0) {
      console.warn('📱 No valid Expo push tokens found')
      return { success: true, sent: 0, failed: 0, errors: [] }
    }

    // Send the notifications in chunks
    const chunks = expo.chunkPushNotifications(messages)
    const results = []
    const errors: string[] = []

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk)
        results.push(...ticketChunk)
      } catch (error) {
        console.error('📱 Error sending push notification chunk:', error)
        errors.push(`Chunk error: ${error}`)
      }
    }

    // Count successful and failed notifications
    const sent = results.filter((ticket) => ticket.status === 'ok').length
    const failed = results.filter((ticket) => ticket.status === 'error').length

    // Log any errors
    results.forEach((ticket, index) => {
      if (ticket.status === 'error') {
        console.error(
          `📱 Push notification error for token ${messages[index]?.to}:`,
          ticket.message,
        )
        if (ticket.details?.error) {
          console.error('📱 Error details:', ticket.details.error)
        }
      }
    })

    console.info(
      `📱 Mobile push notifications sent: ${sent}/${messages.length} successful`,
    )

    return {
      success: true,
      sent,
      failed,
      total: messages.length,
      errors,
    }
  } catch (error) {
    console.error('📱 Fatal error sending mobile push notifications:', error)
    return {
      success: false,
      sent: 0,
      failed: 0,
      errors: [`Fatal error: ${error}`],
    }
  }
}

/**
 * Clean up invalid push tokens
 * Call this periodically to remove tokens that are no longer valid
 */
export async function cleanupInvalidPushTokens() {
  try {
    // This would typically be run as a scheduled job
    // For now, we'll just log that this function exists
    console.info('📱 Mobile push token cleanup would run here')

    // In a real implementation, you'd:
    // 1. Track which tokens returned errors
    // 2. Remove tokens that consistently fail
    // 3. Remove old tokens that haven't been active

    return { success: true, cleaned: 0 }
  } catch (error) {
    console.error('📱 Error cleaning up push tokens:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Get push token statistics
 */
export async function getMobilePushTokenStats() {
  try {
    const stats = await prisma.mobilePushToken.groupBy({
      by: ['platform', 'pushNotificationsEnabled'],
      _count: {
        id: true,
      },
    })

    const total = await prisma.mobilePushToken.count()
    const enabled = await prisma.mobilePushToken.count({
      where: { pushNotificationsEnabled: true },
    })

    const platforms = await prisma.mobilePushToken.groupBy({
      by: ['platform'],
      _count: { id: true },
    })

    return {
      total,
      enabled,
      disabled: total - enabled,
      byPlatform: platforms.reduce(
        (acc, p) => {
          acc[p.platform] = p._count.id
          return acc
        },
        {} as Record<string, number>,
      ),
      detailed: stats,
    }
  } catch (error) {
    console.error('📱 Error getting mobile push token stats:', error)
    return null
  }
}

/**
 * Test mobile push notification
 */
export async function sendTestMobilePushNotification(userId: string) {
  return await sendMobilePushNotifications({
    userIds: [userId],
    title: '🏋️ Hypertro Test',
    body: 'This is a test notification from your Hypertro mobile app!',
    data: {
      type: 'test',
      url: '/fitspace',
    },
  })
}
