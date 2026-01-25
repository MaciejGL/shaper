import { uniq } from 'lodash'
import { Activity, CheckSquareIcon, SquareIcon } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { GQLGoal } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'
import { goalOptions } from '@/utils/goals'

import { Badge } from '../ui/badge'
import { SectionIcon } from '../ui/section-icon'

import { Profile } from './types'

type GoalsAndHealthProps = {
  profile: Pick<Profile, 'goals' | 'allergies'>
  handleChange: (
    field: keyof Profile,
    value: string | string[] | number | null,
  ) => void
}

export function GoalsAndHealth({ profile, handleChange }: GoalsAndHealthProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SectionIcon size="sm" icon={Activity} variant="orange" />
          Fitness Goals & Health
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="fitnessGoals">Fitness Goals</Label>
          <div className="flex flex-col gap-2">
            <GoalsField profile={profile} handleChange={handleChange} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="allergies">Allergies</Label>

          <AllergiesField
            allergies={profile?.allergies ?? ''}
            handleChange={handleChange}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function GoalsField({
  profile,
  handleChange,
}: {
  profile: Profile
  handleChange: (
    field: keyof Profile,
    value: string | string[] | number | null,
  ) => void
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
      className={cn(
        'w-full rounded-2xl py-4 cursor-pointer justify-start gap-2',
      )}
      size="lg"
      variant={profile?.goals.includes(goal.value) ? 'secondary' : 'outline'}
      onClick={() => handleGoalClick(goal.value)}
    >
      {profile?.goals.includes(goal.value) ? (
        <CheckSquareIcon />
      ) : (
        <SquareIcon />
      )}{' '}
      {goal.label}
    </Badge>
  ))
}

function AllergiesField({
  allergies,
  handleChange,
}: {
  allergies: string
  handleChange: (
    field: keyof Profile,
    value: string | string[] | number | null,
  ) => void
}) {
  return (
    <Textarea
      id="allergies"
      variant="ghost"
      value={allergies}
      onChange={(e) => handleChange('allergies', e.target.value)}
      placeholder="Enter any allergies or dietary restrictions..."
    />
  )
}
