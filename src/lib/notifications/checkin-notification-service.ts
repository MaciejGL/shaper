// Removed unused imports
import { formatInTimeZone } from 'date-fns-tz'

import { sendPushNotificationToUsers } from '@/app/actions/push-notifications'
import { prisma } from '@/lib/db'

interface CheckinNotificationResult {
  success: boolean
  notificationsSent: number
  processedUsers: number
  errors: string[]
}

interface CheckinSchedule {
  frequency: string
  dayOfWeek?: number | null
  dayOfMonth?: number | null
  completions: CheckinCompletion[]
}

interface CheckinCompletion {
  completedAt: string | Date
  measurement?: { id: string } | null
  progressLog?: { id: string } | null
}

/**
 * Check if user should receive a check-in notification
 */
function shouldSendCheckinNotification(
  schedule: CheckinSchedule,
  lastValidCompletion: CheckinCompletion | undefined,
  userTimezone: string,
  reminderHour: number = 8,
): boolean {
  // Check if it's the right time (8 AM in user's timezone)
  const currentHourInUserTz = parseInt(
    formatInTimeZone(new Date(), userTimezone, 'H'),
  )

  if (currentHourInUserTz !== reminderHour) {
    return false
  }

  // Calculate today in user's timezone for comparison
  const todayInUserTz = new Date(
    formatInTimeZone(new Date(), userTimezone, 'yyyy-MM-dd'),
  )

  // Don't send if user already completed check-in in current period
  if (lastValidCompletion) {
    const completionDate = new Date(lastValidCompletion.completedAt)

    // Check if completion is within current scheduled period
    switch (schedule.frequency) {
      case 'WEEKLY':
        // If completed within the last 7 days and it was on or after the last scheduled day
        const daysSinceCompletion = Math.floor(
          (todayInUserTz.getTime() - completionDate.getTime()) /
            (1000 * 60 * 60 * 24),
        )
        if (daysSinceCompletion < 7) {
          return false
        }
        break

      case 'BIWEEKLY':
        // Already handled in the biweekly logic below
        break

      case 'MONTHLY':
        // If completed this month
        const completionMonth = formatInTimeZone(
          completionDate,
          userTimezone,
          'yyyy-MM',
        )
        const currentMonth = formatInTimeZone(
          new Date(),
          userTimezone,
          'yyyy-MM',
        )
        if (completionMonth === currentMonth) {
          return false
        }
        break
    }
  }

  const dayOfWeekInUserTz = todayInUserTz.getDay() // 0 = Sunday, 1 = Monday, etc.
  const dayOfMonthInUserTz = todayInUserTz.getDate()

  switch (schedule.frequency) {
    case 'WEEKLY':
      // Check if today (in user's timezone) matches their scheduled day
      return schedule.dayOfWeek === dayOfWeekInUserTz

    case 'BIWEEKLY':
      // For biweekly, check if it's the right day AND if it's been at least 2 weeks since last completion
      if (schedule.dayOfWeek !== dayOfWeekInUserTz) {
        return false
      }

      // If no previous completion, send notification
      if (!lastValidCompletion) {
        return true
      }

      // Check if it's been at least 14 days since last completion
      const daysSinceLastCompletion = Math.floor(
        (todayInUserTz.getTime() -
          new Date(lastValidCompletion.completedAt).getTime()) /
          (1000 * 60 * 60 * 24),
      )
      return daysSinceLastCompletion >= 14

    case 'MONTHLY':
      // Check if today (in user's timezone) matches their scheduled day of month
      return schedule.dayOfMonth === dayOfMonthInUserTz

    default:
      return false
  }
}

/**
 * Send check-in notifications to eligible users
 */
export async function sendCheckinNotifications(): Promise<CheckinNotificationResult> {
  const errors: string[] = []
  let notificationsSent = 0

  try {
    // Get all users with active check-in schedules who want notifications
    const usersWithSchedules = await prisma.user.findMany({
      where: {
        profile: {
          checkinReminders: true, // User wants check-in reminders
          pushNotifications: true, // User has push notifications enabled
          checkinSchedule: {
            isActive: true, // Has active check-in schedule
          },
        },
      },
      include: {
        profile: {
          include: {
            checkinSchedule: {
              include: {
                completions: {
                  include: {
                    schedule: true,
                    measurement: true,
                    progressLog: true,
                  },
                  orderBy: { completedAt: 'desc' },
                  take: 2, // Get last 5 completions to check for recent activity
                },
              },
            },
          },
        },
        mobilePushTokens: true,
      },
    })

    for (const user of usersWithSchedules) {
      try {
        const profile = user.profile
        const schedule = profile?.checkinSchedule

        if (!profile || !schedule) continue

        // Get user's timezone (default to UTC)
        const userTimezone = profile.timezone || 'UTC'

        // Find last valid completion (with actual data)
        const lastValidCompletion = schedule.completions.find(
          (completion) => completion.measurement || completion.progressLog,
        )

        // Check if user should receive notification
        const shouldSend = shouldSendCheckinNotification(
          schedule,
          lastValidCompletion,
          userTimezone,
        )

        if (!shouldSend) {
          continue
        }

        // Send push notification if user has tokens
        if (user.mobilePushTokens.length > 0) {
          await sendPushNotificationToUsers(
            [user.id],
            'Check-in time!',
            "Share today's wins with a quick check-in.",
            'https://www.hypro.app/fitspace/progress',
          )

          notificationsSent++
        }
      } catch (error) {
        const errorMsg = `Error processing user ${user.email}: ${error}`
        errors.push(errorMsg)
        console.error(`❌ ${errorMsg}`)
      }
    }

    return {
      success: true,
      notificationsSent,
      processedUsers: usersWithSchedules.length,
      errors,
    }
  } catch (error) {
    const errorMsg = `Failed to send check-in notifications: ${error}`
    errors.push(errorMsg)
    console.error(`❌ ${errorMsg}`)

    return {
      success: false,
      notificationsSent,
      processedUsers: 0,
      errors,
    }
  }
}
