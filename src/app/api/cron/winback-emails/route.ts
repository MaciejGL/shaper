import { NextResponse } from 'next/server'

import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email/send-mail'

export const dynamic = 'force-dynamic'

/**
 * Cron job to send win-back emails to inactive users
 * Runs daily, sends to users who:
 * - Have completed at least 1 workout
 * - Last workout was 14 days ago
 * - Don't have any active subscription
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const now = new Date()
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
    const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)

    // Get users without active subscription
    const usersWithWorkouts = await prisma.user.findMany({
      where: {
        subscriptions: {
          none: {
            status: { in: ['ACTIVE', 'CANCELLED_ACTIVE'] },
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        profile: { select: { firstName: true } },
      },
    })

    let sent = 0
    const errors: string[] = []

    for (const user of usersWithWorkouts) {
      if (!user.email) continue

      try {
        // Get all completed workouts for this user
        const completedDays = await prisma.trainingDay.findMany({
          where: {
            completedAt: { not: null },
            week: {
              plan: {
                OR: [{ assignedToId: user.id }, { createdById: user.id }],
              },
            },
          },
          orderBy: { completedAt: 'desc' },
          select: {
            completedAt: true,
            workoutType: true,
            exercises: {
              select: {
                name: true,
                sets: {
                  select: {
                    log: { select: { weight: true } },
                  },
                },
              },
            },
          },
        })

        if (completedDays.length === 0) continue

        const lastWorkoutDate = completedDays[0].completedAt!

        // Check if last workout was 14-15 days ago
        if (
          lastWorkoutDate < fifteenDaysAgo ||
          lastWorkoutDate > fourteenDaysAgo
        )
          continue

        const daysSinceLastWorkout = Math.floor(
          (now.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24),
        )

        // Get top lifts from all workouts (convert Decimal to number)
        const exerciseMaxWeights = new Map<string, number>()
        for (const day of completedDays) {
          for (const exercise of day.exercises) {
            for (const set of exercise.sets) {
              const weight = Number(set.log?.weight ?? 0)
              if (weight > 0) {
                const current = exerciseMaxWeights.get(exercise.name) || 0
                if (weight > current) {
                  exerciseMaxWeights.set(exercise.name, weight)
                }
              }
            }
          }
        }

        const topLifts = [...exerciseMaxWeights.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([name, weight]) => ({ name, weight, unit: 'kg' }))

        const userName = user.profile?.firstName || user.name || undefined
        const lastWorkout = completedDays[0]

        await sendEmail.winback(user.email, {
          userId: user.id,
          userName,
          daysSinceLastWorkout,
          totalWorkouts: completedDays.length,
          lastWorkoutName: lastWorkout.workoutType || null,
          lastWorkoutDate: lastWorkoutDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          topLifts,
        })

        sent++
      } catch (err) {
        console.error(`Failed to send winback email to ${user.email}:`, err)
        errors.push(user.email)
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      checked: usersWithWorkouts.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Winback emails cron error:', error)
    return NextResponse.json(
      { error: 'Failed to send winback emails' },
      { status: 500 },
    )
  }
}

