import type { GQLMuscleFrequency } from '@/generated/graphql-client'

export interface MuscleHeatmapData {
  muscleIntensity: Record<string, number>
  totalSets: number
  individualMuscleData: Record<string, number>
  rawMuscleData: GQLMuscleFrequency[]
  isLoading: boolean
  error: boolean
}

export interface SelectedMuscleDetailsProps {
  selectedMuscle: string
  muscleIntensity: Record<string, number>
  individualMuscleData: Record<string, number>
  rawMuscleData: GQLMuscleFrequency[] | undefined
}

export interface QuickStatsProps {
  muscleIntensity: Record<string, number>
  rawMuscleData: GQLMuscleFrequency[] | undefined
}
