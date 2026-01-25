import { useMemo } from 'react'

import {
  DISPLAY_GROUP_TO_HIGH_LEVEL,
  HIGH_LEVEL_GROUPS,
  type HighLevelGroup,
} from '@/config/muscles'
import { useUser } from '@/context/user-context'
import { useWeeklyMuscleProgressQuery } from '@/generated/graphql-client'

import type { WeeklyGroupSummary } from './types'

export function useWeeklyFocus(scheduledAt?: string | null) {
  const { user } = useUser()

  const { data, isLoading } = useWeeklyMuscleProgressQuery(
    {
      userId: user?.id || '',
      targetDate: scheduledAt || undefined,
    },
    { enabled: !!user?.id },
  )

  const weeklyProgress = data?.weeklyMuscleProgress

  const groupSummaries = useMemo<WeeklyGroupSummary[]>(() => {
    const aggregated: Record<
      HighLevelGroup,
      { setsDone: number; setsGoal: number }
    > = {} as Record<HighLevelGroup, { setsDone: number; setsGoal: number }>

    HIGH_LEVEL_GROUPS.forEach((group) => {
      aggregated[group] = { setsDone: 0, setsGoal: 0 }
    })

    if (weeklyProgress?.muscleProgress) {
      weeklyProgress.muscleProgress.forEach((progress) => {
        const highLevelGroup = DISPLAY_GROUP_TO_HIGH_LEVEL[progress.muscleGroup]
        if (highLevelGroup && aggregated[highLevelGroup]) {
          aggregated[highLevelGroup].setsDone += progress.completedSets
          aggregated[highLevelGroup].setsGoal += progress.targetSets
        }
      })
    }

    const summaries = HIGH_LEVEL_GROUPS.map((group) => ({
      groupId: group,
      label: group,
      setsDone: aggregated[group].setsDone,
      setsGoal: aggregated[group].setsGoal,
    }))
      .filter((s) => s.setsGoal > 0)
      // Sort by deficit ratio (most behind first)
      .sort((a, b) => {
        const aRatio = a.setsGoal > 0 ? a.setsDone / a.setsGoal : 1
        const bRatio = b.setsGoal > 0 ? b.setsDone / b.setsGoal : 1
        return aRatio - bRatio
      })

    // Keep any zero-goal groups at the end (rare fallback)
    const zeroGoal = HIGH_LEVEL_GROUPS.map((group) => ({
      groupId: group,
      label: group,
      setsDone: aggregated[group].setsDone,
      setsGoal: aggregated[group].setsGoal,
    })).filter((s) => s.setsGoal === 0)

    return [...summaries, ...zeroGoal]
  }, [weeklyProgress])

  return {
    groupSummaries,
    isLoading,
  }
}
