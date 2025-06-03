import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useTrainingPlan } from '@/context/training-plan-context/training-plan-context'
import { cn } from '@/lib/utils'

import { TrainingPlanFormData } from '../types'
import { dayNames } from '../utils'

import { WorkoutTypeSelect } from './workout-type-select'

type DayCardProps = {
  day: TrainingPlanFormData['weeks'][number]['days'][number]
  dayIndex: number
}

export function DayCard({ day, dayIndex }: DayCardProps) {
  const { updateDay, activeWeek } = useTrainingPlan()

  const handleRestDayChange = (bool: boolean) => {
    updateDay(activeWeek, dayIndex, {
      ...day,
      isRestDay: bool,
    })
  }

  return (
    <Card className="h-full bg-card-on-card">
      <CardHeader className="flex items-baseline justify-between">
        <CardTitle
          className={cn('text-lg', day.isRestDay && 'text-muted-foreground')}
        >
          {dayNames[day.dayOfWeek]}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Label htmlFor={`rest-day-${dayIndex}`}>Active Day</Label>
          <Switch
            id={`rest-day-${dayIndex}`}
            checked={!day.isRestDay}
            onCheckedChange={(value) => handleRestDayChange(!value)}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!day.isRestDay && <WorkoutTypeSelect dayIndex={dayIndex} day={day} />}
        {day.isRestDay && (
          <p className="text-sm text-muted-foreground">Rest Day</p>
        )}
      </CardContent>
    </Card>
  )
}
