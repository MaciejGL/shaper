import { GQLGoal } from '@/generated/graphql-client'

export const goalOptions = [
  { label: 'Lose Weight', value: GQLGoal.LoseWeight },
  { label: 'Gain Muscle', value: GQLGoal.GainMuscle },
  { label: 'Increase Strength', value: GQLGoal.IncreaseStrength },
  { label: 'Body Recomposition', value: GQLGoal.BodyRecomposition },
  { label: 'Improve Health', value: GQLGoal.ImproveHealth },
  { label: 'Increase Endurance', value: GQLGoal.IncreaseEndurance },
]

export const translateGoal = (goal: GQLGoal) => {
  return goalOptions.find((opt) => opt.value === goal)?.label
}
