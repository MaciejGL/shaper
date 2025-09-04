import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  GQLFitnessLevel,
  GQLGoal,
  GQLHeightUnit,
} from '@/generated/graphql-client'
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
    description: '6+ months experience',
  },
  {
    value: GQLFitnessLevel.Advanced,
    label: 'Advanced',
    description: '2+ years experience',
  },
  {
    value: GQLFitnessLevel.Expert,
    label: 'Expert',
    description: 'Professional level',
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
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">
          Tell us about your fitness goals
        </h2>
        <p className="text-muted-foreground">
          This helps us personalize your experience
        </p>
      </div>

      <div className="space-y-6">
        {/* Fitness Level */}
        <div className="space-y-3">
          <Label>
            Fitness Level <span className="text-destructive">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {FITNESS_LEVELS.map((level) => (
              <Button
                key={level.value}
                variant={
                  data.fitnessLevel === level.value ? 'default' : 'outline'
                }
                onClick={() => onChange({ fitnessLevel: level.value })}
                className="h-auto p-3 flex-col items-start"
              >
                <div className="font-medium">{level.label}</div>
                <div className="text-xs opacity-70">{level.description}</div>
              </Button>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div className="space-y-3">
          <Label>
            Goals <span className="text-destructive">*</span>
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
                  data.goals.includes(goal.value) ? 'default' : 'outline'
                }
                onClick={() => toggleGoal(goal.value)}
                className={cn(
                  'h-auto p-3 justify-start',
                  data.goals.includes(goal.value) && 'ring-2 ring-primary',
                )}
              >
                <span className="text-sm">{goal.label}</span>
              </Button>
            ))}
          </div>
          {data.goals.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {data.goals.map((goal) => {
                const goalInfo = GOALS.find((g) => g.value === goal)
                return (
                  <Badge key={goal} variant="secondary" className="text-xs">
                    {goalInfo?.label}
                  </Badge>
                )
              })}
            </div>
          )}
        </div>

        {/* Optional measurements */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="height">Height (optional)</Label>
            <Input
              id="height"
              type="number"
              value={data.height || ''}
              onChange={(e) =>
                onChange({
                  height: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              placeholder={data.heightUnit === GQLHeightUnit.Cm ? 'cm' : 'ft'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Weight (optional)</Label>
            <Input
              id="weight"
              type="number"
              value={data.weight || ''}
              onChange={(e) =>
                onChange({
                  weight: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              placeholder={data.weightUnit}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
