import { useState } from 'react'

import { useUser } from '@/context/user-context'
import { useWeeklyMuscleProgressQuery } from '@/generated/graphql-client'

export function useMuscleHeatmap() {
  const { user } = useUser()
  const [weekOffset, setWeekOffset] = useState(0)

  const { data, isLoading, error } = useWeeklyMuscleProgressQuery(
    {
      userId: user?.id || '',
      weekOffset,
    },
    { enabled: !!user?.id },
  )

  const weeklyProgress = data?.weeklyMuscleProgress

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
    weekStartDate: weeklyProgress?.weekStartDate ?? null,
    weekEndDate: weeklyProgress?.weekEndDate ?? null,
    muscleProgress,

    // For body view compatibility
    muscleIntensity,
    totalSets,

    // Week navigation
    weekOffset,
    isCurrentWeek: weekOffset === 0,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,

    // Query state
    isLoading,
    error,
  }
}
