import { endOfWeek, startOfWeek, subWeeks } from 'date-fns'

import {
  DEFAULT_SETS_GOAL_PER_GROUP,
  TRACKED_DISPLAY_GROUPS,
  getMuscleById,
} from '@/config/muscles'
import type { PrismaClient } from '@/generated/prisma/client'

import type { MuscleProgressData } from './types'

export async function getWeeklyMuscleProgress(params: {
  prisma: PrismaClient
  userId: string
  weekOffset?: number
}): Promise<MuscleProgressData[]> {
  const weekOffset = params.weekOffset ?? 0

  const userProfile = await params.prisma.userProfile.findUnique({
    where: { userId: params.userId },
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
  const targetWeek = subWeeks(now, weekOffset)
  const weekStart = startOfWeek(targetWeek, { weekStartsOn })
  const weekEnd = endOfWeek(targetWeek, { weekStartsOn })

  const exercises = await params.prisma.trainingExercise.findMany({
    where: {
      day: {
        scheduledAt: { gte: weekStart, lte: weekEnd },
        week: { plan: { assignedToId: params.userId } },
      },
      sets: { some: { completedAt: { not: null } } },
    },
    include: {
      base: { include: { muscleGroups: true } },
      sets: { where: { completedAt: { not: null } } },
    },
  })

  const byDisplayGroup: Record<string, number> = Object.fromEntries(
    TRACKED_DISPLAY_GROUPS.map((g) => [g, 0]),
  )

  exercises.forEach((exercise) => {
    if (!exercise.base) return
    const setCount = exercise.sets.length
    const countedGroups = new Set<string>()

    exercise.base.muscleGroups?.forEach((mg) => {
      const displayGroup = getMuscleById(mg.id)?.displayGroup
      if (!displayGroup || byDisplayGroup[displayGroup] == null) return
      if (countedGroups.has(displayGroup)) return
      byDisplayGroup[displayGroup] += setCount
      countedGroups.add(displayGroup)
    })
  })

  return TRACKED_DISPLAY_GROUPS.map((group) => {
    const completedSets = Math.floor(byDisplayGroup[group] ?? 0)
    return {
      muscle: group,
      completedSets,
      targetSets: DEFAULT_SETS_GOAL_PER_GROUP,
      percentage: Math.min(
        100,
        Math.round((completedSets / DEFAULT_SETS_GOAL_PER_GROUP) * 100),
      ),
    }
  })
}

