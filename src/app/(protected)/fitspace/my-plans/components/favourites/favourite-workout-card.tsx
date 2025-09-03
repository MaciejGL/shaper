'use client'

import { formatDistanceToNow } from 'date-fns'
import { ChevronRight, Clock, Edit, Trash2 } from 'lucide-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardContent, CardFooter, CardHeader } from '@/components/ui/card'
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
  isLoading: boolean
}

export function FavouriteWorkoutCard({
  favourite,
  onStart,
  onEdit,
  onDelete,
  workoutStatus,
  isLoading,
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
        loading: isLoading,
      }
    }

    return {
      disabled: false,
      variant: 'default' as const,
      text: 'Start Workout',
      loading: isLoading,
    }
  }

  const buttonProps = getStartButtonProps()

  // Get unique muscle groups by filtering duplicates based on ID
  const uniqueMuscleGroups = favourite.exercises
    .flatMap((exercise) => exercise.base?.muscleGroups ?? [])
    .filter(
      (muscleGroup, index, array) =>
        array.findIndex((mg) => mg.groupSlug === muscleGroup.groupSlug) ===
        index,
    )

  return (
    <Accordion type="single" collapsible>
      <AccordionItem
        value="body-fat-estimation-guide"
        className="bg-card rounded-lg"
      >
        <AccordionTrigger className="flex items-center justify-between w-full p-4 text-left hover:bg-card-on-card/80 dark:hover:bg-card-on-card/80 transition-colors">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-base font-medium truncate">
                {favourite.title}
              </h3>
            </div>
            <div className="flex items-center gap-1">
              {favourite.exercises.length > 0 && (
                <Badge variant="secondary" size="sm">
                  {favourite.exercises.length} exercises
                </Badge>
              )}
              {uniqueMuscleGroups.length > 0 &&
                uniqueMuscleGroups.slice(0, 3).map((muscleGroup) => (
                  <Badge
                    key={muscleGroup?.id}
                    variant="muscle"
                    size="sm"
                    className="capitalize"
                  >
                    {muscleGroup?.groupSlug}
                  </Badge>
                ))}
              {uniqueMuscleGroups.length > 3 && (
                <Badge variant="muscle" size="sm">
                  +{uniqueMuscleGroups.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent>
          <div>
            <CardHeader className="py-3">
              <div className="flex gap-1 flex-wrap">
                <Badge variant="secondary">{totalSets} sets</Badge>
                {estimatedTime > 0 && (
                  <Badge variant="secondary">
                    <Clock className="w-3 h-3 mr-1" />~{estimatedTime}min
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0 pb-4 space-y-4">
              {/* Workout Stats */}
              {/* Exercise Preview */}
              {totalExercises > 0 && (
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Exercises</h4>

                  {favourite.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {favourite.description}
                    </p>
                  )}
                  <div className="text-sm flex flex-col gap-1">
                    {favourite.exercises.map((exercise, index) => (
                      <Badge
                        key={exercise.id}
                        variant="secondary"
                        size="lg"
                        className="w-full justify-start py-3 whitespace-pre-wrap"
                      >
                        {index + 1}. {exercise.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <span className="text-xs text-muted-foreground">
                Created {createdAgo}
              </span>
            </CardContent>
            <CardFooter className="flex gap-2 border-t [.border-t]:pt-4">
              <Button
                size="icon-sm"
                onClick={onDelete}
                variant="ghost"
                iconOnly={<Trash2 />}
              >
                Delete
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={onEdit}
                iconStart={<Edit />}
                className="ml-auto"
              >
                Edit
              </Button>
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
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
