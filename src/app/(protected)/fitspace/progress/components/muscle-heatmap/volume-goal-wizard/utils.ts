import {
  COMMITMENT_OPTIONS,
  getVolumeGoalPresetsList,
} from '@/config/volume-goals'

import type { WizardQuestion } from './types'

// Build focus options from presets config
const focusOptions = getVolumeGoalPresetsList().map((preset) => ({
  value: preset.id,
  label: preset.name,
  description: preset.description,
}))

// Build commitment options from config
const commitmentOptions = COMMITMENT_OPTIONS.map((opt) => ({
  value: opt.id,
  label: opt.name,
  description: opt.description,
}))

export const WIZARD_QUESTIONS: WizardQuestion[] = [
  {
    id: 'focus',
    title: 'What do you want to focus on?',
    subtitle: 'Pick the area you want to prioritize',
    options: focusOptions,
  },
  {
    id: 'commitment',
    title: 'How committed are you?',
    subtitle: 'This affects how many sets per muscle we recommend',
    options: commitmentOptions,
  },
]

export function getStepIndex(step: string): number {
  const steps = ['focus', 'commitment', 'results']
  return steps.indexOf(step)
}

export function getTotalSteps(): number {
  return 2 // Excluding results
}
