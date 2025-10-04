import { GQLExerciseSet, GQLTrainingExercise } from '@/generated/graphql-client'

export function estimateWorkoutTime(
  exercises: (Pick<GQLTrainingExercise, 'restSeconds' | 'warmupSets'> & {
    sets: Pick<GQLExerciseSet, 'id'>[]
  })[],
): number {
  const setLength = 60 // seconds
  const fallbackRestTime = 90 // seconds

  const totalTimeInSeconds = exercises.reduce((sum, exercise) => {
    const restTime = exercise.restSeconds ?? fallbackRestTime
    const totalSets = exercise.sets.length + (exercise.warmupSets ?? 0)

    // Time for all sets + rest time between sets (no rest after last set)
    const exerciseTime =
      totalSets * setLength + Math.max(0, totalSets - 1) * restTime

    return sum + exerciseTime
  }, 0)

  return Math.round(totalTimeInSeconds / 60) // convert to minutes
}
