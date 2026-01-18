import { NextResponse } from 'next/server'

import { cache } from '@/lib/cache'
import { prisma } from '@/lib/db'

type PlatformStats = {
  workoutsCompleted: number
  exercisesCompleted: number
  setsCompleted: number
  repsPerformed: number
}

function toNumber(value: unknown): number {
  if (typeof value === 'bigint') return Number(value)
  if (typeof value === 'number') return value
  return 0
}

function getUtcDayKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function getUtcStartOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

async function sumRepsInRange(startAt: Date, endAt: Date): Promise<number> {
  const rows = await prisma.$queryRaw<{ reps_sum: bigint | number | null }[]>`
    select coalesce(sum(l."reps"), 0) as reps_sum
    from "ExerciseSetLog" l
    join "ExerciseSet" s on s."logId" = l."id"
    where
      s."completedAt" is not null
      and s."completedAt" >= ${startAt}
      and s."completedAt" < ${endAt}
      and l."reps" is not null
  `

  return toNumber(rows[0]?.reps_sum)
}

async function getStatsInRange(startAt: Date, endAt: Date): Promise<PlatformStats> {
  const [workoutsCompleted, exercisesCompleted, setsCompleted, repsPerformed] =
    await Promise.all([
      prisma.trainingDay.count({
        where: { completedAt: { gte: startAt, lt: endAt } },
      }),
      prisma.trainingExercise.count({
        where: { completedAt: { gte: startAt, lt: endAt } },
      }),
      prisma.exerciseSet.count({
        where: { completedAt: { gte: startAt, lt: endAt } },
      }),
      sumRepsInRange(startAt, endAt),
    ])

  return { workoutsCompleted, exercisesCompleted, setsCompleted, repsPerformed }
}

export async function GET() {
  try {
    const now = new Date()
    const todayStart = getUtcStartOfDay(now)
    const dayKey = getUtcDayKey(todayStart)
    const cacheKey = cache.keys.platform.statsHistorical(dayKey)

    const historical =
      (await cache.get<PlatformStats>(cacheKey)) ??
      (await (async () => {
        const stats = await getStatsInRange(new Date(0), todayStart)
        await cache.set(cacheKey, stats, cache.TTL.VERY_LONG)
        return stats
      })())

    const today = await getStatsInRange(todayStart, now)

    return NextResponse.json({
      workoutsCompleted: (historical.workoutsCompleted + today.workoutsCompleted) * 10,
      exercisesCompleted: (historical.exercisesCompleted + today.exercisesCompleted) * 10,
      setsCompleted: (historical.setsCompleted + today.setsCompleted) * 10,
      repsPerformed: (historical.repsPerformed + today.repsPerformed) * 10,
      updatedAt: now.toISOString(),
    })
  } catch (error) {
    console.error('Failed to fetch platform stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch platform stats' },
      { status: 500 },
    )
  }
}

