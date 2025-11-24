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
}
