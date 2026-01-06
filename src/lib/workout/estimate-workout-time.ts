import { GQLExerciseSet, GQLTrainingExercise } from '@/generated/graphql-client'

import { TIME_PER_SET, WORKOUT_TIME_CONSTANTS } from './workout-time-constants'

export { WORKOUT_TIME_CONSTANTS } from './workout-time-constants'

export function estimateWorkoutTime(
  exercises: (Pick<GQLTrainingExercise, 'restSeconds' | 'warmupSets'> & {
    sets: Pick<GQLExerciseSet, 'id'>[]
  })[],
): number {
  const { DEFAULT_REST, EXERCISE_TRANSITION } = WORKOUT_TIME_CONSTANTS

  let totalSeconds = 0

  exercises.forEach((exercise) => {
    const setCount = exercise.sets.length + (exercise.warmupSets ?? 0)
    const restTime = exercise.restSeconds ?? DEFAULT_REST

    // Per set: execution + equipment overhead (45s + 10s = 55s)
    const setTime = setCount * TIME_PER_SET
    // Rest between sets only (no rest after last set)
    const restTotal = Math.max(0, setCount - 1) * restTime

    totalSeconds += setTime + restTotal
  })

  // Add transition time between exercises (2 min each)
  totalSeconds += exercises.length * EXERCISE_TRANSITION

  return Math.round(totalSeconds / 60) // convert to minutes
}
