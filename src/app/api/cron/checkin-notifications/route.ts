import { NextRequest, NextResponse } from 'next/server'

import { sendCheckinNotifications } from '@/lib/notifications/checkin-notification-service'

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    console.info('🔔 Starting check-in notification cron job...')

    // Use the notification service
    const result = await sendCheckinNotifications()

    console.info(
      `✅ Check-in notification cron completed. Sent ${result.notificationsSent} notifications.`,
    )

    if (result.errors.length > 0) {
      console.error('❌ Errors during notification sending:', result.errors)
    }

    return NextResponse.json({
      success: result.success,
      message: `Sent ${result.notificationsSent} check-in notifications`,
      processedUsers: result.processedUsers,
      errors: result.errors,
    })
  } catch (error) {
    console.error('❌ Check-in notification cron error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
