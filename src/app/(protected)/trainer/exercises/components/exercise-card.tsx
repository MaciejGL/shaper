'use client'

import { Edit, MoreHorizontal, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { AnimatedGridItem } from '@/components/animated-grid'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  GQLMuscleGroupCategoriesQuery,
  GQLTrainerExercisesQuery,
  useDeleteExerciseMutation,
  useTrainerExercisesQuery,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'
import { cn } from '@/lib/utils'
import { translateEquipment } from '@/utils/translate-equipment'

import { CreateExerciseDialog } from './create-exercise-dialog'

interface ExerciseCardProps {
  exercise: GQLTrainerExercisesQuery['userExercises'][number] &
    GQLTrainerExercisesQuery['publicExercises'][number]
  categories?: GQLMuscleGroupCategoriesQuery['muscleGroupCategories']
  isFirstRender: boolean
  isLoading?: boolean
}

export function ExerciseCard({
  exercise,
  categories,
  isFirstRender,
  isLoading,
}: ExerciseCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const invalidateQuery = useInvalidateQuery()
  const { mutateAsync: deleteExercise, isPending: isDeletingExercise } =
    useDeleteExerciseMutation({
      onSuccess: () => {
        toast.success('Exercise deleted successfully')
        invalidateQuery({
          queryKey: useTrainerExercisesQuery.getKey(),
        })
      },
    })

  const handleDelete = async () => {
    await deleteExercise({ id: exercise.id })
    setIsEditDialogOpen(false)
  }

  return (
    <AnimatedGridItem
      id={exercise.id}
      layoutId={`exercises-${exercise.id}`}
      isFirstRender={isFirstRender && !isLoading}
    >
      <Card className={cn('h-full flex flex-col gap-2')}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle
                className={cn(
                  'line-clamp-1',
                  isLoading && 'masked-placeholder-text',
                )}
              >
                {exercise.name}
              </CardTitle>
            </div>
            {!exercise.isPublic && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    disabled={isLoading}
                    variant="ghost"
                    size="icon-xs"
                    iconOnly={<MoreHorizontal />}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                    <Edit className="size-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive"
                    disabled={isDeletingExercise}
                    loading={isDeletingExercise}
                  >
                    <Trash2 className="size-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col justify-between gap-2">
          {exercise.description && (
            <p
              className={cn(
                'text-sm text-muted-foreground line-clamp-2',
                isLoading && 'masked-placeholder-text',
              )}
            >
              {exercise.description}
            </p>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-1">
              {exercise.equipment && (
                <Badge
                  variant="outline"
                  className="capitalize"
                  isLoading={isLoading}
                >
                  {translateEquipment(exercise.equipment)}
                </Badge>
              )}

              {exercise.videoUrl && (
                <Badge variant="outline" isLoading={isLoading}>
                  Video
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {exercise.muscleGroups.slice(0, 3).map((muscle) => (
                <Badge
                  key={muscle.id}
                  variant="secondary"
                  isLoading={isLoading}
                >
                  {muscle.alias ?? muscle.name}
                </Badge>
              ))}
              {exercise.muscleGroups.length > 3 && (
                <Badge variant="outline" isLoading={isLoading}>
                  +{exercise.muscleGroups.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {!exercise.isPublic && (
        <CreateExerciseDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          exercise={exercise}
          categories={categories}
        />
      )}
    </AnimatedGridItem>
  )
}
