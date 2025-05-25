import { Edit, GaugeIcon, GripVertical, TimerIcon, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { TrainingExercise } from '../types'

type ExerciseCardProps = {
  exercise: TrainingExercise
  index: number
  onEdit: (index: number) => void
  onRemove: (index: number) => void
  onMove: (index: number, direction: 'up' | 'down') => void
}

export function ExerciseCard({
  exercise,
  index,
  onEdit,
  onRemove,
  onMove,
}: ExerciseCardProps) {
  return (
    <Card className="relative">
      <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col space-y-1">
        <Button
          variant="ghost"
          size="icon-md"
          className="h-6 w-6"
          onClick={() => onMove(index, 'up')}
          disabled={index === 0}
        >
          <GripVertical className="h-4 w-4" />
        </Button>
      </div>
      <CardHeader className="pb-2 pl-10">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">{exercise.name}</CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon-md"
              onClick={() => onEdit(index)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-md"
              onClick={() => onRemove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pl-10">
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
