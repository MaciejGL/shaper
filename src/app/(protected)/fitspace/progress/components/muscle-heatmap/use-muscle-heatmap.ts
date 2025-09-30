import { useMemo } from 'react'

import { useUser } from '@/context/user-context'
import { useMuscleFrequencyQuery } from '@/generated/graphql-client'

export function useMuscleHeatmap() {
  const { user } = useUser()

  const { data, isLoading, error } = useMuscleFrequencyQuery(
    {
      userId: user?.id || '',
      days: 30,
    },
    { enabled: !!user?.id },
  )

  const muscleData = useMemo(() => {
    if (!data?.muscleFrequency || data.muscleFrequency.length === 0) {
      return {
        muscleFocusData: {},
        muscleIntensity: {},
        totalSets: 0,
        individualMuscleData: {},
      }
    }

    // Convert frequency data to individual muscle structure
    const individualMuscleData: Record<string, number> = {}
    const muscleFocusData: Record<string, number> = {} // Grouped by groupSlug for backward compatibility
    const totalSets = data.muscleFrequency.reduce(
      (sum, muscle) => sum + muscle.totalSets,
      0,
    )

    // Map each individual muscle to its sets count
    data.muscleFrequency.forEach((muscle) => {
      individualMuscleData[muscle.muscleId] = muscle.totalSets

      // Also aggregate by group for backward compatibility
      const existingGroupSets = muscleFocusData[muscle.groupSlug] || 0
      muscleFocusData[muscle.groupSlug] = existingGroupSets + muscle.totalSets
    })

    // Calculate intensity for individual muscles (0-1 scale with full spectrum)
    const muscleIntensity: Record<string, number> = {}

    if (totalSets > 0) {
      const maxSets = Math.max(...Object.values(individualMuscleData))
      const minSets = Math.min(...Object.values(individualMuscleData))

      Object.entries(individualMuscleData).forEach(([muscleId, sets]) => {
        // Normalize to 0-1 scale with better distribution
        let normalizedIntensity = 0

        if (maxSets > minSets) {
          // Use min-max normalization for better distribution across the spectrum
          normalizedIntensity = (sets - minSets) / (maxSets - minSets)
        } else if (maxSets > 0) {
          // If all muscles have the same sets, give them all high intensity
          normalizedIntensity = 0.8
        }

        // Ensure minimum visibility but allow for full spectrum
        muscleIntensity[muscleId] = Math.max(0.05, normalizedIntensity)
      })
    }

    return {
      muscleFocusData, // Grouped data for backward compatibility
      muscleIntensity, // Individual muscle intensity
      totalSets,
      individualMuscleData, // Individual muscle data
      rawMuscleData: data.muscleFrequency, // Raw data for detailed views
    }
  }, [data])

  return {
    ...muscleData,
    isLoading,
    error,
  }
}
