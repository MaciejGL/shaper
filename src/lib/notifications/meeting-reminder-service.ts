import { format } from 'date-fns'

import { GQLNotificationType } from '@/generated/graphql-server'
import { prisma } from '@/lib/db'

import { sendPushForNotification } from './push-integration'
import { markReminderAsSent } from './reminder-tracker'

export interface MeetingReminderResult {
  success: boolean
  notificationsSent: number
  processedMeetings: number
  errors: string[]
}

/**
 * Send meeting reminder notifications
 * - 24 hours before meeting
 * - 1 hour before meeting
 */
export async function sendMeetingReminders(): Promise<MeetingReminderResult> {
  const now = new Date()
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const in1Hour = new Date(now.getTime() + 60 * 60 * 1000)

  const errors: string[] = []
  let notificationsSent = 0
  let processedMeetings = 0

  try {
    // Get upcoming meetings that are pending or confirmed
    // Check meetings scheduled between now+23h and now+25h (24h window)
    // OR between now+30min and now+90min (1h window)
    const meetings = await prisma.meeting.findMany({
      where: {
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
        scheduledAt: {
          gte: now,
        },
        OR: [
          // 24-hour reminders (between 23-25 hours from now)
          {
            scheduledAt: {
              gte: new Date(in24Hours.getTime() - 60 * 60 * 1000), // 23 hours
              lte: new Date(in24Hours.getTime() + 60 * 60 * 1000), // 25 hours
            },
          },
          // 1-hour reminders (between 30min-90min from now)
          {
            scheduledAt: {
              gte: new Date(in1Hour.getTime() - 30 * 60 * 1000), // 30 min
              lte: new Date(in1Hour.getTime() + 30 * 60 * 1000), // 90 min
            },
          },
        ],
      },
      include: {
        trainee: {
          include: {
            profile: true,
          },
        },
        coach: {
          include: {
            profile: true,
          },
        },
      },
    })

    console.info(`📅 Found ${meetings.length} meetings to check for reminders`)

    for (const meeting of meetings) {
      processedMeetings++
      const meetingTime = new Date(meeting.scheduledAt)
      const timeDiff = meetingTime.getTime() - now.getTime()
      const hoursUntil = timeDiff / (60 * 60 * 1000)

      // Determine if this is a 24h or 1h reminder
      let reminderType: '24h' | '1h' | null = null
      if (hoursUntil >= 23 && hoursUntil <= 25) {
        reminderType = '24h'
      } else if (hoursUntil >= 0.5 && hoursUntil <= 1.5) {
        reminderType = '1h'
      }

      if (!reminderType) {
        continue
      }

      // Format meeting details
      const trainerName =
        meeting.coach.profile?.firstName && meeting.coach.profile?.lastName
          ? `${meeting.coach.profile.firstName} ${meeting.coach.profile.lastName}`
          : meeting.coach.name || 'Your trainer'

      const clientName =
        meeting.trainee.profile?.firstName && meeting.trainee.profile?.lastName
          ? `${meeting.trainee.profile.firstName} ${meeting.trainee.profile.lastName}`
          : meeting.trainee.name || 'Your client'

      const meetingDate = format(meetingTime, 'EEEE, MMM d')
      const meetingTimeStr = format(meetingTime, 'h:mm a')
      const timeUntilText = reminderType === '24h' ? 'tomorrow' : 'in 1 hour'

      // Send notification to CLIENT
      const shouldSendToClient = await markReminderAsSent({
        entityType: 'MEETING',
        entityId: meeting.id,
        reminderType,
        userId: meeting.traineeId,
      })

      if (shouldSendToClient) {
        const clientMessage =
          reminderType === '24h'
            ? `Your ${meeting.title} with ${trainerName} is tomorrow at ${meetingTimeStr}`
            : `Your ${meeting.title} with ${trainerName} starts in 1 hour!`

        try {
          // Create in-app notification for client
          await prisma.notification.create({
            data: {
              userId: meeting.traineeId,
              createdBy: meeting.coachId,
              type: GQLNotificationType.MeetingReminder,
              message: `${meeting.title} ${timeUntilText} - ${meetingDate} at ${meetingTimeStr}`,
              link: '/fitspace/my-trainer',
              relatedItemId: meeting.id,
              metadata: {
                meetingId: meeting.id,
                reminderType,
                meetingTitle: meeting.title,
                scheduledAt: meeting.scheduledAt.toISOString(),
              },
            },
          })

          // Send push notification to client
          await sendPushForNotification(
            meeting.traineeId,
            GQLNotificationType.MeetingReminder,
            clientMessage,
            '/fitspace/my-trainer',
            {
              trainerName,
            },
          )

          notificationsSent++
          console.info(
            `✅ Sent ${reminderType} reminder for meeting ${meeting.id} to client ${meeting.traineeId}`,
          )
        } catch (error) {
          const errorMsg = `Failed to send ${reminderType} reminder for meeting ${meeting.id} to client: ${error}`
          console.error(errorMsg)
          errors.push(errorMsg)
        }
      }

      // Send notification to TRAINER
      const shouldSendToTrainer = await markReminderAsSent({
        entityType: 'MEETING',
        entityId: meeting.id,
        reminderType,
        userId: meeting.coachId,
      })

      if (shouldSendToTrainer) {
        const trainerMessage =
          reminderType === '24h'
            ? `Your ${meeting.title} with ${clientName} is tomorrow at ${meetingTimeStr}`
            : `Your ${meeting.title} with ${clientName} starts in 1 hour!`

        try {
          // Create in-app notification for trainer
          await prisma.notification.create({
            data: {
              userId: meeting.coachId,
              createdBy: meeting.traineeId,
              type: GQLNotificationType.MeetingReminder,
              message: `${meeting.title} ${timeUntilText} - ${meetingDate} at ${meetingTimeStr}`,
              link: `/trainer/clients/${meeting.traineeId}?tab=meetings`,
              relatedItemId: meeting.id,
              metadata: {
                meetingId: meeting.id,
                reminderType,
                meetingTitle: meeting.title,
                scheduledAt: meeting.scheduledAt.toISOString(),
                clientId: meeting.traineeId,
              },
            },
          })

          // Send push notification to trainer
          await sendPushForNotification(
            meeting.coachId,
            GQLNotificationType.MeetingReminder,
            trainerMessage,
            `/trainer/clients/${meeting.traineeId}?tab=meetings`,
            {
              clientName,
            },
          )

          notificationsSent++
          console.info(
            `✅ Sent ${reminderType} reminder for meeting ${meeting.id} to trainer ${meeting.coachId}`,
          )
        } catch (error) {
          const errorMsg = `Failed to send ${reminderType} reminder for meeting ${meeting.id} to trainer: ${error}`
          console.error(errorMsg)
          errors.push(errorMsg)
        }
      }
    }

    return {
      success: errors.length === 0,
      notificationsSent,
      processedMeetings,
      errors,
    }
  } catch (error) {
    console.error('❌ Error in sendMeetingReminders:', error)
    return {
      success: false,
      notificationsSent,
      processedMeetings,
      errors: [String(error)],
    }
  }
}
