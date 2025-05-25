import { uniq } from 'lodash'
import { CheckIcon } from 'lucide-react'

import { ReadOnlyField } from '@/components/read-only-field'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { GQLGoal } from '@/generated/graphql-client'
import { goalOptions, translateGoal } from '@/utils/goals'

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
          <div className="flex flex-wrap gap-2">
            {isEditing ? (
              <GoalsField profile={profile} handleChange={handleChange} />
            ) : (
              <ReadOnlyGoalsField profile={profile} />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="allergies">Allergies</Label>
          {isEditing ? (
            <AllergiesField
              allergies={profile?.allergies ?? ''}
              handleChange={handleChange}
            />
          ) : (
            <ReadOnlyField value={profile?.allergies ?? ''} />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ReadOnlyGoalsField({ profile }: { profile: Profile }) {
  return profile.goals.map((goal) => (
    <GoalBadge key={goal} goal={goal} profile={profile} />
  ))
}

function GoalsField({
  profile,
  handleChange,
}: {
  profile: Profile
  handleChange: (field: keyof Profile, value: string | string[]) => void
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
      className="cursor-pointer"
      size="lg"
      variant={profile?.goals.includes(goal.value) ? 'primary' : 'outline'}
      onClick={() => handleGoalClick(goal.value)}
    >
      {profile?.goals.includes(goal.value) && <CheckIcon />}
      {goal.label}
    </Badge>
  ))
}

function AllergiesField({
  allergies,
  handleChange,
}: {
  allergies: string
  handleChange: (field: keyof Profile, value: string | string[]) => void
}) {
  return (
    <Textarea
      id="allergies"
      value={allergies}
      onChange={(e) => handleChange('allergies', e.target.value)}
    />
  )
}
function GoalBadge({ goal, profile }: { goal: GQLGoal; profile: Profile }) {
  const isSelected = profile?.goals.includes(goal)
  return (
    <Badge key={goal} size="lg" variant="outline">
      {isSelected && <CheckIcon />}
      {translateGoal(goal)}
    </Badge>
  )
}
