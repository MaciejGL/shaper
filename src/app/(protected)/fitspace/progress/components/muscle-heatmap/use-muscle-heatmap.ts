import { useMemo } from 'react'

import { useUser } from '@/context/user-context'
import { useMuscleFrequencyQuery } from '@/generated/graphql-client'

import {
  aggregateMuscleDataToGroups,
  calculateMuscleGroupIntensity,
  categorizeMuscleGroups,
} from '../../utils/muscle-aggregation'

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
        groupedMuscleData: {},
      }
    }

    // Aggregate raw muscle data into muscle groups
    const groupedMuscleData = aggregateMuscleDataToGroups(data.muscleFrequency)

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

    // Calculate intensity for muscle groups using utility function
    const muscleIntensity = calculateMuscleGroupIntensity(groupedMuscleData)

    // Categorize muscle groups based on training volume share and recency
    const muscleCategorization = categorizeMuscleGroups(groupedMuscleData)

    return {
      muscleFocusData, // Grouped data for backward compatibility
      muscleIntensity, // Muscle group intensity
      muscleCategorization, // Categorized muscle groups
      totalSets,
      individualMuscleData, // Individual muscle data
      groupedMuscleData, // Grouped muscle data
      rawMuscleData: data.muscleFrequency, // Raw data for detailed views
    }
  }, [data])

  return {
    ...muscleData,
    isLoading,
    error,
  }
}
