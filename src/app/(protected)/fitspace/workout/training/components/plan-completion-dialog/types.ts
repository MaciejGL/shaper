export interface PlanCompletionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planId: string
  onComplete: () => void
}

export interface PlanCompletionData {
  adherence: number
  workoutsCompleted: number
  totalWorkouts: number
  totalVolumeLifted: number
  totalPRsAchieved: number
  duration: {
    weeks: number
    startDate: string
    endDate?: string | null
  }
}

export interface AchievementBadge {
  id: string
  title: string
  icon: React.ElementType
  gradient: string
}
