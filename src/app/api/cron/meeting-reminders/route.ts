import { NextRequest, NextResponse } from 'next/server'

import { sendMeetingReminders } from '@/lib/notifications/meeting-reminder-service'

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    console.info('🔔 Starting meeting reminder notification cron job...')

    const result = await sendMeetingReminders()

    console.info(
      `✅ Meeting reminder cron completed. Sent ${result.notificationsSent} notifications for ${result.processedMeetings} meetings.`,
    )

    if (result.errors.length > 0) {
      console.error('❌ Errors during notification sending:', result.errors)
    }

    return NextResponse.json({
      success: result.success,
      message: `Sent ${result.notificationsSent} meeting reminder notifications`,
      processedMeetings: result.processedMeetings,
      notificationsSent: result.notificationsSent,
      errors: result.errors,
    })
  } catch (error) {
    console.error('❌ Meeting reminder cron error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
