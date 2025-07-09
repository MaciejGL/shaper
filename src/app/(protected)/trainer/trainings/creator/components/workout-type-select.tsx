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
import type { GQLWorkoutType } from '@/generated/graphql-client'

import { workoutTypeGroups } from '../utils'

type WorkoutTypeSelectProps = {
  dayIndex: number
  workoutType?: GQLWorkoutType | null
  onValueChange: (value: GQLWorkoutType) => void
  disabled?: boolean
}

export function WorkoutTypeSelect({
  dayIndex,
  workoutType,
  onValueChange,
  disabled,
}: WorkoutTypeSelectProps) {
  return (
    <div className="space-y-2">
      <Select
        value={workoutType || ''}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          variant="ghost"
          id={`workout-type-${dayIndex}`}
          className="w-full"
        >
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
