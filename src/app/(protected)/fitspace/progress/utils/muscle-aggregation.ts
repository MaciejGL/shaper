import { DISPLAY_GROUPS, getMuscleById } from '@/config/muscles'
import type { GQLMuscleFrequency } from '@/generated/graphql-client'

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

  // Initialize all display groups
  DISPLAY_GROUPS.forEach((groupName) => {
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
    // Find which group this muscle belongs to using static data
    const staticMuscle = getMuscleById(muscle.muscleId)
    const groupName = staticMuscle?.displayGroup

    if (groupName && groupedData[groupName]) {
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

export interface MuscleGroupCategorization {
  overfocused: string[]
  balanced: string[]
  underfocused: string[]
}

/**
 * Categorizes muscle groups based on training volume share and recency
 * Uses IQR-based thresholds for adaptive categorization
 * @param groupedMuscleData - Aggregated muscle group data
 * @param now - Current date for recency calculation
 * @returns Categorized muscle groups
 */
export function categorizeMuscleGroups(
  groupedMuscleData: Record<string, GroupedMuscleData>,
  now: Date = new Date(),
): MuscleGroupCategorization {
  const entries = Object.entries(groupedMuscleData)
  const totalSets = entries.reduce((sum, [, group]) => sum + group.totalSets, 0)

  // If no training data, all groups are underfocused
  if (totalSets === 0) {
    return {
      overfocused: [],
      balanced: [],
      underfocused: entries.map(([groupName]) => groupName),
    }
  }

  // Calculate share of total sets and days since last training for each group
  const groupStats = entries.map(([groupName, group]) => {
    const share = group.totalSets / totalSets
    const daysSinceLast = group.lastTrained
      ? (now.getTime() - new Date(group.lastTrained).getTime()) /
        (1000 * 60 * 60 * 24)
      : Infinity

    return {
      groupName,
      sets: group.totalSets,
      share,
      daysSinceLast,
    }
  })

  // Calculate IQR thresholds on shares
  const shares = groupStats.map((g) => g.share).sort((a, b) => a - b)
  const q1Index = Math.floor(0.25 * (shares.length - 1))
  const q3Index = Math.floor(0.75 * (shares.length - 1))
  const q1 = shares[q1Index] || 0
  const q3 = shares[q3Index] || 0
  const iqr = Math.max(1e-6, q3 - q1)

  const overfocusedThreshold = q3 + 1.5 * iqr
  const underfocusedThreshold = Math.max(0, q1 - 1.5 * iqr)

  const overfocused: string[] = []
  const balanced: string[] = []
  const underfocused: string[] = []

  groupStats.forEach(({ groupName, sets, share, daysSinceLast }) => {
    // Overfocused: High share OR (has sets AND share >= 60%)
    if (share >= overfocusedThreshold || (sets >= 1 && share >= 0.6)) {
      overfocused.push(groupName)
    }
    // Underfocused: Low share OR no sets OR not trained in 14+ days
    else if (
      share <= underfocusedThreshold ||
      sets === 0 ||
      daysSinceLast > 14
    ) {
      underfocused.push(groupName)
    }
    // Balanced: Everything else
    else {
      balanced.push(groupName)
    }
  })

  return {
    overfocused,
    balanced,
    underfocused,
  }
}
