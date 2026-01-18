import { NextResponse } from 'next/server'

import { cache } from '@/lib/cache'
import { prisma } from '@/lib/db'

type UserAverages = {
  activeUsers: number
  avgWorkouts: number
  avgExercises: number
  avgSets: number
  avgReps: number
  avgPRs: number
}

type Totals = {
  workouts: number
  exercises: number
  sets: number
  reps: number
  prs: number
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

function safeAvg(total: number, users: number): number {
  if (users <= 0) return 0
  return Math.round(total / users)
}

async function getActiveUsersCount(): Promise<number> {
  const rows = await prisma.$queryRaw<{ active_users: bigint | number }[]>`
    select count(*) as active_users
    from (
      select tp."assignedToId"
      from "TrainingDay" td
      join "TrainingWeek" tw on tw.id = td."weekId"
      join "TrainingPlan" tp on tp.id = tw."planId"
      where td."completedAt" is not null
        and tp."assignedToId" is not null
      group by tp."assignedToId"
      having count(*) >= 10
    ) t
  `

  return toNumber(rows[0]?.active_users)
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

async function countPRsInRange(startAt: Date, endAt: Date): Promise<number> {
  return prisma.personalRecord.count({
    where: { achievedAt: { gte: startAt, lt: endAt } },
  })
}

async function getTotalsInRange(startAt: Date, endAt: Date): Promise<Totals> {
  const [workouts, exercises, sets, reps, prs] = await Promise.all([
    prisma.trainingDay.count({ where: { completedAt: { gte: startAt, lt: endAt } } }),
    prisma.trainingExercise.count({
      where: { completedAt: { gte: startAt, lt: endAt } },
    }),
    prisma.exerciseSet.count({ where: { completedAt: { gte: startAt, lt: endAt } } }),
    sumRepsInRange(startAt, endAt),
    countPRsInRange(startAt, endAt),
  ])

  return { workouts, exercises, sets, reps, prs }
}

export async function GET() {
  try {
    const now = new Date()
    const todayStart = getUtcStartOfDay(now)
    const dayKey = getUtcDayKey(todayStart)

    // Cache big historical totals up to today (UTC) for 24h
    const historicalKey = `user-stats:historical:${dayKey}`
    const historical = await cache.getOrSet<Totals>(
      historicalKey,
      async () => getTotalsInRange(new Date(0), todayStart),
      cache.TTL.VERY_LONG,
    )

    // Today's delta (small, uncached)
    const today = await getTotalsInRange(todayStart, now)

    // Active users (≥10 workouts) – cached short/medium to avoid heavy grouping per poll
    const activeUsersKey = 'user-stats:active-users:v1'
    const activeUsers = await cache.getOrSet<number>(
      activeUsersKey,
      getActiveUsersCount,
      cache.TTL.MEDIUM,
    )

    const totals = {
      workouts: historical.workouts + today.workouts,
      exercises: historical.exercises + today.exercises,
      sets: historical.sets + today.sets,
      reps: historical.reps + today.reps,
      prs: historical.prs + today.prs,
    }

    const result: UserAverages = {
      activeUsers,
      avgWorkouts: safeAvg(totals.workouts, activeUsers),
      avgExercises: safeAvg(totals.exercises, activeUsers),
      avgSets: safeAvg(totals.sets, activeUsers),
      avgReps: safeAvg(totals.reps, activeUsers),
      avgPRs: safeAvg(totals.prs, activeUsers),
    }

    return NextResponse.json({ ...result, updatedAt: now.toISOString() })
  } catch (error) {
    console.error('Failed to fetch user stats:', error)
    return NextResponse.json({ error: 'Failed to fetch user stats' }, { status: 500 })
  }
}

