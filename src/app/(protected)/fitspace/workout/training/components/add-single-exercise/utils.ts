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

  const normalize = (value: string) => value.trim().toLowerCase()

  const muscleAliases =
    exercise.muscleGroups
      ?.map((mg) => mg?.alias)
      .filter((alias): alias is string => Boolean(alias)) || []

  const uniqueAliases = (() => {
    const seen = new Set<string>()
    const result: string[] = []
    for (const alias of muscleAliases) {
      const key = normalize(alias)
      if (seen.has(key)) continue
      seen.add(key)
      result.push(alias.trim())
    }
    return result
  })()

  const filteredAliases = highLevelGroup
    ? uniqueAliases.filter(
        (alias) => normalize(alias) !== normalize(highLevelGroup),
      )
    : uniqueAliases

  if (highLevelGroup && filteredAliases.length > 0) {
    return `${highLevelGroup} (${filteredAliases.join(', ')})`
  }

  if (highLevelGroup) return highLevelGroup
  if (filteredAliases.length > 0) return filteredAliases.join(', ')

  return undefined
}
