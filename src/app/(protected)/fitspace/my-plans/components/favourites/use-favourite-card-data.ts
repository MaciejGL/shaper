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
}

export function useFavouriteCardData({
  favourite,
  workoutStatus,
}: UseFavouriteCardDataProps) {
  const totalExercises = favourite.exercises.length
  const totalSets = favourite.exercises.reduce(
    (sum, exercise) => sum + exercise.sets.length,
    0,
  )
  const isEmpty = totalExercises === 0

  // Get unique muscle groups by filtering duplicates based on groupSlug
  const uniqueMuscleGroups = useMemo(() => {
    return favourite.exercises
      .flatMap((exercise) => exercise.base?.muscleGroups ?? [])
      .filter(
        (muscleGroup, index, array) =>
          array.findIndex((mg) => mg.groupSlug === muscleGroup.groupSlug) ===
          index,
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
    if (workoutStatus.canStart) {
      return {
        disabled: true,
        variant: 'tertiary',
        text: 'Start',
        subtext:
          'You have an active training plan. Complete or pause your plan first, then use quick workouts for extra training.',
        loading: false,
      }
    }

    if (workoutStatus.needsConfirmation) {
      return {
        disabled: false,
        variant: 'tertiary',
        text: 'Replace & Start',
        subtext:
          'You have a workout planned for today. Starting a favourite will replace it.',
        loading: false,
      }
    }

    return {
      disabled: false,
      variant: 'default',
      text: 'Start Workout',
      loading: false,
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
