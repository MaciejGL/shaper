'use client'

import { GQLFocusTag } from '@/generated/graphql-client'

import { MultiSelectToggle } from './multi-select-toggle'

const FOCUS_TAG_OPTIONS = [
  { value: GQLFocusTag.Strength, label: 'Strength' },
  { value: GQLFocusTag.Cardio, label: 'Cardio' },
  { value: GQLFocusTag.BeginnerFriendly, label: 'Beginner Friendly' },
  { value: GQLFocusTag.BodyRecomposition, label: 'Body Recomposition' },
  { value: GQLFocusTag.Powerlifting, label: 'Powerlifting' },
  { value: GQLFocusTag.WeightLoss, label: 'Weight Loss' },
  { value: GQLFocusTag.Endurance, label: 'Endurance' },
  { value: GQLFocusTag.FunctionalFitness, label: 'Functional Fitness' },
  { value: GQLFocusTag.Bodyweight, label: 'Bodyweight' },
  { value: GQLFocusTag.MuscleBuilding, label: 'Muscle Building' },
]

interface FocusTagsSelectorProps {
  selected: GQLFocusTag[]
  onChange: (selected: GQLFocusTag[]) => void
  disabled?: boolean
  className?: string
}

export function FocusTagsSelector({
  selected,
  onChange,
  disabled = false,
  className,
}: FocusTagsSelectorProps) {
  return (
    <MultiSelectToggle
      label="Focus Areas"
      description="Select the main training focuses this plan targets"
      options={FOCUS_TAG_OPTIONS}
      selected={selected}
      onChange={onChange}
      disabled={disabled}
      className={className}
    />
  )
}
