'use client'

import { GQLTargetGoal } from '@/generated/graphql-client'

import { MultiSelectToggle } from './multi-select-toggle'

const TARGET_GOAL_OPTIONS = [
  { value: GQLTargetGoal.LoseWeight, label: 'Lose Weight' },
  { value: GQLTargetGoal.GainMuscle, label: 'Gain Muscle' },
  { value: GQLTargetGoal.ImproveStrength, label: 'Improve Strength' },
  { value: GQLTargetGoal.IncreaseEndurance, label: 'Increase Endurance' },
  { value: GQLTargetGoal.ImproveFlexibility, label: 'Improve Flexibility' },
  { value: GQLTargetGoal.BodyRecomposition, label: 'Body Recomposition' },
  { value: GQLTargetGoal.AthleticPerformance, label: 'Athletic Performance' },
  { value: GQLTargetGoal.GeneralFitness, label: 'General Fitness' },
  {
    value: GQLTargetGoal.PowerliftingCompetition,
    label: 'Powerlifting Competition',
  },
  { value: GQLTargetGoal.MarathonTraining, label: 'Marathon Training' },
  { value: GQLTargetGoal.FunctionalMovement, label: 'Functional Movement' },
  { value: GQLTargetGoal.InjuryRecovery, label: 'Injury Recovery' },
  { value: GQLTargetGoal.ImprovePosture, label: 'Improve Posture' },
  { value: GQLTargetGoal.StressRelief, label: 'Stress Relief' },
  { value: GQLTargetGoal.ImproveSleep, label: 'Improve Sleep' },
]

interface TargetGoalsSelectorProps {
  selected: GQLTargetGoal[]
  onChange: (selected: GQLTargetGoal[]) => void
  disabled?: boolean
  className?: string
}

export function TargetGoalsSelector({
  selected,
  onChange,
  disabled = false,
  className,
}: TargetGoalsSelectorProps) {
  return (
    <MultiSelectToggle
      label="Target Goals"
      description="Select the primary goals this training plan helps achieve"
      options={TARGET_GOAL_OPTIONS}
      selected={selected}
      onChange={onChange}
      disabled={disabled}
      className={className}
    />
  )
}
