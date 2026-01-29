import type { GQLMuscleContributionType } from '@/generated/graphql-client'

export interface SubMuscleData {
  name: string
  alias: string
  completedSets: number
}

export type MuscleContributionType = GQLMuscleContributionType

export interface ExerciseContributionData {
  exerciseId: string
  exerciseName: string
  contributionType: MuscleContributionType
  rawSets: number
  weightedSets: number
}

export interface MuscleProgressData {
  completedSets: number
  targetSets: number
  percentage: number
  lastTrained: string | null
  subMuscles: SubMuscleData[]
  exerciseContributions: ExerciseContributionData[]
}

export interface SelectedMuscleDetailsProps {
  selectedMuscle: string
  muscleProgress: Record<string, MuscleProgressData>
}
