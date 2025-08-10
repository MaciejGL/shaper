import { NextRequest, NextResponse } from 'next/server'

import { isAdminUser } from '@/lib/admin-auth'
import { getCurrentUser } from '@/lib/getUser'
import {
  getMobilePushTokenStats,
  sendMobilePushNotifications,
  sendTestMobilePushNotification,
} from '@/lib/notifications/mobile-push-service'

/**
 * Admin Test Push Notification Endpoint
 * Allows admins to test mobile push notifications
 */

export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const hasAdminAccess = await isAdminUser()
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, userId, title, message, data } = body

    console.info('📱 Admin testing push notification:', { type, userId })

    switch (type) {
      case 'test-single': {
        if (!userId) {
          return NextResponse.json(
            { error: 'userId is required for single test' },
            { status: 400 },
          )
        }

        const result = await sendTestMobilePushNotification(userId)
        return NextResponse.json({
          success: true,
          message: 'Test notification sent',
          result,
        })
      }

      case 'test-custom': {
        if (!userId || !title || !message) {
          return NextResponse.json(
            { error: 'userId, title, and message are required' },
            { status: 400 },
          )
        }

        const result = await sendMobilePushNotifications({
          userIds: [userId],
          title,
          body: message,
          data: data || { type: 'admin-test' },
        })

        return NextResponse.json({
          success: true,
          message: 'Custom notification sent',
          result,
        })
      }

      case 'test-current-user': {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          return NextResponse.json(
            { error: 'Current user not found' },
            { status: 400 },
          )
        }

        const result = await sendTestMobilePushNotification(currentUser.user.id)
        return NextResponse.json({
          success: true,
          message: 'Test notification sent to current user',
          result,
        })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid test type' },
          { status: 400 },
        )
    }
  } catch (error) {
    console.error('❌ Error sending test push notification:', error)
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 },
    )
  }
}

/**
 * Get mobile push notification statistics
 */
export async function GET() {
  try {
    // Check admin access
    const hasAdminAccess = await isAdminUser()
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stats = await getMobilePushTokenStats()
    const currentUser = await getCurrentUser()

    return NextResponse.json({
      success: true,
      stats,
      currentUserId: currentUser?.user.id,
    })
  } catch (error) {
    console.error('❌ Error fetching push notification stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 },
    )
  }
}
