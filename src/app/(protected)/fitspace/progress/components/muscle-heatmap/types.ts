export interface MuscleProgressData {
  completedSets: number
  targetSets: number
  percentage: number
  lastTrained: string | null
}

export interface SelectedMuscleDetailsProps {
  selectedMuscle: string
  muscleProgress: Record<string, MuscleProgressData>
}
