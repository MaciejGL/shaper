import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { GQLWorkoutType } from '@/generated/graphql-client'

import { TrainingPlanFormData } from '../types'
import { dayNames } from '../utils'

import { WorkoutTypeSelect } from './workout-type-select'

type DayCardProps = {
  day: TrainingPlanFormData['weeks'][number]['days'][number]
  dayIndex: number
  toggleRestDay: (dayIndex: number) => void
  updateWorkoutType: (dayIndex: number, type: GQLWorkoutType) => void
}

export function DayCard({
  day,
  dayIndex,
  toggleRestDay,
  updateWorkoutType,
}: DayCardProps) {
  return (
    <Card className="h-full">
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
