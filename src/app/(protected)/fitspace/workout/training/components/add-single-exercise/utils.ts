import { DISPLAY_GROUP_TO_HIGH_LEVEL } from '@/config/muscles'

type MuscleGroupLike = {
  displayGroup?: string | null
  alias?: string | null
} | null

type ExerciseLike = {
  muscleGroups?: MuscleGroupLike[] | null
}

export function getExerciseMuscleDisplay(
  exercise: ExerciseLike,
): string | undefined {
  const primaryDisplayGroup = exercise.muscleGroups?.[0]?.displayGroup
  const highLevelGroup = primaryDisplayGroup
    ? DISPLAY_GROUP_TO_HIGH_LEVEL[primaryDisplayGroup]
    : null

  const muscleAliases =
    exercise.muscleGroups
      ?.map((mg) => mg?.alias)
      .filter((alias): alias is string => Boolean(alias)) || []

  if (highLevelGroup && muscleAliases.length > 0) {
    return `${highLevelGroup} · ${muscleAliases.join(', ')}`
  }

  if (highLevelGroup) return highLevelGroup
  if (muscleAliases.length > 0) return muscleAliases.join(', ')

  return undefined
}
