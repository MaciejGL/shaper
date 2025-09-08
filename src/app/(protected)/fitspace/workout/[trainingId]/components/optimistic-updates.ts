import type { GQLFitspaceGetWorkoutQuery } from '@/generated/graphql-client'

/**
 * Creates an optimistic update function for marking a set as completed/uncompleted
 * Also automatically updates exercise completion when all sets are done
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

    // Update the specific set and check exercise completion
    newWorkout.getWorkout.plan.weeks.forEach((week) => {
      week.days.forEach((day) => {
        day.exercises.forEach((exercise) => {
          const setsToUpdate = exercise.substitutedBy?.sets || exercise.sets
          let updatedSet = false

          // Update the specific set
          setsToUpdate.forEach((set) => {
            if (set.id === setId) {
              set.completedAt = completed ? new Date().toISOString() : null
              updatedSet = true

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

          // ✅ Auto-update exercise completion when all sets are done
          if (updatedSet) {
            const exerciseToUpdate = exercise.substitutedBy || exercise
            const allSetsCompleted = setsToUpdate.every(
              (set) => set.completedAt,
            )
            const noSetsCompleted = setsToUpdate.every(
              (set) => !set.completedAt,
            )

            if (allSetsCompleted) {
              // All sets completed → mark exercise as completed
              exerciseToUpdate.completedAt = new Date().toISOString()
            } else if (noSetsCompleted) {
              // No sets completed → mark exercise as not completed
              exerciseToUpdate.completedAt = null
            } else {
              // Some sets completed → exercise remains incomplete
              exerciseToUpdate.completedAt = null
            }
          }
        })
      })
    })

    return newWorkout
  }
}

/**
 * Creates an optimistic update function for marking an exercise as completed/uncompleted
 * Also updates all sets to match the exercise completion state
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

    // Update the specific exercise and all its sets
    newWorkout.getWorkout.plan.weeks.forEach((week) => {
      week.days.forEach((day) => {
        day.exercises.forEach((exercise) => {
          const targetExerciseId = exercise.substitutedBy?.id || exercise.id
          if (targetExerciseId === exerciseId) {
            const exerciseToUpdate = exercise.substitutedBy || exercise
            const setsToUpdate = exercise.substitutedBy?.sets || exercise.sets

            // ✅ Update exercise completion
            exerciseToUpdate.completedAt = completed
              ? new Date().toISOString()
              : null

            // ✅ Update all sets to match exercise completion state
            setsToUpdate.forEach((set) => {
              set.completedAt = completed ? new Date().toISOString() : null
            })
          }
        })
      })
    })

    return newWorkout
  }
}

/**
 * Creates an optimistic update function for removing a set from an exercise
 * Also updates exercise completion if all remaining sets are completed
 */
export const createOptimisticRemoveSetUpdate = (setId: string) => {
  return (oldData: GQLFitspaceGetWorkoutQuery) => {
    if (!oldData?.getWorkout?.plan) return oldData

    const newWorkout = JSON.parse(
      JSON.stringify(oldData),
    ) as NonNullable<GQLFitspaceGetWorkoutQuery>
    if (!newWorkout.getWorkout?.plan) return newWorkout

    // Find and remove the set, then check exercise completion
    newWorkout.getWorkout.plan.weeks.forEach((week) => {
      week.days.forEach((day) => {
        day.exercises.forEach((exercise) => {
          const setsToUpdate = exercise.substitutedBy?.sets || exercise.sets
          const setIndex = setsToUpdate.findIndex((s) => s.id === setId)

          if (setIndex !== -1) {
            // Remove the set
            setsToUpdate.splice(setIndex, 1)

            // Reorder remaining sets
            setsToUpdate.forEach((remainingSet, index) => {
              remainingSet.order = index + 1
            })

            // ✅ Check if exercise should be marked as completed
            const exerciseToUpdate = exercise.substitutedBy || exercise
            const allSetsCompleted = setsToUpdate.every(
              (set) => set.completedAt,
            )

            if (allSetsCompleted && setsToUpdate.length > 0) {
              // All remaining sets completed → mark exercise as completed
              exerciseToUpdate.completedAt = new Date().toISOString()
            } else {
              // Not all sets completed → mark exercise as incomplete
              exerciseToUpdate.completedAt = null
            }
          }
        })
      })
    })

    return newWorkout
  }
}
