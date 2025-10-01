import type { GQLMuscleFrequency } from '@/generated/graphql-client'

import { MUSCLE_GROUP_MAPPING_BY_MUSCLE_ID } from '../constants/muscle-groups'

export interface GroupedMuscleData {
  groupName: string
  totalSets: number
  sessionsCount: number
  lastTrained: string
  muscles: GQLMuscleFrequency[]
}

/**
 * Aggregates raw muscle data into muscle groups for heatmap visualization
 * @param rawMuscleData - Array of individual muscle training data
 * @returns Record of muscle group names to aggregated data
 */
export function aggregateMuscleDataToGroups(
  rawMuscleData: GQLMuscleFrequency[],
): Record<string, GroupedMuscleData> {
  const groupedData: Record<string, GroupedMuscleData> = {}

  // Initialize all muscle groups from the mapping
  Object.keys(MUSCLE_GROUP_MAPPING_BY_MUSCLE_ID).forEach((groupName) => {
    groupedData[groupName] = {
      groupName,
      totalSets: 0,
      sessionsCount: 0,
      lastTrained: new Date(0).toISOString(),
      muscles: [],
    }
  })

  // Aggregate muscle data into groups
  rawMuscleData.forEach((muscle) => {
    // Find which group this muscle belongs to
    const groupEntry = Object.entries(MUSCLE_GROUP_MAPPING_BY_MUSCLE_ID).find(
      ([, muscleIds]) => muscleIds.some((m) => m.id === muscle.muscleId),
    )

    // Debug: console.log(`Muscle ${muscle.muscleName} (${muscle.muscleId}):`, groupEntry ? `mapped to ${groupEntry[0]}` : 'NOT MAPPED')

    if (groupEntry) {
      const [groupName] = groupEntry
      const group = groupedData[groupName]

      group.totalSets += muscle.totalSets
      group.sessionsCount = Math.max(group.sessionsCount, muscle.sessionsCount)

      // Keep the most recent lastTrained date
      if (
        muscle.lastTrained &&
        new Date(muscle.lastTrained) > new Date(group.lastTrained)
      ) {
        group.lastTrained = muscle.lastTrained
      }

      group.muscles.push(muscle)
    }
  })

  return groupedData
}

/**
 * Calculates intensity values for muscle groups based on their training volume
 * @param groupedMuscleData - Aggregated muscle group data
 * @returns Record of muscle group names to intensity values (0-1)
 */
export function calculateMuscleGroupIntensity(
  groupedMuscleData: Record<string, GroupedMuscleData>,
): Record<string, number> {
  const muscleIntensity: Record<string, number> = {}

  // Get all group total sets for normalization
  const groupTotalSets = Object.values(groupedMuscleData)
    .map((group) => group.totalSets)
    .filter((sets) => sets > 0)

  if (groupTotalSets.length > 0) {
    const maxSets = Math.max(...groupTotalSets)
    const minSets = Math.min(...groupTotalSets)

    Object.entries(groupedMuscleData).forEach(([groupName, group]) => {
      if (group.totalSets > 0) {
        // Normalize to 0-1 scale with better distribution
        let normalizedIntensity = 0

        if (maxSets > minSets) {
          // Use min-max normalization for better distribution across the spectrum
          normalizedIntensity =
            (group.totalSets - minSets) / (maxSets - minSets)
        } else if (maxSets > 0) {
          // If all muscle groups have the same sets, give them all high intensity
          normalizedIntensity = 0.8
        }

        // Ensure minimum visibility but allow for full spectrum
        muscleIntensity[groupName] = Math.max(0.05, normalizedIntensity)
      }
    })
  }

  return muscleIntensity
}
