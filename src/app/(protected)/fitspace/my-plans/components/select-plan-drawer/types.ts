import type { AvailablePlan } from '../../types'

export interface SelectPlanDrawerProps {
  open: boolean
  onClose: () => void
  plans: AvailablePlan[]
  onSelectPlan: (plan: AvailablePlan) => void
}

