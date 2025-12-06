import { useMemo } from 'react'

import {
  DEFAULT_SETS_GOAL_PER_GROUP,
  DISPLAY_GROUP_TO_HIGH_LEVEL,
  HIGH_LEVEL_GROUPS,
  type HighLevelGroup,
} from '@/constants/muscles'
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
      aggregated[group] = { setsDone: 0, setsGoal: DEFAULT_SETS_GOAL_PER_GROUP }
    })

    if (weeklyProgress?.muscleProgress) {
      weeklyProgress.muscleProgress.forEach((progress) => {
        const highLevelGroup = DISPLAY_GROUP_TO_HIGH_LEVEL[progress.muscleGroup]
        if (highLevelGroup && aggregated[highLevelGroup]) {
          aggregated[highLevelGroup].setsDone += progress.completedSets
        }
      })
    }

    return HIGH_LEVEL_GROUPS.map((group) => ({
      groupId: group,
      label: group,
      setsDone: aggregated[group].setsDone,
      setsGoal: aggregated[group].setsGoal,
    }))
  }, [weeklyProgress])

  return {
    groupSummaries,
    isLoading,
  }
}
