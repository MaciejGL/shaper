'use client'

import { formatDate } from 'date-fns'

import { dayNames } from '@/app/(protected)/trainer/trainings/creator/utils'
import { Badge } from '@/components/ui/badge'

import { QuickWorkoutPlan } from '../../../types'

interface PastWorkoutCardProps {
  workout: NonNullable<QuickWorkoutPlan>['weeks'][number]['days'][number] & {
    weekNumber: number
    weekScheduledAt?: string | null
  }
}

export function PastWorkoutCard({ workout }: PastWorkoutCardProps) {
  const completedDate = workout.completedAt
    ? new Date(workout.completedAt)
    : null

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-medium">{dayNames[workout.dayOfWeek]}</h4>
          {completedDate && (
            <p className="text-sm text-muted-foreground">
              {formatDate(completedDate, 'd MMM, yyyy HH:mm')}
            </p>
          )}
        </div>
        {completedDate && <Badge variant="success">Completed</Badge>}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          EXERCISES ({workout.exercises.length})
        </p>
        <div className="space-y-1">
          {workout.exercises.map((exercise) => (
            <div key={exercise.id} className="text-sm">
              {exercise.name} ({exercise.sets.length} sets)
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
