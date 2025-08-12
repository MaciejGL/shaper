'use client'

import { formatDistanceToNow } from 'date-fns'
import {
  ChevronRight,
  Clock,
  Dumbbell,
  Edit,
  MoreVertical,
  Trash2,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
        variant: 'secondary' as const,
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
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Workout
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Workout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Workout Stats */}
        {/* Exercise Preview */}
        {totalExercises > 0 && (
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Exercises</h4>
            <div className="text-sm flex flex-col gap-1">
              {favourite.exercises.map((exercise, index) => (
                <Badge
                  key={exercise.id}
                  variant="secondary"
                  size="lg"
                  className="w-full justify-start"
                >
                  {index + 1}. {exercise.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {/* Footer */}
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Created {createdAgo}
        </span>
        {!buttonProps.disabled ? (
          <Button
            onClick={onStart}
            size="sm"
            variant={buttonProps.variant}
            disabled={buttonProps.disabled}
            iconEnd={<ChevronRight />}
          >
            {buttonProps.text}
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  )
}
