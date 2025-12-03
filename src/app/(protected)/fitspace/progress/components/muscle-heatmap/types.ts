export interface MuscleProgressData {
  completedSets: number
  targetSets: number
  percentage: number
  lastTrained: string | null
}

export interface WeeklyHeatmapData {
  overallPercentage: number
  streakWeeks: number
  weekStartDate: string | null
  weekEndDate: string | null
  muscleProgress: Record<string, MuscleProgressData>
  muscleIntensity: Record<string, number>
  totalSets: number
  weekOffset: number
  isCurrentWeek: boolean
  goToPreviousWeek: () => void
  goToNextWeek: () => void
  goToCurrentWeek: () => void
  isLoading: boolean
  error: unknown
}

export interface SelectedMuscleDetailsProps {
  selectedMuscle: string
  muscleProgress: Record<string, MuscleProgressData>
}

export interface MuscleProgressListProps {
  muscleProgress: Record<string, MuscleProgressData>
  onMuscleClick: (muscle: string) => void
  selectedMuscle: string | null
}
