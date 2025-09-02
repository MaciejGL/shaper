import { AnimatePresence, motion } from 'framer-motion'
import { uniq } from 'lodash'
import { Activity, CheckIcon, PenIcon, XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
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
  isSectionEditing: boolean
  onToggleEdit: () => void
  onSave: () => void
  isSaving: boolean
}

export function GoalsAndHealth({
  profile,
  handleChange,
  isSectionEditing,
  onToggleEdit,
  onSave,
  isSaving,
}: GoalsAndHealthProps) {
  return (
    <Card className="mb-6" borderless>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <SectionIcon size="sm" icon={Activity} variant="orange" />
          Fitness Goals & Health
        </CardTitle>
        <AnimatePresence mode="wait">
          {!isSectionEditing ? (
            <motion.div
              key="edit-button"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.13 }}
            >
              <Button
                onClick={onToggleEdit}
                iconOnly={<PenIcon />}
                variant="secondary"
                size="icon-md"
              >
                Edit
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="save-button"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.13 }}
            >
              <div className="flex gap-2">
                <Button
                  onClick={onToggleEdit}
                  variant="secondary"
                  disabled={isSaving}
                  iconOnly={<XIcon />}
                  size="icon-md"
                >
                  Cancel
                </Button>
                <Button
                  onClick={onSave}
                  disabled={isSaving}
                  iconOnly={<CheckIcon />}
                  size="icon-md"
                >
                  Save
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="fitnessGoals">Fitness Goals</Label>
          <div className="flex flex-col gap-2">
            <GoalsField
              profile={profile}
              handleChange={handleChange}
              disabled={!isSectionEditing}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="allergies">Allergies</Label>

          <AllergiesField
            allergies={profile?.allergies ?? ''}
            handleChange={handleChange}
            disabled={!isSectionEditing}
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
  handleChange: (
    field: keyof Profile,
    value: string | string[] | number | null,
  ) => void
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
      className={cn(
        'w-full py-2 opacity-50',
        !disabled && 'cursor-pointer opacity-100',
      )}
      size="lg"
      variant={profile?.goals.includes(goal.value) ? 'primary' : 'outline'}
      onClick={() => !disabled && handleGoalClick(goal.value)}
    >
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
  handleChange: (
    field: keyof Profile,
    value: string | string[] | number | null,
  ) => void
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
