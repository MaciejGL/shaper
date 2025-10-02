/**
 * Generic Reminder Tracker
 *
 * Provides atomic, idempotent reminder tracking that prevents duplicate reminders
 * across any entity type (meetings, checkins, workouts, etc.)
 *
 * Usage:
 * ```ts
 * // Try to mark reminder as sent (atomic operation)
 * const shouldSend = await markReminderAsSent({
 *   entityType: 'MEETING',
 *   entityId: meetingId,
 *   reminderType: '24h',
 *   userId: clientId,
 * })
 *
 * if (shouldSend) {
 *   // Send notification
 *   await sendNotification(...)
 * }
 * ```
 */
import { prisma } from '@/lib/db'

export interface ReminderTrackingParams {
  entityType: string // 'MEETING', 'CHECKIN', 'WORKOUT', etc.
  entityId: string
  reminderType: string // '24h', '1h', 'weekly', etc.
  userId: string
}

/**
 * Atomically mark a reminder as sent.
 * Returns true if this is the first time sending (should proceed),
 * false if reminder was already sent (should skip).
 *
 * This uses database unique constraints to prevent race conditions,
 * making it safe to call from multiple cron instances simultaneously.
 */
export async function markReminderAsSent(
  params: ReminderTrackingParams,
): Promise<boolean> {
  try {
    await prisma.reminderSent.create({
      data: {
        entityType: params.entityType,
        entityId: params.entityId,
        reminderType: params.reminderType,
        userId: params.userId,
      },
    })
    return true // Successfully created = first time sending
  } catch (error: unknown) {
    // P2002 = unique constraint violation (reminder already sent)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      console.info(
        `⏭️ Skipping ${params.reminderType} reminder for ${params.entityType}:${params.entityId} - already sent`,
      )
      return false
    }
    // Other errors should be thrown
    throw error
  }
}

/**
 * Check if a reminder has been sent without creating a record
 * (useful for read-only checks)
 */
export async function wasReminderSent(
  params: ReminderTrackingParams,
): Promise<boolean> {
  const existing = await prisma.reminderSent.findUnique({
    where: {
      entityType_entityId_reminderType_userId: {
        entityType: params.entityType,
        entityId: params.entityId,
        reminderType: params.reminderType,
        userId: params.userId,
      },
    },
  })
  return existing !== null
}

/**
 * Get all reminders sent for a specific entity
 */
export async function getRemindersSentForEntity(
  entityType: string,
  entityId: string,
): Promise<{ reminderType: string; userId: string; sentAt: Date }[]> {
  const reminders = await prisma.reminderSent.findMany({
    where: {
      entityType,
      entityId,
    },
    select: {
      reminderType: true,
      userId: true,
      sentAt: true,
    },
    orderBy: {
      sentAt: 'desc',
    },
  })
  return reminders
}

/**
 * Clean up old reminder records (optional maintenance)
 * Call this periodically to prevent table bloat
 */
export async function cleanupOldReminders(daysToKeep: number = 90) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

  const result = await prisma.reminderSent.deleteMany({
    where: {
      sentAt: {
        lt: cutoffDate,
      },
    },
  })

  console.info(`🧹 Cleaned up ${result.count} old reminder records`)
  return result.count
}
