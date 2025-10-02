import { NextResponse } from 'next/server'

import { sendMeetingReminders } from '@/lib/notifications/meeting-reminder-service'

export async function GET() {
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
