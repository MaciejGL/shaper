import { differenceInHours, endOfWeek, startOfWeek, subWeeks } from 'date-fns'

import {
  DEFAULT_SETS_GOAL_PER_GROUP,
  HIGH_LEVEL_TO_DISPLAY_GROUPS,
  SVG_ALIAS_TO_DISPLAY_GROUP,
  TRACKED_DISPLAY_GROUPS,
  getMuscleById,
} from '@/config/muscles'
import { prisma } from '@/lib/db'

import type { MuscleProgressData } from './types'

// Same recovery targeting as Progress (volume-based recovery time)
function getRecoveryTargetHours(setsInLastSession: number): number {
  if (setsInLastSession <= 4) return 36
  if (setsInLastSession <= 8) return 48
  return 72
}

export function getFocusDisplayGroups(workoutType?: string): string[] {
  if (!workoutType) return []
  const normalized = workoutType.trim().toLowerCase()
  if (!normalized) return []

  const trackedMatch = TRACKED_DISPLAY_GROUPS.find(
    (g) => g.toLowerCase() === normalized,
  )
  if (trackedMatch) return [trackedMatch]

  const aliasKey = normalized.replace(/\s+/g, '_')
  const svgMatch =
    SVG_ALIAS_TO_DISPLAY_GROUP[normalized] || SVG_ALIAS_TO_DISPLAY_GROUP[aliasKey]
  if (svgMatch) return [svgMatch]

  const highLevelKey = (
    Object.keys(HIGH_LEVEL_TO_DISPLAY_GROUPS) as (keyof typeof HIGH_LEVEL_TO_DISPLAY_GROUPS)[]
  ).find((k) => k.toLowerCase() === normalized)
  if (highLevelKey) return HIGH_LEVEL_TO_DISPLAY_GROUPS[highLevelKey]

  return []
}

export async function getWeeklyMuscleProgress(
  userId: string,
): Promise<MuscleProgressData[]> {
  const userProfile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { weekStartsOn: true },
  })
  const weekStartsOn = (userProfile?.weekStartsOn ?? 1) as
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6

  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn })
  const weekEnd = endOfWeek(now, { weekStartsOn })

  const exercises = await prisma.trainingExercise.findMany({
    where: {
      day: {
        scheduledAt: { gte: weekStart, lte: weekEnd },
        week: { plan: { assignedToId: userId } },
      },
      sets: { some: { completedAt: { not: null } } },
    },
    include: {
      base: { include: { muscleGroups: true } },
      sets: { where: { completedAt: { not: null } } },
    },
  })

  const muscleProgress: Record<string, { completedSets: number; lastTrained: Date | null }> =
    {}
  const lastSessionSets: Record<string, number> = {}

  TRACKED_DISPLAY_GROUPS.forEach((group) => {
    muscleProgress[group] = { completedSets: 0, lastTrained: null }
    lastSessionSets[group] = 0
  })

  exercises.forEach((exercise) => {
    if (!exercise.base) return
    const setCount = exercise.sets.length
    const countedGroups = new Set<string>()

    exercise.base.muscleGroups?.forEach((mg) => {
      const displayGroup = getMuscleById(mg.id)?.displayGroup
      if (
        displayGroup &&
        muscleProgress[displayGroup] &&
        !countedGroups.has(displayGroup)
      ) {
        muscleProgress[displayGroup].completedSets += setCount
        countedGroups.add(displayGroup)

        exercise.sets.forEach((set) => {
          if (
            set.completedAt &&
            (!muscleProgress[displayGroup].lastTrained ||
              set.completedAt > muscleProgress[displayGroup].lastTrained!)
          ) {
            muscleProgress[displayGroup].lastTrained = set.completedAt
          }
        })
      }
    })
  })

  // Last-session volume for each muscle group (used for recovery target hours)
  exercises.forEach((exercise) => {
    if (!exercise.base) return
    const setCount = exercise.sets.length
    if (setCount === 0) return

    const exerciseDay = exercise.sets[0]?.completedAt?.toDateString()
    if (!exerciseDay) return

    const countedGroups = new Set<string>()
    exercise.base.muscleGroups?.forEach((mg) => {
      const displayGroup = getMuscleById(mg.id)?.displayGroup
      if (!displayGroup || countedGroups.has(displayGroup)) return

      const lastTrained = muscleProgress[displayGroup]?.lastTrained
      if (lastTrained && lastTrained.toDateString() === exerciseDay) {
        lastSessionSets[displayGroup] += setCount
        countedGroups.add(displayGroup)
      }
    })
  })

  return TRACKED_DISPLAY_GROUPS.map((group) => {
    const completedSets = Math.floor(muscleProgress[group].completedSets)
    const lastTrained = muscleProgress[group].lastTrained
    const hoursSinceLastTrained = lastTrained ? differenceInHours(now, lastTrained) : 168
    const lastSession = Math.floor(lastSessionSets[group] ?? 0)
    const targetHours = lastSession > 0 ? getRecoveryTargetHours(lastSession) : 72
    const percentRecovered = Math.min(
      100,
      Math.round((hoursSinceLastTrained / targetHours) * 100),
    )

    return {
      muscle: group,
      completedSets,
      targetSets: DEFAULT_SETS_GOAL_PER_GROUP,
      percentRecovered,
      lastSessionSets: lastSession,
    }
  })
}

export function selectMusclesToQuery(params: {
  muscleProgress: MuscleProgressData[]
  focusDisplayGroups: string[]
  habitBias: Map<string, number>
}): { targetMuscles: string[]; musclesToQuery: string[] } {
  const recovered100 = params.muscleProgress.filter((m) => m.percentRecovered >= 100)
  const recovered90 = params.muscleProgress.filter((m) => m.percentRecovered >= 90)
  const candidates =
    recovered100.length > 0
      ? recovered100
      : recovered90.length > 0
        ? recovered90
        : params.muscleProgress

  const targetMuscles = [...candidates]
    .sort((a, b) => {
      const aFocus = params.focusDisplayGroups.includes(a.muscle) ? 1 : 0
      const bFocus = params.focusDisplayGroups.includes(b.muscle) ? 1 : 0
      if (aFocus !== bFocus) return bFocus - aFocus

      const aDeficit = Math.max(0, a.targetSets - a.completedSets)
      const bDeficit = Math.max(0, b.targetSets - b.completedSets)
      if (aDeficit !== bDeficit) return bDeficit - aDeficit

      const aHabit = params.habitBias.get(a.muscle) ?? 0
      const bHabit = params.habitBias.get(b.muscle) ?? 0
      if (aHabit !== bHabit) return bHabit - aHabit

      return b.percentRecovered - a.percentRecovered
    })
    .map((m) => m.muscle)
    .slice(0, 6)

  const musclesToQuery =
    targetMuscles.length > 0
      ? Array.from(
          new Set([...params.focusDisplayGroups, ...targetMuscles]),
        ).slice(0, 6)
      : params.focusDisplayGroups.length > 0
        ? params.focusDisplayGroups.slice(0, 4)
        : TRACKED_DISPLAY_GROUPS.slice(0, 4)

  return { targetMuscles, musclesToQuery }
}

export async function getHabitBiasStartOfWeek(
  userId: string,
): Promise<Map<string, number>> {
  const userProfile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { weekStartsOn: true },
  })
  const weekStartsOn = (userProfile?.weekStartsOn ?? 1) as
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6

  const now = new Date()
  const habitWeeks = 8
  const startDate = startOfWeek(subWeeks(now, habitWeeks - 1), { weekStartsOn })
  const endDate = endOfWeek(now, { weekStartsOn })

  const exercises = await prisma.trainingExercise.findMany({
    where: {
      day: {
        scheduledAt: { gte: startDate, lte: endDate },
        week: { plan: { assignedToId: userId } },
      },
      sets: { some: { completedAt: { not: null } } },
    },
    include: {
      day: { select: { scheduledAt: true } },
      base: { include: { muscleGroups: true } },
      sets: { where: { completedAt: { not: null } } },
    },
  })

  if (exercises.length === 0) return new Map()

  const byWeek = new Map<
    string,
    { earliestMs: number; totals: Map<string, number> }
  >()

  exercises.forEach((exercise) => {
    const scheduledAt = exercise.day?.scheduledAt
    if (!scheduledAt) return
    const weekKey = startOfWeek(scheduledAt, { weekStartsOn }).toISOString()
    const existing = byWeek.get(weekKey)
    const ms = scheduledAt.getTime()
    if (!existing) {
      byWeek.set(weekKey, { earliestMs: ms, totals: new Map() })
      return
    }
    if (ms < existing.earliestMs) {
      existing.earliestMs = ms
      existing.totals = new Map()
    }
  })

  exercises.forEach((exercise) => {
    const scheduledAt = exercise.day?.scheduledAt
    if (!scheduledAt) return
    if (!exercise.base) return
    if (exercise.sets.length === 0) return

    const weekKey = startOfWeek(scheduledAt, { weekStartsOn }).toISOString()
    const weekEntry = byWeek.get(weekKey)
    if (!weekEntry) return
    if (scheduledAt.getTime() !== weekEntry.earliestMs) return

    const setCount = exercise.sets.length
    const countedGroups = new Set<string>()
    exercise.base.muscleGroups?.forEach((mg) => {
      const group = getMuscleById(mg.id)?.displayGroup
      if (!group || countedGroups.has(group)) return
      weekEntry.totals.set(group, (weekEntry.totals.get(group) ?? 0) + setCount)
      countedGroups.add(group)
    })
  })

  const bias = new Map<string, number>()
  byWeek.forEach(({ totals }) => {
    const top = Array.from(totals.entries()).sort((a, b) => b[1] - a[1])[0]
    if (!top) return
    const [group] = top
    bias.set(group, (bias.get(group) ?? 0) + 1)
  })

  return bias
}


