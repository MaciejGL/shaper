import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GQLActivityLevel, GQLFitnessLevel } from '@/generated/graphql-client'

import { Profile } from './types'

type PhysicalStatsProps = {
  isEditing: boolean
  profile: Pick<Profile, 'height' | 'weight' | 'fitnessLevel' | 'activityLevel'>
  handleChange: (field: keyof Profile, value: string) => void
}
export function PhysicalStats({
  isEditing,
  profile,
  handleChange,
}: PhysicalStatsProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Physical Stats</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>

            <Input
              id="height"
              type="number"
              variant="ghost"
              value={profile?.height ?? ''}
              onChange={(e) => handleChange('height', e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>

            <Input
              id="weight"
              type="number"
              variant="ghost"
              value={profile?.weight ?? ''}
              onChange={(e) => handleChange('weight', e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fitnessLevel">Fitness Level</Label>

            <Select
              value={profile?.fitnessLevel ?? ''}
              onValueChange={(value) => handleChange('fitnessLevel', value)}
              disabled={!isEditing}
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
              disabled={!isEditing}
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
                  Sedentary
                </SelectItem>
                <SelectItem value={GQLActivityLevel.Light}>Light</SelectItem>
                <SelectItem value={GQLActivityLevel.Moderate}>
                  Moderate
                </SelectItem>
                <SelectItem value={GQLActivityLevel.Active}>Active</SelectItem>
                <SelectItem value={GQLActivityLevel.Athlete}>
                  Athlete
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
