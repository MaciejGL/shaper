import { CheckIcon, GripVertical, XIcon } from 'lucide-react'
import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  GQLBaseExercise,
  GQLImage,
  GQLMuscleGroup,
} from '@/generated/graphql-client'
import { cn } from '@/lib/utils'
import { translateEquipment } from '@/utils/translate-equipment'

export type Exercise = Pick<GQLBaseExercise, 'id' | 'name' | 'equipment'> & {
  muscleGroups: Pick<GQLMuscleGroup, 'alias' | 'groupSlug' | 'id'>[]
  secondaryMuscleGroups?: Pick<GQLMuscleGroup, 'alias' | 'groupSlug' | 'id'>[]
  completedAt?: string | null
  images: Pick<GQLImage, 'id' | 'url' | 'order'>[]
}

type ExerciseCardProps = {
  exercise: Exercise
  selectedExercises?: string[]
  onExerciseSelect?: (exerciseId: string) => void
  onExerciseRemove?: (exerciseId: string) => void
  loading?: boolean
  isDraggable?: boolean
}

export function ExerciseCard({
  exercise,
  selectedExercises,
  onExerciseSelect,
  onExerciseRemove,
  isDraggable,
  loading,
}: ExerciseCardProps) {
  const firstImage = exercise.images.at(0)

  return (
    <div
      className={cn(
        'group/exercise-card p-3 flex items-center gap-3 rounded-lg transition-colors border border-transparent',
        selectedExercises?.includes(exercise.id) ? 'bg-primary/5' : ' bg-card',
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
      {isDraggable && (
        <div className="flex-shrink-0 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4" />
        </div>
      )}
      {firstImage && (
        <Image
          src={firstImage.url}
          alt={exercise.name}
          width={100}
          height={100}
          className="rounded-lg"
        />
      )}

      <div className="flex-1 self-start">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="font-medium text-md mb-3">{exercise.name}</div>
          <div className="flex items-center gap-1">
            {selectedExercises?.includes(exercise.id) && (
              <div className="flex items-center">
                <CheckIcon className="h-4 w-4 text-green-600" />
              </div>
            )}
            {onExerciseRemove && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onExerciseRemove(exercise.id)}
                iconOnly={<XIcon />}
                className="opacity-70 group-hover/exercise-card:opacity-100 transition-opacity"
                loading={loading}
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

          {/* Primary muscle groups */}
          {exercise.muscleGroups.map((group) => (
            <Badge key={group.id} variant="muscle" size="xs">
              {group.alias}
            </Badge>
          ))}

          {/* Secondary muscle groups with different styling */}
          {exercise.secondaryMuscleGroups?.map((group) => (
            <Badge
              key={group.id}
              variant="muscle"
              size="xs"
              className="opacity-60"
            >
              {group.alias}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
