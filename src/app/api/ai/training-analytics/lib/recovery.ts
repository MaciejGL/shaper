import {
  differenceInCalendarDays,
  differenceInHours,
  startOfDay,
  subDays,
} from 'date-fns'

import { TRACKED_DISPLAY_GROUPS, getMuscleById } from '@/config/muscles'
import type { PrismaClient } from '@/generated/prisma/client'

import type { RecentRecoveryInput, RecoveryItem } from './types'

const TRACKED_DISPLAY_GROUPS_SET = new Set<string>(TRACKED_DISPLAY_GROUPS)

export function getRecoveryTarget(effectiveSets: number): number {
  if (effectiveSets <= 4) return 36 // Light: ready in 1.5 days
  if (effectiveSets <= 8) return 48 // Moderate: ready in 2 days
  return 72 // Heavy: ready in 3 days
}

export async function getRecentRecoveryInputs(params: {
  prisma: PrismaClient
  userId: string
  lookbackDays: number
  dayWeights: readonly number[]
  now?: Date
}): Promise<RecentRecoveryInput[]> {
  const now = params.now ?? new Date()
  const cutoff = subDays(now, params.lookbackDays)

  const exercises = await params.prisma.trainingExercise.findMany({
    where: {
      day: { week: { plan: { assignedToId: params.userId } } },
      sets: { some: { completedAt: { gte: cutoff } } },
    },
    include: {
      base: { include: { muscleGroups: true } },
      sets: { where: { completedAt: { gte: cutoff } } },
    },
  })

  const latestByGroup = new Map<string, Date>()
  const setsByGroupByDayStartMs = new Map<string, Map<number, number>>()

  const addSetsForGroupOnDay = (
    group: string,
    dayStartMs: number,
    sets: number,
  ) => {
    const byDay =
      setsByGroupByDayStartMs.get(group) ?? new Map<number, number>()
    byDay.set(dayStartMs, (byDay.get(dayStartMs) ?? 0) + sets)
    setsByGroupByDayStartMs.set(group, byDay)
  }

  exercises.forEach((exercise) => {
    if (!exercise.base) return

    const groups = new Set<string>()
    exercise.base.muscleGroups?.forEach((mg) => {
      const displayGroup = getMuscleById(mg.id)?.displayGroup
      if (!displayGroup) return
      if (!TRACKED_DISPLAY_GROUPS_SET.has(displayGroup)) return
      groups.add(displayGroup)
    })

    exercise.sets.forEach((set) => {
      const completedAt = set.completedAt
      if (!completedAt) return

      const dayStartMs = startOfDay(completedAt).getTime()
      groups.forEach((group) => {
        const prev = latestByGroup.get(group)
        if (!prev || completedAt > prev) {
          latestByGroup.set(group, completedAt)
        }
        addSetsForGroupOnDay(group, dayStartMs, 1)
      })
    })
  })

  return TRACKED_DISPLAY_GROUPS.map((group) => {
    const byDay = setsByGroupByDayStartMs.get(group)
    let effective = 0

    if (byDay) {
      byDay.forEach((sets, dayStartMs) => {
        const daysAgo = differenceInCalendarDays(now, new Date(dayStartMs))
        const weight = params.dayWeights[daysAgo]
        if (weight == null) return
        effective += sets * weight
      })
    }

    return {
      muscle: group,
      lastTrained: latestByGroup.get(group) ?? null,
      effectiveSetsForTarget: Math.max(0, Math.round(effective)),
    }
  })
}

export function buildRecovery(params: {
  now: Date
  recentInputs: RecentRecoveryInput[]
}): RecoveryItem[] {
  const recovery: RecoveryItem[] = params.recentInputs.map((m) => {
    const hours = m.lastTrained ? differenceInHours(params.now, m.lastTrained) : 168

    const targetHours =
      m.effectiveSetsForTarget > 0 ? getRecoveryTarget(m.effectiveSetsForTarget) : 72

    const percentRecovered = Math.min(
      100,
      Math.round((hours / targetHours) * 100),
    )

    return {
      muscle: m.muscle,
      hours,
      targetHours,
      percentRecovered,
    }
  })

  recovery.sort((a, b) => a.hours - b.hours)
  return recovery
}

