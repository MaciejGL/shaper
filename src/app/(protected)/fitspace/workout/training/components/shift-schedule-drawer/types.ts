import type { NavigationPlan } from '../workout-day'

export interface ShiftScheduleDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: NavigationPlan
}
