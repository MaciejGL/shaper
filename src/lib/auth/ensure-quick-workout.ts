/**
 * Ensures user has a Quick Workout plan created
 * This is called on first login to set up the default workout plan
 */

import { addDays, getISOWeek } from 'date-fns'

import { prisma } from '@/lib/db'

/**
 * Gets the start of the current week (Monday) in UTC
 */
function getUTCWeekStart(): Date {
  const now = new Date()
  const currentDay = now.getUTCDay()
  const diff = currentDay === 0 ? -6 : 1 - currentDay // Monday is day 1
  const monday = new Date(now)
  monday.setUTCDate(now.getUTCDate() + diff)
  monday.setUTCHours(0, 0, 0, 0)
  return monday
}

/**
 * Ensures the user has a Quick Workout plan
 * Creates it if it doesn't exist (active: false, createdBy === assignedTo)
 *
 * @param userId - The user ID to ensure has a Quick Workout
 * @returns Promise<boolean> - true if created, false if already exists
 */
export async function ensureQuickWorkout(userId: string): Promise<boolean> {
  try {
    // Check if user already has a Quick Workout
    const existingQuickWorkout = await prisma.trainingPlan.findFirst({
      where: {
        title: 'Quick Workout',
        createdById: userId,
        assignedToId: userId,
        active: false,
        isTemplate: false,
      },
    })

    // If Quick Workout already exists, skip creation
    if (existingQuickWorkout) {
      console.info(
        `[ensureQuickWorkout] User ${userId} already has Quick Workout`,
      )
      return false
    }

    // Create Quick Workout plan
    console.info(`[ensureQuickWorkout] Creating Quick Workout for user ${userId}`)

    const weekStart = getUTCWeekStart()

    await prisma.trainingPlan.create({
      data: {
        title: 'Quick Workout',
        createdById: userId,
        assignedToId: userId,
        isPublic: false,
        isDraft: false,
        active: false, // Not active by default
        isTemplate: false,
        weeks: {
          create: {
            name: `Week ${getISOWeek(weekStart)}`,
            weekNumber: 1,
            isExtra: true,
            scheduledAt: weekStart,
            days: {
              createMany: {
                data: Array.from({ length: 7 }, (_, i) => ({
                  dayOfWeek: i,
                  isRestDay: false,
                  isExtra: true,
                  scheduledAt: addDays(weekStart, i),
                })),
              },
            },
          },
        },
      },
    })

    console.info(
      `[ensureQuickWorkout] Successfully created Quick Workout for user ${userId}`,
    )
    return true
  } catch (error) {
    console.error(
      `[ensureQuickWorkout] Failed to create Quick Workout for user ${userId}:`,
      error,
    )
    // Don't throw - this is a background operation that shouldn't block login
    return false
  }
}

