import type { GQLFitspaceGetWorkoutQuery } from '@/generated/graphql-client'

/**
 * Creates an optimistic update function for marking a set as completed/uncompleted
 */
export const createOptimisticSetUpdate = (
  setId: string,
  completed: boolean,
  logValues?: { reps?: number | null; weight?: number | null },
) => {
  return (oldData: GQLFitspaceGetWorkoutQuery) => {
    if (!oldData?.getWorkout?.plan) return oldData

    const newWorkout = JSON.parse(
      JSON.stringify(oldData),
    ) as NonNullable<GQLFitspaceGetWorkoutQuery>
    if (!newWorkout.getWorkout?.plan) return newWorkout

    // Update the specific set
    newWorkout.getWorkout.plan.weeks.forEach((week) => {
      week.days.forEach((day) => {
        day.exercises.forEach((exercise) => {
          const setsToUpdate = exercise.substitutedBy?.sets || exercise.sets
          setsToUpdate.forEach((set) => {
            if (set.id === setId) {
              set.completedAt = completed ? new Date().toISOString() : null

              // Update log values if completing the set and log values are provided
              if (completed && logValues) {
                set.log = {
                  id: set.log?.id || 'temp-id',
                  reps: logValues.reps || null,
                  weight: logValues.weight || null,
                  rpe: set.log?.rpe || null,
                  createdAt: new Date().toISOString(),
                }
              }
            }
          })
        })
      })
    })

    return newWorkout
  }
}

/**
 * Creates an optimistic update function for marking an exercise as completed/uncompleted
 */
export const createOptimisticExerciseUpdate = (
  exerciseId: string,
  completed: boolean,
) => {
  return (oldData: GQLFitspaceGetWorkoutQuery) => {
    if (!oldData?.getWorkout?.plan) return oldData

    const newWorkout = JSON.parse(
      JSON.stringify(oldData),
    ) as NonNullable<GQLFitspaceGetWorkoutQuery>
    if (!newWorkout.getWorkout?.plan) return newWorkout

    // Update the specific exercise
    newWorkout.getWorkout.plan.weeks.forEach((week) => {
      week.days.forEach((day) => {
        day.exercises.forEach((exercise) => {
          const targetExerciseId = exercise.substitutedBy?.id || exercise.id
          if (targetExerciseId === exerciseId) {
            const exerciseToUpdate = exercise.substitutedBy || exercise
            exerciseToUpdate.completedAt = completed
              ? new Date().toISOString()
              : null
          }
        })
      })
    })

    return newWorkout
  }
}
