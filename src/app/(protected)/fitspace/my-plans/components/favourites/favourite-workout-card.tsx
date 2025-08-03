'use client'

import { formatDistanceToNow } from 'date-fns'
import { Clock, Dumbbell, Edit, Heart, Play, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { GQLGetFavouriteWorkoutsQuery } from '@/generated/graphql-client'
import { WorkoutStatusAnalysis } from '@/hooks/use-favourite-workouts'
import { estimateWorkoutTime } from '@/lib/workout/esimate-workout-time'

interface FavouriteWorkoutCardProps {
  favourite: NonNullable<
    NonNullable<GQLGetFavouriteWorkoutsQuery>['getFavouriteWorkouts']
  >[number]
  onStart: () => void
  onEdit: () => void
  onDelete: () => void
  workoutStatus: WorkoutStatusAnalysis
}

export function FavouriteWorkoutCard({
  favourite,
  onStart,
  onEdit,
  onDelete,
  workoutStatus,
}: FavouriteWorkoutCardProps) {
  const totalExercises = favourite.exercises.length
  const totalSets = favourite.exercises.reduce(
    (sum, exercise) => sum + exercise.sets.length,
    0,
  )

  // Create a simplified exercise structure for time estimation
  const exercisesForEstimation = favourite.exercises.map((exercise) => ({
    restSeconds: 60, // Default rest time
    warmupSets: 0,
    sets: exercise.sets.map((set) => ({ id: set.id })),
  }))

  const estimatedTime = estimateWorkoutTime(exercisesForEstimation)

  const createdAgo = formatDistanceToNow(new Date(favourite.createdAt), {
    addSuffix: true,
  })

  // Determine button state based on workout status
  const getStartButtonProps = () => {
    if (!workoutStatus.canStart) {
      return {
        disabled: true,
        variant: 'secondary' as const,
        text: 'Not Available',
      }
    }

    if (workoutStatus.needsConfirmation) {
      return {
        disabled: false,
        variant: 'outline' as const,
        text: 'Replace & Start',
      }
    }

    return {
      disabled: false,
      variant: 'default' as const,
      text: 'Start Workout',
    }
  }

  const buttonProps = getStartButtonProps()

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <h3 className="font-semibold truncate">{favourite.title}</h3>
            </div>
            {favourite.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {favourite.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Workout
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Workout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Workout Stats */}
        <div className="flex gap-2 flex-wrap">
          <Badge variant="secondary">
            <Dumbbell className="w-3 h-3 mr-1" />
            {totalExercises} exercises
          </Badge>
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            {totalSets} sets
          </Badge>
          {estimatedTime > 0 && (
            <Badge variant="secondary">
              <Clock className="w-3 h-3 mr-1" />~{estimatedTime}min
            </Badge>
          )}
        </div>

        {/* Exercise Preview */}
        {totalExercises > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              EXERCISES
            </p>
            <div className="text-sm space-y-1">
              {favourite.exercises.slice(0, 3).map((exercise) => (
                <div key={exercise.id} className="truncate">
                  {exercise.name}
                </div>
              ))}
              {totalExercises > 3 && (
                <div className="text-muted-foreground">
                  +{totalExercises - 3} more exercises
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            Created {createdAgo}
          </span>
          <Button
            onClick={onStart}
            size="sm"
            variant={buttonProps.variant}
            disabled={buttonProps.disabled}
          >
            <Play className="w-4 h-4 mr-1" />
            {buttonProps.text}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
