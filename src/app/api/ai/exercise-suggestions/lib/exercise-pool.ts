import { DISPLAY_GROUP_MUSCLE_IDS, getMuscleById } from '@/config/muscles'
import { prisma } from '@/lib/db'
import { getExerciseVersionWhereClause } from '@/lib/exercise-version-filter'

import type { ExerciseForSelection } from './types'

export async function getExercisesForMuscles(
  muscleGroups: string[],
): Promise<ExerciseForSelection[]> {
  const muscleIds: string[] = []
  muscleGroups.forEach((group) => {
    const ids = DISPLAY_GROUP_MUSCLE_IDS[group]
    if (ids) muscleIds.push(...ids)
  })

  if (muscleIds.length === 0) return []

  const exercises = await prisma.baseExercise.findMany({
    relationLoadStrategy: 'query',
    where: {
      isPublic: true,
      ...getExerciseVersionWhereClause(),
      OR: [
        { muscleGroups: { some: { id: { in: muscleIds } } } },
        { secondaryMuscleGroups: { some: { id: { in: muscleIds } } } },
      ],
    },
    include: {
      muscleGroups: true,
      secondaryMuscleGroups: true,
    },
    take: 50,
  })

  return exercises.map((e) => ({
    id: e.id,
    name: e.name,
    muscleGroup: e.muscleGroups[0]
      ? getMuscleById(e.muscleGroups[0].id)?.displayGroup || 'Unknown'
      : 'Unknown',
    equipment: e.equipment ?? null,
    type: e.type ?? null,
    difficulty: e.difficulty ?? null,
    primaryDisplayGroups: Array.from(
      new Set(
        e.muscleGroups
          .map((mg) => getMuscleById(mg.id)?.displayGroup)
          .filter((g): g is string => !!g),
      ),
    ),
    secondaryDisplayGroups: Array.from(
      new Set(
        e.secondaryMuscleGroups
          .map((mg) => getMuscleById(mg.id)?.displayGroup)
          .filter((g): g is string => !!g),
      ),
    ),
  }))
}
