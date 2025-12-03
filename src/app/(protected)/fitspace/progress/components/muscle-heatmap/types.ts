export interface SubMuscleData {
  name: string
  alias: string
  completedSets: number
}

export interface MuscleProgressData {
  completedSets: number
  targetSets: number
  percentage: number
  lastTrained: string | null
  subMuscles: SubMuscleData[]
}

export interface SelectedMuscleDetailsProps {
  selectedMuscle: string
  muscleProgress: Record<string, MuscleProgressData>
}
