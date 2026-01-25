import type { CommitmentId } from '@/config/volume-goals'

export type WizardStep = 'focus' | 'commitment' | 'results'

export type FocusAnswer =
  | 'balanced'
  | 'upper-body'
  | 'lower-body'
  | 'push-pull'
  | 'hypertrophy'
  | 'maintenance'

export interface WizardAnswers {
  focus: FocusAnswer | null
  commitment: CommitmentId | null
}

export interface WizardQuestion {
  id: keyof WizardAnswers
  title: string
  subtitle: string
  options: {
    value: string
    label: string
    description?: string
  }[]
}

export interface VolumeGoalWizardDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentGoal: {
    focusPreset: string
    commitment: string
  } | null
  onSelect: (focusPreset: string, commitment: string) => void
}

export interface VolumeGoalSelectorProps {
  currentGoal: {
    focusPreset: string
    commitment: string
    startedAt: string
  } | null
  durationWeeks: number
  onOpenWizard: () => void
}
