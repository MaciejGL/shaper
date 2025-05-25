import React from 'react'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { GQLWorkoutType } from '@/generated/graphql-client'

import { TrainingPlanFormData } from '../types'
import { workoutTypeGroups } from '../utils'

type WorkoutTypeSelectProps = {
  dayIndex: number
  day: TrainingPlanFormData['weeks'][number]['days'][number]
  updateWorkoutType: (dayIndex: number, value: GQLWorkoutType) => void
}

export function WorkoutTypeSelect({
  dayIndex,
  day,
  updateWorkoutType,
}: WorkoutTypeSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={`workout-type-${dayIndex}`}>Workout Type</Label>
      <Select
        value={day.workoutType || ''}
        onValueChange={(value: GQLWorkoutType) =>
          updateWorkoutType(dayIndex, value)
        }
      >
        <SelectTrigger id={`workout-type-${dayIndex}`} className="w-full">
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          {workoutTypeGroups.map((group, index) => (
            <React.Fragment key={group.label}>
              <SelectGroup key={group.label}>
                <SelectLabel>{group.label}</SelectLabel>
                {group.types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectGroup>
              {index < workoutTypeGroups.length - 1 && <SelectSeparator />}
            </React.Fragment>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
