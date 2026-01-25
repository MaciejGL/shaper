export type CompleteYourAccountStepId =
  | 'name'
  | 'sex'
  | 'birthday'
  | 'height'
  | 'weight'
  | 'volumeGoal'

export interface CompleteYourAccountState {
  isLoading: boolean
  isComplete: boolean
  completedCount: number
  totalCount: number
  missingSteps: CompleteYourAccountStepId[]
  nextStep: CompleteYourAccountStepId | null
}

