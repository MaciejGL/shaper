import { addDays, addWeeks, getISOWeek, isSameWeek } from 'date-fns'

import { prisma } from '@/lib/db'
import { getWeekStartUTC } from '@/lib/server-date-utils'

/**
 * Ensures the Quick Workout plan has weeks for the current period + buffer.
 * Creates current week + next N weeks ahead if they don't exist.
 *
 * This centralizes all week creation logic for Quick Workouts to avoid duplication.
 *
 * @param planId - The Quick Workout training plan ID
 * @param weeksAhead - Number of weeks to create ahead of current week (default: 4)
 * @returns Promise that resolves when weeks are ensured
 */
export async function ensureQuickWorkoutWeeks(
  planId: string,
  weeksAhead: number = 4,
): Promise<void> {
  const plan = await prisma.trainingPlan.findUnique({
    where: { id: planId },
    include: { weeks: true },
  })

  if (!plan) {
    return
  }

  const currentWeekStart = getWeekStartUTC(new Date(), 'UTC', 1)
  const weeksToCreate: { weekStart: Date; weekNumber: number }[] = []

  // Check current week + N weeks ahead
  for (let i = 0; i <= weeksAhead; i++) {
    const targetWeekStart = addWeeks(currentWeekStart, i)
    const targetWeekNumber = getISOWeek(targetWeekStart)

    const weekExists = plan.weeks.some((week) => {
      if (!week.scheduledAt) return false
      return isSameWeek(week.scheduledAt, targetWeekStart)
    })

    if (!weekExists) {
      weeksToCreate.push({
        weekStart: targetWeekStart,
        weekNumber: targetWeekNumber,
      })
    }
  }

  // Batch create all missing weeks with their days
  if (weeksToCreate.length > 0) {
    await Promise.all(
      weeksToCreate.map((week) =>
        prisma.trainingWeek.create({
          data: {
            planId: plan.id,
            weekNumber: week.weekNumber,
            name: `Week ${week.weekNumber}`,
            scheduledAt: week.weekStart,
            isExtra: true,
            days: {
              createMany: {
                data: Array.from({ length: 7 }, (_, i) => ({
                  dayOfWeek: i,
                  isRestDay: false,
                  isExtra: true,
                  scheduledAt: addDays(week.weekStart, i),
                })),
              },
            },
          },
        }),
      ),
    )
  }
}

/**
 * Checks if a training plan is a Quick Workout (self-created and self-assigned)
 */
export function isQuickWorkoutPlan(
  plan: { createdById: string; assignedToId: string },
  userId: string,
): boolean {
  return plan.createdById === userId && plan.assignedToId === userId
}
