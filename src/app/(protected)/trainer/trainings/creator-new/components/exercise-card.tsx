import { useDraggable } from '@dnd-kit/core'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { GQLTrainerExercisesQuery } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

interface ExerciseCardProps {
  exercise: GQLTrainerExercisesQuery['userExercises'][number]
}

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: exercise.id,
      data: {
        type: 'exercise',
        exercise,
      },
    })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 1000,
      }
    : undefined

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'p-0 cursor-grab active:cursor-grabbing transition-colors',
        isDragging ? 'opacity-50' : '',
      )}
    >
      <CardContent className="p-2">
        <div className="font-medium text-sm space-y-1">
          <p>{exercise.name}</p>
          <Badge variant="secondary">
            {exercise.isPublic ? 'Public' : 'Private'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
