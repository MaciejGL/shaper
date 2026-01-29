import { NextResponse } from 'next/server'

import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email/send-mail'
import { notifyWeeklyStreak } from '@/lib/notifications/push-notification-service'

export const dynamic = 'force-dynamic'

/**
 * Cron job to send weekly progress summary emails
 * Runs daily, sends to users who:
 * - Signed up 7 days ago (within a 1-hour window)
 * - Have been active (completed at least 1 workout)
 * - Don't have any active subscription
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const sevenDaysAgoMinusHour = new Date(
      sevenDaysAgo.getTime() - 60 * 60 * 1000,
    )

    // Get users who signed up 7 days ago and don't have active subscription
    const eligibleUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgoMinusHour,
          lte: sevenDaysAgo,
        },
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

    for (const user of eligibleUsers) {
      if (!user.email) continue

      try {
        // Get completed workouts in last 7 days with stats
        const completedDays = await prisma.trainingDay.findMany({
          relationLoadStrategy: 'query',
          where: {
            completedAt: { gte: sevenDaysAgo },
            week: {
              plan: {
                OR: [{ assignedToId: user.id }, { createdById: user.id }],
              },
            },
          },
          select: {
            workoutType: true,
            exercises: {
              select: {
                baseId: true,
                sets: {
                  where: { completedAt: { not: null } },
                  select: { id: true },
                },
              },
            },
          },
        })

        const workoutCount = completedDays.length
        if (workoutCount === 0) continue

        // Calculate stats from fetched data
        const allSets = completedDays.flatMap((d) =>
          d.exercises.flatMap((e) => e.sets),
        )
        const uniqueExercises = new Set(
          completedDays.flatMap((d) =>
            d.exercises.map((e) => e.baseId).filter(Boolean),
          ),
        )
        const workoutTypes = [
          ...new Set(completedDays.map((d) => d.workoutType).filter(Boolean)),
        ].slice(0, 3)

        const userName = user.profile?.firstName || user.name || undefined

        if (workoutCount >= 3) {
          await notifyWeeklyStreak(user.id, workoutCount)
        }

        await sendEmail.weeklyProgress(user.email, {
          userId: user.id,
          userName,
          workoutCount,
          totalSets: allSets.length,
          exerciseCount: uniqueExercises.size,
          topMuscleGroups: workoutTypes as string[],
        })

        sent++
      } catch (err) {
        console.error(`Failed to send weekly progress to ${user.email}:`, err)
        errors.push(user.email)
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      checked: eligibleUsers.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Weekly progress cron error:', error)
    return NextResponse.json(
      { error: 'Failed to send weekly progress emails' },
      { status: 500 },
    )
  }
}
