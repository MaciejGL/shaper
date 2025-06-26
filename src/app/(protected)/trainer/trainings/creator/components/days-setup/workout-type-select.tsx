import React from 'react'

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
import { useTrainingPlan } from '@/context/training-plan-context/training-plan-context'
import type { GQLWorkoutType } from '@/generated/graphql-client'

import { TrainingPlanFormData } from '../types'
import { workoutTypeGroups } from '../utils'

type WorkoutTypeSelectProps = {
  dayIndex: number
  day: TrainingPlanFormData['weeks'][number]['days'][number]
  onUpdate?: (workoutType: GQLWorkoutType | null) => void
}

export function WorkoutTypeSelect({
  dayIndex,
  day,
  onUpdate,
}: WorkoutTypeSelectProps) {
  const { updateDay, activeWeek } = useTrainingPlan()

  const handleValueChange = (value: GQLWorkoutType) => {
    if (onUpdate) {
      // Use the provided callback (for new mutation approach)
      onUpdate(value)
    } else {
      // Fallback to the old context approach
      updateDay(activeWeek, day.dayOfWeek, {
        ...day,
        workoutType: value,
      })
    }
  }

  return (
    <div className="space-y-2">
      <Select value={day.workoutType || ''} onValueChange={handleValueChange}>
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
