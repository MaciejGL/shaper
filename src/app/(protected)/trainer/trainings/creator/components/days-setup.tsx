'use client'

import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'
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
import { cn } from '@/lib/utils'

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
    <div className="@container/section space-y-6">
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
      <AnimatedPageTransition
        id={`days-${activeWeek}`}
        variant="fade"
        className={cn(
          'grid grid-cols-1 gap-4 auto-rows-fr',
          '@2xl/section:grid-cols-2 @2xl/section:gap-6 @5xl/section:grid-cols-3',
        )}
      >
        {weeks[activeWeek].days.map((day, dayIndex) => (
          <DayCard
            key={day.id}
            day={day}
            dayIndex={dayIndex}
            toggleRestDay={toggleRestDay}
            updateWorkoutType={updateWorkoutType}
          />
        ))}
      </AnimatedPageTransition>
    </div>
  )
}

function DayCard({
  day,
  dayIndex,
  toggleRestDay,
  updateWorkoutType,
}: {
  day: TrainingPlanFormData['weeks'][number]['days'][number]
  dayIndex: number
  toggleRestDay: (dayIndex: number) => void
  updateWorkoutType: (dayIndex: number, type: WorkoutType) => void
}) {
  return (
    <Card key={day.id} className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{dayNames[day.dayOfWeek]}</CardTitle>
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
          <WorkoutTypeSelect
            dayIndex={dayIndex}
            day={day}
            updateWorkoutType={updateWorkoutType}
          />
        )}
      </CardContent>
    </Card>
  )
}

function WorkoutTypeSelect({
  dayIndex,
  day,
  updateWorkoutType,
}: {
  dayIndex: number
  day: TrainingPlanFormData['weeks'][number]['days'][number]
  updateWorkoutType: (dayIndex: number, value: WorkoutType) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={`workout-type-${dayIndex}`}>Workout Type</Label>
      <Select
        value={day.workoutType || ''}
        onValueChange={(value: WorkoutType) =>
          updateWorkoutType(dayIndex, value)
        }
      >
        <SelectTrigger id={`workout-type-${dayIndex}`} className="w-full">
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
  )
}
