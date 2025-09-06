import { RadioButtons } from '@/components/radio-buttons'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { GQLFitnessLevel, GQLGoal } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import type { OnboardingData } from '../onboarding-modal'

interface FitnessProfileStepProps {
  data: OnboardingData
  onChange: (updates: Partial<OnboardingData>) => void
}

const FITNESS_LEVELS = [
  {
    value: GQLFitnessLevel.Beginner,
    label: 'Beginner',
    description: 'New to fitness',
  },
  {
    value: GQLFitnessLevel.Intermediate,
    label: 'Intermediate',
    description: '6 - 12 months',
  },
  {
    value: GQLFitnessLevel.Advanced,
    label: 'Advanced',
    description: '2 - 5 years',
  },
  {
    value: GQLFitnessLevel.Expert,
    label: 'Expert',
    description: '5+ years',
  },
]

const GOALS = [
  { value: GQLGoal.LoseWeight, label: 'Lose Weight' },
  { value: GQLGoal.GainMuscle, label: 'Gain Muscle' },
  { value: GQLGoal.IncreaseStrength, label: 'Increase Strength' },
  { value: GQLGoal.ImproveHealth, label: 'Improve Health' },
  {
    value: GQLGoal.BodyRecomposition,
    label: 'Body Recomposition',
  },
  {
    value: GQLGoal.IncreaseEndurance,
    label: 'Increase Endurance',
  },
]

export function FitnessProfileStep({
  data,
  onChange,
}: FitnessProfileStepProps) {
  const toggleGoal = (goal: GQLGoal) => {
    const newGoals = data.goals.includes(goal)
      ? data.goals.filter((g) => g !== goal)
      : [...data.goals, goal]
    onChange({ goals: newGoals })
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-10">
        <h2 className="text-2xl font-semibold">Your fitness goals</h2>
        <p className="text-muted-foreground">
          This helps us personalize your experience
        </p>
      </div>

      <div className="space-y-6">
        {/* Fitness Level */}
        <div className="space-y-3">
          <Label>Fitness Level</Label>
          <RadioButtons
            value={data.fitnessLevel || GQLFitnessLevel.Beginner}
            onValueChange={(value: GQLFitnessLevel) =>
              onChange({ fitnessLevel: value })
            }
            options={FITNESS_LEVELS.map((level) => ({
              value: level.value,
              label: level.label,
              description: level.description,
            }))}
          />
        </div>

        {/* Goals */}
        <div className="space-y-3">
          <Label>
            Goals
            <span className="text-xs text-muted-foreground font-normal">
              {' '}
              (select all that apply)
            </span>
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {GOALS.map((goal) => (
              <Button
                key={goal.value}
                variant={
                  data.goals.includes(goal.value) ? 'default' : 'tertiary'
                }
                onClick={() => toggleGoal(goal.value)}
                className={cn('h-auto p-3 justify-start ')}
              >
                {goal.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
