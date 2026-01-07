import { NavigationWeek } from '../workout-day'

export interface OverduePlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planId: string
  weeks: NavigationWeek[]
  onDismiss: () => void
}
