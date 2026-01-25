import type { CompleteYourAccountStepId } from '../types'

export type SexOption = 'Male' | 'Female' | 'Other' | 'Prefer not to say' | ''

export interface CompleteProfileFormState {
  firstName: string
  lastName: string
  sex: SexOption
  birthday: Date | undefined
  heightCm: number | null
  weightKg: number | null
}

export interface CompleteProfileDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  missingSteps: CompleteYourAccountStepId[]
}

