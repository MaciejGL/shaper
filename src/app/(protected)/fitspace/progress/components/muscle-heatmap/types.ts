import type { GQLMuscleFrequency } from '@/generated/graphql-client'

import type {
  GroupedMuscleData,
  MuscleGroupCategorization,
} from '../../utils/muscle-aggregation'

export interface MuscleHeatmapData {
  muscleIntensity: Record<string, number>
  totalSets: number
  individualMuscleData: Record<string, number>
  rawMuscleData: GQLMuscleFrequency[]
  isLoading: boolean
  error: boolean
}

export interface SelectedMuscleDetailsProps {
  selectedMuscle: string // Now contains muscle group name (e.g., "Shoulders")
  muscleIntensity: Record<string, number> // Now contains muscle group names as keys
  groupedMuscleData?: Record<string, GroupedMuscleData>
}

export interface QuickStatsProps {
  muscleIntensity: Record<string, number> // Now contains muscle group names as keys
  muscleCategorization: MuscleGroupCategorization // Categorized muscle groups
}
