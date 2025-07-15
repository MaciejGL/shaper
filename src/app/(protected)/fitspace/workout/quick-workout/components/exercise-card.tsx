import { CheckIcon, GripVertical, XIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GQLBaseExercise, GQLMuscleGroup } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'
import { translateEquipment } from '@/utils/translate-equipment'

export type Exercise = Pick<GQLBaseExercise, 'id' | 'name' | 'equipment'> & {
  muscleGroups: Pick<GQLMuscleGroup, 'alias' | 'groupSlug' | 'id'>[]
}

type ExerciseCardProps = {
  exercise: Exercise
  selectedExercises?: string[]
  onExerciseSelect?: (exerciseId: string) => void
  onExerciseRemove?: (exerciseId: string) => void
}

export function ExerciseCard({
  exercise,
  selectedExercises,
  onExerciseSelect,
  onExerciseRemove,
}: ExerciseCardProps) {
  return (
    <div
      className={cn(
        'group/exercise-card p-3 flex items-center gap-3 rounded-lg transition-colors border border-transparent',
        selectedExercises?.includes(exercise.id) ? 'bg-primary/5' : ' bg-card ',
        !onExerciseRemove && 'cursor-pointer hover:border-primary/20',
      )}
      onClick={
        !onExerciseRemove
          ? () => {
              if (selectedExercises?.includes(exercise.id)) {
                onExerciseSelect?.(exercise.id)
              } else {
                onExerciseSelect?.(exercise.id)
              }
            }
          : undefined
      }
    >
      {onExerciseRemove && (
        <div className="flex-shrink-0 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4" />
        </div>
      )}
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="font-medium text-sm mb-3">{exercise.name}</div>
          <div className="flex items-center gap-2">
            {selectedExercises?.includes(exercise.id) && (
              <div className="flex items-center">
                <CheckIcon className="h-4 w-4 text-green-600" />
              </div>
            )}
            {onExerciseRemove && (
              <Button
                variant="ghost"
                onClick={() => onExerciseRemove(exercise.id)}
                iconOnly={<XIcon />}
                className="opacity-70 group-hover/exercise-card:opacity-100 transition-opacity"
              >
                Remove
              </Button>
            )}
          </div>
        </div>
        <div className="text-xs text-muted-foreground flex flex-wrap gap-1">
          {exercise.equipment && (
            <Badge variant="equipment" size="xs">
              {translateEquipment(exercise.equipment)}
            </Badge>
          )}

          {exercise.muscleGroups.map((group) => (
            <Badge key={group.id} variant="muscle" size="xs">
              {group.alias}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
