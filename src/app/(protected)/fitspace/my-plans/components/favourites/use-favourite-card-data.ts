import { useMemo } from 'react'

import { ButtonProps } from '@/components/ui/button'
import { GQLGetFavouriteWorkoutsQuery } from '@/generated/graphql-client'
import { WorkoutStatusAnalysis } from '@/hooks/use-favourite-workouts'
import { estimateWorkoutTime } from '@/lib/workout/esimate-workout-time'

type FavouriteWorkout = NonNullable<
  NonNullable<GQLGetFavouriteWorkoutsQuery>['getFavouriteWorkouts']
>[number]

interface UseFavouriteCardDataProps {
  favourite: FavouriteWorkout
  workoutStatus: WorkoutStatusAnalysis
  isStarting?: boolean
}

export function useFavouriteCardData({
  favourite,
  workoutStatus,
  isStarting = false,
}: UseFavouriteCardDataProps) {
  const totalExercises = favourite.exercises.length
  const totalSets = favourite.exercises.reduce(
    (sum, exercise) => sum + exercise.sets.length,
    0,
  )
  const isEmpty = totalExercises === 0

  // Get unique muscle groups by filtering duplicates based on displayGroup
  const uniqueMuscleGroups = useMemo(() => {
    return favourite.exercises
      .flatMap((exercise) => exercise.base?.muscleGroups ?? [])
      .filter(
        (muscleGroup, index, array) =>
          array.findIndex(
            (mg) => mg.displayGroup === muscleGroup.displayGroup,
          ) === index,
      )
  }, [favourite.exercises])

  // Calculate estimated workout time
  const estimatedMinutes = useMemo(() => {
    return estimateWorkoutTime(favourite.exercises)
  }, [favourite.exercises])

  // Get start button props based on workout status
  const getStartButtonProps = (): {
    disabled: boolean
    variant: ButtonProps['variant']
    text: string
    subtext?: string
    loading: boolean
  } => {
    if (!workoutStatus.canStart) {
      return {
        disabled: true,
        variant: 'default',
        text: 'Start Workout',
        subtext: "Can't be activated because you have an active training plan.",
        loading: isStarting,
      }
    }

    if (workoutStatus.needsConfirmation) {
      return {
        disabled: isStarting,
        variant: 'default',
        text: 'Replace & Start Workout',
        subtext:
          'You have a workout planned for today. Starting a favourite will replace it.',
        loading: isStarting,
      }
    }

    return {
      disabled: isStarting,
      variant: 'default',
      text: 'Start Workout',
      loading: isStarting,
    }
  }

  const buttonProps = getStartButtonProps()

  return {
    totalExercises,
    totalSets,
    isEmpty,
    uniqueMuscleGroups,
    estimatedMinutes,
    buttonProps,
  }
}
