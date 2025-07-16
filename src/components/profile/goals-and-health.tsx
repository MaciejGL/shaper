import { uniq } from 'lodash'
import { CheckIcon } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { GQLGoal } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'
import { goalOptions } from '@/utils/goals'

import { Badge } from '../ui/badge'

import { Profile } from './types'

type GoalsAndHealthProps = {
  isEditing: boolean
  profile: Pick<Profile, 'goals' | 'allergies'>

  handleChange: (field: keyof Profile, value: string | string[]) => void
}

export function GoalsAndHealth({
  isEditing,
  profile,
  handleChange,
}: GoalsAndHealthProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Fitness Goals & Health Information</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="fitnessGoals">Fitness Goals</Label>
          <div className="flex flex-col gap-2">
            <GoalsField
              profile={profile}
              handleChange={handleChange}
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="allergies">Allergies</Label>

          <AllergiesField
            allergies={profile?.allergies ?? ''}
            handleChange={handleChange}
            disabled={!isEditing}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function GoalsField({
  profile,
  handleChange,
  disabled,
}: {
  profile: Profile
  handleChange: (field: keyof Profile, value: string | string[]) => void
  disabled: boolean
}) {
  const handleGoalClick = (goal: GQLGoal) => {
    if (profile?.goals.includes(goal)) {
      const newGoals = profile?.goals.filter((g) => g !== goal)
      handleChange('goals', newGoals)
    } else {
      const newGoals = uniq([...(profile?.goals ?? []), goal])
      handleChange('goals', newGoals)
    }
  }
  return goalOptions.map((goal) => (
    <Badge
      key={goal.value}
      className={cn(!disabled && 'cursor-pointer')}
      size="lg"
      variant={profile?.goals.includes(goal.value) ? 'primary' : 'outline'}
      onClick={() => !disabled && handleGoalClick(goal.value)}
    >
      {profile?.goals.includes(goal.value) && <CheckIcon />}
      {goal.label}
    </Badge>
  ))
}

function AllergiesField({
  allergies,
  handleChange,
  disabled,
}: {
  allergies: string
  handleChange: (field: keyof Profile, value: string | string[]) => void
  disabled: boolean
}) {
  return (
    <Textarea
      id="allergies"
      variant="ghost"
      value={allergies}
      onChange={(e) => handleChange('allergies', e.target.value)}
      disabled={disabled}
    />
  )
}
