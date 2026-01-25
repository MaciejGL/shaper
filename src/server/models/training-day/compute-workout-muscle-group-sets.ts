import { TRACKED_DISPLAY_GROUPS, getMuscleById } from '@/config/muscles'

const SECONDARY_MUSCLE_WEIGHT = 0.25

type CompletedSet = { completedAt: Date | null }

type ExerciseMuscleGroup = {
  id: string
  displayGroup: string | null
}

type WorkoutExerciseForSets = {
  base?: {
    muscleGroups?: ExerciseMuscleGroup[]
    secondaryMuscleGroups?: ExerciseMuscleGroup[]
  } | null
  sets?: CompletedSet[]
}

export interface WorkoutMuscleGroupSet {
  displayGroup: string
  weightedSets: number
}

export interface WorkoutMuscleGroupSetsResult {
  sets: WorkoutMuscleGroupSet[]
  maxWeightedSets: number
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

export function computeWorkoutMuscleGroupSets(
  exercises: WorkoutExerciseForSets[],
): WorkoutMuscleGroupSetsResult {
  const totals: Record<string, number> = {}
  TRACKED_DISPLAY_GROUPS.forEach((g) => {
    totals[g] = 0
  })

  exercises.forEach((exercise) => {
    if (!exercise.base) return
    const setCount = (exercise.sets ?? []).filter((s) => s.completedAt).length
    if (setCount <= 0) return

    const countedPrimaryGroups = new Set<string>()
    const countedSecondaryGroups = new Set<string>()

    ;(exercise.base.muscleGroups ?? []).forEach((mg) => {
      const staticMuscle = getMuscleById(mg.id)
      const mappedGroup = staticMuscle?.displayGroup || mg.displayGroup
      if (!mappedGroup || totals[mappedGroup] === undefined) return

      if (!countedPrimaryGroups.has(mappedGroup)) {
        totals[mappedGroup] += setCount
        countedPrimaryGroups.add(mappedGroup)
      }
    })

    ;(exercise.base.secondaryMuscleGroups ?? []).forEach((mg) => {
      const staticMuscle = getMuscleById(mg.id)
      const mappedGroup = staticMuscle?.displayGroup || mg.displayGroup
      if (!mappedGroup || totals[mappedGroup] === undefined) return

      if (
        !countedPrimaryGroups.has(mappedGroup) &&
        !countedSecondaryGroups.has(mappedGroup)
      ) {
        totals[mappedGroup] += setCount * SECONDARY_MUSCLE_WEIGHT
        countedSecondaryGroups.add(mappedGroup)
      }
    })
  })

  const sets: WorkoutMuscleGroupSet[] = Object.entries(totals)
    .filter(([_group, value]) => value > 0)
    .map(([displayGroup, value]) => ({
      displayGroup,
      // UI wants whole sets, but we still apply weighting internally.
      weightedSets: Math.round(round1(value)),
    }))

  const maxWeightedSets = sets.length
    ? Math.max(...sets.map((s) => s.weightedSets))
    : 0

  return { sets, maxWeightedSets }
}

