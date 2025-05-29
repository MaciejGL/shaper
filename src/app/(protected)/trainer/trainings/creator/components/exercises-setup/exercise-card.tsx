import { Edit, GaugeIcon, TimerIcon, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { TrainingExercise } from '../types'

type ExerciseCardProps = {
  exercise: TrainingExercise
  index: number
  onEdit: (index: number) => void
  onRemove: (index: number) => void
}

export function ExerciseCard({
  exercise,
  index,
  onEdit,
  onRemove,
}: ExerciseCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">{exercise.name}</CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon-md"
              onClick={() => onEdit(index)}
              iconOnly={<Edit />}
            />
            <Button
              variant="ghost"
              size="icon-md"
              onClick={() => onRemove(index)}
              iconOnly={<Trash2 />}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2 text-sm">
            {exercise.sets.map((set) => (
              <div key={set.order} className="border rounded p-1.5">
                <div className="font-medium">Set {set.order}</div>
                <div className="text-xs text-muted-foreground">
                  {set.reps} reps {set.weight ? `@ ${set.weight}kg` : ''}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {exercise.restSeconds && (
              <Badge>
                <TimerIcon /> {exercise.restSeconds}s rest
              </Badge>
            )}
            {exercise.tempo && (
              <Badge>
                <GaugeIcon /> Tempo: {exercise.tempo}
              </Badge>
            )}
          </div>
        </div>
        {exercise.instructions && (
          <div className="mt-2 text-sm text-foreground bg-muted p-2 rounded-md">
            {exercise.instructions}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
