import { GQLExerciseSet, GQLTrainingExercise } from '@/generated/graphql-client'

export function estimateWorkoutTime(
  exercises: (Pick<GQLTrainingExercise, 'restSeconds' | 'warmupSets'> & {
    sets: Pick<GQLExerciseSet, 'id'>[]
  })[],
): number {
  const setLength = 60
  const restTime = exercises.reduce(
    (sum, exercise) => sum + (exercise.restSeconds ?? 0),
    0,
  )

  // Rough estimate: 2-3 minutes per set + rest time
  const totalSets = exercises.reduce(
    (sum, exercise) => sum + exercise.sets.length + (exercise.warmupSets ?? 0),
    0,
  )
  const totalTime = totalSets * setLength + restTime
  return Math.round(totalTime / 60) // minutes
}
