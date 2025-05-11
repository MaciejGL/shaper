'use client'

import { RadioGroupTabs } from '@/components/radio-group'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Switch } from '@/components/ui/switch'

import type { TrainingPlanFormData, WorkoutType } from './types'
import {
  absWorkoutTypes,
  cardioWorkoutTypes,
  dayNames,
  mobilityWorkoutTypes,
  splitWorkoutTypes,
  workoutTypes,
} from './utils'

type DaysSetupProps = {
  weeks: TrainingPlanFormData['weeks']
  activeWeek: number
  setActiveWeek: (week: number) => void
  updateWeeks: (weeks: TrainingPlanFormData['weeks']) => void
}

export function DaysSetup({
  weeks,
  activeWeek,
  setActiveWeek,
  updateWeeks,
}: DaysSetupProps) {
  const handleWeekChange = (value: string) => {
    setActiveWeek(Number.parseInt(value))
  }

  const toggleRestDay = (dayIndex: number) => {
    const newWeeks = [...weeks]
    const day = newWeeks[activeWeek].days[dayIndex]
    day.isRestDay = !day.isRestDay

    // Clear workout type if it's a rest day
    if (day.isRestDay) {
      day.workoutType = undefined
    }

    updateWeeks(newWeeks)
  }

  const updateWorkoutType = (dayIndex: number, type: WorkoutType) => {
    const newWeeks = [...weeks]
    newWeeks[activeWeek].days[dayIndex].workoutType = type
    updateWeeks(newWeeks)
  }

  return (
    <div className="space-y-6">
      <RadioGroupTabs
        title="Select Week"
        items={weeks.map((week, index) => ({
          id: `week-${index}`,
          value: index.toString(),
          label: `Week ${week.weekNumber}`,
        }))}
        onValueChange={handleWeekChange}
        value={activeWeek.toString()}
      />

      <div className="grid gap-4  lg:grid-cols-2 xl:grid-cols-3">
        {weeks[activeWeek].days.map((day, dayIndex) => (
          <Card key={day.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {dayNames[day.dayOfWeek]}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor={`rest-day-${dayIndex}`}>Rest Day</Label>
                <Switch
                  id={`rest-day-${dayIndex}`}
                  checked={day.isRestDay}
                  onCheckedChange={() => toggleRestDay(dayIndex)}
                />
              </div>

              {!day.isRestDay && (
                <div className="space-y-2">
                  <Label htmlFor={`workout-type-${dayIndex}`}>
                    Workout Type
                  </Label>
                  <Select
                    value={day.workoutType || ''}
                    onValueChange={(value: WorkoutType) =>
                      updateWorkoutType(dayIndex, value)
                    }
                  >
                    <SelectTrigger
                      id={`workout-type-${dayIndex}`}
                      className="w-full"
                    >
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Classic</SelectLabel>
                        {workoutTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectGroup>

                      <SelectSeparator />
                      <SelectGroup>
                        <SelectLabel>Split</SelectLabel>
                        {splitWorkoutTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectSeparator />

                      <SelectGroup>
                        <SelectLabel>Cardio</SelectLabel>
                        {cardioWorkoutTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectSeparator />

                      <SelectGroup>
                        <SelectLabel>Mobility</SelectLabel>
                        {mobilityWorkoutTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectSeparator />

                      <SelectGroup>
                        <SelectLabel>Core</SelectLabel>
                        {absWorkoutTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectSeparator />

                      <SelectGroup>
                        <SelectLabel>Other</SelectLabel>
                        <SelectItem value="Custom">Custom</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
