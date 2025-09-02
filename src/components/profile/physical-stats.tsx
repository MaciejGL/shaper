import { AnimatePresence, motion } from 'framer-motion'
import { CheckIcon, PenIcon, RulerIcon, XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HeightInput } from '@/components/ui/height-input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { WeightInput } from '@/components/ui/weight-input'
import { GQLActivityLevel, GQLFitnessLevel } from '@/generated/graphql-client'

import { SectionIcon } from '../ui/section-icon'

import { Profile } from './types'

type PhysicalStatsProps = {
  profile: Pick<Profile, 'height' | 'weight' | 'fitnessLevel' | 'activityLevel'>
  handleChange: (field: keyof Profile, value: string | number | null) => void
  isSectionEditing: boolean
  onToggleEdit: () => void
  onSave: () => void
  isSaving: boolean
}
export function PhysicalStats({
  profile,
  handleChange,
  isSectionEditing,
  onToggleEdit,
  onSave,
  isSaving,
}: PhysicalStatsProps) {
  return (
    <Card className="mb-6" borderless>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <SectionIcon size="sm" icon={RulerIcon} variant="blue" />
          Physical Stats
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <HeightInput
              id="height"
              heightInCm={profile?.height ?? null}
              onHeightChange={(heightInCm: number | null) =>
                handleChange('height', heightInCm)
              }
              disabled={!isSectionEditing}
              showLabel={true}
            />
          </div>

          <div className="space-y-2">
            <WeightInput
              id="weight"
              weightInKg={profile?.weight ?? null}
              onWeightChange={(weightInKg: number | null) =>
                handleChange('weight', weightInKg)
              }
              disabled={!isSectionEditing}
              showLabel={true}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fitnessLevel">Fitness Level</Label>

            <Select
              value={profile?.fitnessLevel ?? ''}
              onValueChange={(value) => handleChange('fitnessLevel', value)}
              disabled={!isSectionEditing}
            >
              <SelectTrigger
                id="fitnessLevel"
                variant="ghost"
                className="w-full"
              >
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={GQLFitnessLevel.Beginner}>
                  Beginner
                </SelectItem>
                <SelectItem value={GQLFitnessLevel.Intermediate}>
                  Intermediate
                </SelectItem>
                <SelectItem value={GQLFitnessLevel.Advanced}>
                  Advanced
                </SelectItem>
                <SelectItem value={GQLFitnessLevel.Expert}>Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="activityLevel">Activity Level</Label>

            <Select
              value={profile?.activityLevel ?? ''}
              onValueChange={(value) => handleChange('activityLevel', value)}
              disabled={!isSectionEditing}
            >
              <SelectTrigger
                id="activityLevel"
                variant="ghost"
                className="w-full"
              >
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={GQLActivityLevel.Sedentary}>
                  Sedentary (little or no exercise, office job)
                </SelectItem>
                <SelectItem value={GQLActivityLevel.Light}>
                  Light (light exercise 1-3 days/week)
                </SelectItem>
                <SelectItem value={GQLActivityLevel.Moderate}>
                  Moderate (moderate exercise 3-5 days/week)
                </SelectItem>
                <SelectItem value={GQLActivityLevel.Active}>
                  Active (active exercise 6-7 days/week)
                </SelectItem>
                <SelectItem value={GQLActivityLevel.Athlete}>
                  Athlete (very active exercise 6-7 days/week)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
