import { prisma } from '@/lib/db'

/**
 * Get the best 1RM for a user and exercise, with flexible exclusion options
 * Uses the same 1RM calculation formulas as the shared utility (Brzycki/O'Conner/Conservative)
 */
export async function getHistoricalBest1RM(params: {
  baseExerciseId: string
  userId: string
  excludeSetId?: string
  excludeDayId?: string
  includingCurrentWorkout?: boolean
}): Promise<number> {
  const {
    baseExerciseId,
    userId,
    excludeSetId,
    excludeDayId,
    includingCurrentWorkout = false,
  } = params

  let result: { max1rm: number }[]

  if (excludeSetId && includingCurrentWorkout) {
    // Query including current workout but excluding specific set (for real-time PR detection)
    result = await prisma.$queryRaw<{ max1rm: number }[]>`
      SELECT MAX(
        CASE 
          WHEN esl.reps <= 10 THEN esl.weight / (1.0278 - (0.0278 * esl.reps))
          WHEN esl.reps <= 15 THEN esl.weight * (1 + 0.025 * esl.reps)
          ELSE esl.weight * 1.5
        END
      ) as max1rm
      FROM "ExerciseSet" es
      JOIN "TrainingExercise" te ON es."exerciseId" = te.id
      JOIN "ExerciseSetLog" esl ON es."logId" = esl.id
      JOIN "TrainingDay" td ON te."dayId" = td.id
      JOIN "TrainingWeek" tw ON td."weekId" = tw.id
      JOIN "TrainingPlan" tp ON tw."planId" = tp.id
      WHERE te."baseId" = ${baseExerciseId}
        AND tp."assignedToId" = ${userId}
        AND es."completedAt" IS NOT NULL
        AND esl.weight IS NOT NULL
        AND esl.reps IS NOT NULL
        AND es.id != ${excludeSetId}
    `
  } else if (excludeSetId) {
    // Query excluding specific set and current workout (historical only)
    result = await prisma.$queryRaw<{ max1rm: number }[]>`
      SELECT MAX(
        CASE 
          WHEN esl.reps <= 10 THEN esl.weight / (1.0278 - (0.0278 * esl.reps))
          WHEN esl.reps <= 15 THEN esl.weight * (1 + 0.025 * esl.reps)
          ELSE esl.weight * 1.5
        END
      ) as max1rm
      FROM "ExerciseSet" es
      JOIN "TrainingExercise" te ON es."exerciseId" = te.id
      JOIN "ExerciseSetLog" esl ON es."logId" = esl.id
      JOIN "TrainingDay" td ON te."dayId" = td.id
      JOIN "TrainingWeek" tw ON td."weekId" = tw.id
      JOIN "TrainingPlan" tp ON tw."planId" = tp.id
      WHERE te."baseId" = ${baseExerciseId}
        AND tp."assignedToId" = ${userId}
        AND es."completedAt" IS NOT NULL
        AND esl.weight IS NOT NULL
        AND esl.reps IS NOT NULL
        AND td."completedAt" IS NOT NULL
        AND es.id != ${excludeSetId}
    `
  } else if (excludeDayId) {
    // Query excluding specific day (for workout summary PRs)
    result = await prisma.$queryRaw<{ max1rm: number }[]>`
      SELECT MAX(
        CASE 
          WHEN esl.reps <= 10 THEN esl.weight / (1.0278 - (0.0278 * esl.reps))
          WHEN esl.reps <= 15 THEN esl.weight * (1 + 0.025 * esl.reps)
          ELSE esl.weight * 1.5
        END
      ) as max1rm
      FROM "ExerciseSet" es
      JOIN "TrainingExercise" te ON es."exerciseId" = te.id
      JOIN "ExerciseSetLog" esl ON es."logId" = esl.id
      JOIN "TrainingDay" td ON te."dayId" = td.id
      JOIN "TrainingWeek" tw ON td."weekId" = tw.id
      JOIN "TrainingPlan" tp ON tw."planId" = tp.id
      WHERE te."baseId" = ${baseExerciseId}
        AND tp."assignedToId" = ${userId}
        AND es."completedAt" IS NOT NULL
        AND esl.weight IS NOT NULL
        AND esl.reps IS NOT NULL
        AND td."completedAt" IS NOT NULL
        AND td.id != ${excludeDayId}
    `
  } else {
    // Query without exclusions (general case)
    result = await prisma.$queryRaw<{ max1rm: number }[]>`
      SELECT MAX(
        CASE 
          WHEN esl.reps <= 10 THEN esl.weight / (1.0278 - (0.0278 * esl.reps))
          WHEN esl.reps <= 15 THEN esl.weight * (1 + 0.025 * esl.reps)
          ELSE esl.weight * 1.5
        END
      ) as max1rm
      FROM "ExerciseSet" es
      JOIN "TrainingExercise" te ON es."exerciseId" = te.id
      JOIN "ExerciseSetLog" esl ON es."logId" = esl.id
      JOIN "TrainingDay" td ON te."dayId" = td.id
      JOIN "TrainingWeek" tw ON td."weekId" = tw.id
      JOIN "TrainingPlan" tp ON tw."planId" = tp.id
      WHERE te."baseId" = ${baseExerciseId}
        AND tp."assignedToId" = ${userId}
        AND es."completedAt" IS NOT NULL
        AND esl.weight IS NOT NULL
        AND esl.reps IS NOT NULL
        AND td."completedAt" IS NOT NULL
    `
  }

  return result[0]?.max1rm || 0
}
