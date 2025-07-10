import { useDraggable } from '@dnd-kit/core'
import { PencilIcon } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  GQLMuscleGroupCategoriesQuery,
  GQLTrainerExercisesQuery,
} from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { CreateExerciseDialog } from '../../../exercises/components/create-exercise-dialog'

interface ExerciseCardProps {
  exercise: GQLTrainerExercisesQuery['userExercises'][number]
  categories: GQLMuscleGroupCategoriesQuery['muscleGroupCategories']
  publicExercises: GQLTrainerExercisesQuery['publicExercises']
  userExercises: GQLTrainerExercisesQuery['userExercises']
  canEdit?: boolean
}

export function ExerciseCard({
  exercise,
  categories,
  publicExercises,
  userExercises,
  canEdit = true,
}: ExerciseCardProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: exercise.id,
      data: {
        type: 'exercise',
        exercise,
      },
      disabled: !canEdit,
    })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 1000,
      }
    : undefined

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={cn(
          'p-0 transition-colors bg-card-on-card group/exercise-card',
          canEdit ? 'cursor-grab active:cursor-grabbing' : 'cursor-default',
          isDragging ? 'opacity-0' : '',
        )}
        variant="secondary"
      >
        <CardContent className="p-2">
          <div className="font-medium text-sm space-y-1">
            <div className="flex items-start justify-between">
              <p>{exercise.name}</p>
              <Button
                className="group-hover/exercise-card:opacity-100 opacity-0 transition-opacity"
                variant="ghost"
                iconOnly={<PencilIcon />}
                onClick={() => setIsCreateDialogOpen(true)}
                disabled={!canEdit}
              />
            </div>
            <Badge variant="secondary">
              {exercise.isPublic ? 'Public' : 'Private'}
            </Badge>
          </div>
        </CardContent>
      </Card>
      {isCreateDialogOpen && (
        <CreateExerciseDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          categories={categories}
          exercise={exercise}
          publicExercises={publicExercises}
          userExercises={userExercises}
        />
      )}
    </>
  )
}
