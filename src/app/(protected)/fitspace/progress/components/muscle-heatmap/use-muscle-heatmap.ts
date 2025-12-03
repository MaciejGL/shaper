import { endOfWeek, startOfWeek, subWeeks } from 'date-fns'
import { useState } from 'react'

import { useUser } from '@/context/user-context'
import { useWeeklyMuscleProgressQuery } from '@/generated/graphql-client'

export function useMuscleHeatmap(externalWeekOffset?: number) {
  const { user } = useUser()
  const [internalWeekOffset, setInternalWeekOffset] = useState(0)
  
  const weekOffset = externalWeekOffset ?? internalWeekOffset
  const setWeekOffset = setInternalWeekOffset
  
  const weekStartsOn = (user?.profile?.weekStartsOn ?? 1) as 0 | 1 | 2 | 3 | 4 | 5 | 6

  const { data, isLoading, error } = useWeeklyMuscleProgressQuery(
    {
      userId: user?.id || '',
      weekOffset,
    },
    { enabled: !!user?.id },
  )

  const weeklyProgress = data?.weeklyMuscleProgress
  
  // Calculate week dates client-side for immediate UI update
  const now = new Date()
  const targetWeek = subWeeks(now, weekOffset)
  const weekStartDate = startOfWeek(targetWeek, { weekStartsOn }).toISOString()
  const weekEndDate = endOfWeek(targetWeek, { weekStartsOn }).toISOString()

  // Convert muscle progress to intensity map for body view (0-1 scale based on percentage)
  const muscleIntensity: Record<string, number> = {}
  const muscleProgress: Record<
    string,
    {
      completedSets: number
      targetSets: number
      percentage: number
      lastTrained: string | null
    }
  > = {}

  if (weeklyProgress?.muscleProgress) {
    weeklyProgress.muscleProgress.forEach((progress) => {
      // Normalize percentage to 0-1 scale for body coloring
      muscleIntensity[progress.muscleGroup] = progress.percentage / 100
      muscleProgress[progress.muscleGroup] = {
        completedSets: progress.completedSets,
        targetSets: progress.targetSets,
        percentage: progress.percentage,
        lastTrained: progress.lastTrained || null,
      }
    })
  }

  // Calculate total sets this week
  const totalSets =
    weeklyProgress?.muscleProgress.reduce(
      (sum, m) => sum + m.completedSets,
      0,
    ) ?? 0

  // Week navigation handlers
  const goToPreviousWeek = () => setWeekOffset((prev) => prev + 1)
  const goToNextWeek = () => setWeekOffset((prev) => Math.max(0, prev - 1))
  const goToCurrentWeek = () => setWeekOffset(0)

  return {
    // Weekly progress data
    overallPercentage: weeklyProgress?.overallPercentage ?? 0,
    streakWeeks: weeklyProgress?.streakWeeks ?? 0,
    weekStartDate,
    weekEndDate,
    muscleProgress,

    // For body view compatibility
    muscleIntensity,
    totalSets,

    // Week navigation
    weekOffset,
    setWeekOffset,
    isCurrentWeek: weekOffset === 0,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,

    // Query state
    isLoading,
    error,
  }
}
