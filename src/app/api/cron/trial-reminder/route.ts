import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/_db'
import { sendEmail } from '@/lib/email/send-mail'

// Hours after signup to send trial reminder (3 days = 72 hours)
const REMINDER_HOURS = 72

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    console.info('📧 Starting trial reminder cron job...')

    // Find users created exactly REMINDER_HOURS ago (within 1-hour window)
    // This runs hourly, so we check for users who signed up 72-73 hours ago
    const now = new Date()

    // 73 hours ago (start of window)
    const windowStart = new Date(
      now.getTime() - (REMINDER_HOURS + 1) * 60 * 60 * 1000,
    )
    // 72 hours ago (end of window)
    const windowEnd = new Date(now.getTime() - REMINDER_HOURS * 60 * 60 * 1000)

    // Find users created in the 1-hour window, without any subscription
    const usersToNotify = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: windowStart,
          lt: windowEnd,
        },
        // No active subscriptions
        subscriptions: {
          none: {
            status: {
              in: ['ACTIVE', 'CANCELLED_ACTIVE'],
            },
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        profile: {
          select: {
            firstName: true,
          },
        },
      },
    })

    console.info(`Found ${usersToNotify.length} users to send trial reminder`)

    let sentCount = 0
    const errors: string[] = []

    for (const user of usersToNotify) {
      try {
        const userName =
          user.profile?.firstName || user.name?.split(' ')[0] || null

        await sendEmail.trialReminder(user.email, {
          userId: user.id,
          userName,
        })

        sentCount++
      } catch (error) {
        console.error(`Failed to send trial reminder to ${user.email}:`, error)
        errors.push(user.email)
      }
    }

    console.info(
      `✅ Trial reminder cron completed. Sent ${sentCount}/${usersToNotify.length} emails.`,
    )

    return NextResponse.json({
      success: true,
      message: `Sent ${sentCount} trial reminder emails`,
      totalUsers: usersToNotify.length,
      errors,
    })
  } catch (error) {
    console.error('❌ Trial reminder cron error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
