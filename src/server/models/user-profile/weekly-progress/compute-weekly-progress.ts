import { getMuscleById } from '@/config/muscles'
import { GQLMuscleContributionType } from '@/generated/graphql-server'

type CompletedSet = {
  completedAt: Date | null
}

type ExerciseMuscleGroup = {
  id: string
  name: string
  alias?: string | null
  displayGroup?: string | null
}

type WeeklyProgressExercise = {
  base: {
    id: string
    name: string
    muscleGroups: ExerciseMuscleGroup[]
    secondaryMuscleGroups: ExerciseMuscleGroup[]
  } | null
  sets: CompletedSet[]
}

export interface ComputedSubMuscleProgress {
  name: string
  alias: string
  completedSets: number
}

export type MuscleContributionType = GQLMuscleContributionType

export interface ComputedExerciseContribution {
  exerciseId: string
  exerciseName: string
  contributionType: MuscleContributionType
  rawSets: number
  weightedSets: number
}

export interface ComputedWeeklyMuscleProgress {
  muscleGroup: string
  completedSets: number
  targetSets: number
  percentage: number
  lastTrained: string | null
  subMuscles: ComputedSubMuscleProgress[]
  exerciseContributions: ComputedExerciseContribution[]
}

export interface ComputedWeeklyProgressResult {
  overallPercentage: number
  totalSets: number
  muscleProgress: ComputedWeeklyMuscleProgress[]
}

const SECONDARY_MUSCLE_WEIGHT = 0.25

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function floor0(value: number): number {
  return Math.floor(value)
}

export function computeWeeklyProgressFromExercises(options: {
  exercises: WeeklyProgressExercise[]
  trackedMuscleGroups: string[]
  getTargetForGroup: (group: string) => number
}): ComputedWeeklyProgressResult {
  const { exercises, trackedMuscleGroups, getTargetForGroup } = options

  const muscleProgress: Record<string, { completedSets: number; lastTrained: Date | null }> =
    {}

  const subMuscleProgress: Record<
    string,
    Record<string, { name: string; alias: string; completedSets: number }>
  > = {}

  const exerciseContributionsByGroup: Record<
    string,
    Record<string, ComputedExerciseContribution>
  > = {}

  trackedMuscleGroups.forEach((group) => {
    muscleProgress[group] = { completedSets: 0, lastTrained: null }
    subMuscleProgress[group] = {}
    exerciseContributionsByGroup[group] = {}
  })

  let totalSets = 0

  exercises.forEach((exercise) => {
    if (!exercise.base) return

    const exerciseBase = exercise.base
    const setCount = exercise.sets.length
    totalSets += setCount

    const countedPrimaryGroups = new Set<string>()
    const countedSecondaryGroups = new Set<string>()

    const addExerciseContribution = (
      mappedGroup: string,
      contributionType: MuscleContributionType,
      rawSets: number,
      weightedSets: number,
    ) => {
      if (!exerciseContributionsByGroup[mappedGroup]) return
      const existing = exerciseContributionsByGroup[mappedGroup][exerciseBase.id]
      if (existing) {
        existing.rawSets += rawSets
        existing.weightedSets += weightedSets
        return
      }

      exerciseContributionsByGroup[mappedGroup][exerciseBase.id] = {
        exerciseId: exerciseBase.id,
        exerciseName: exerciseBase.name,
        contributionType,
        rawSets,
        weightedSets,
      }
    }

    const updateLastTrained = (mappedGroup: string) => {
      exercise.sets.forEach((set) => {
        if (
          set.completedAt &&
          (!muscleProgress[mappedGroup].lastTrained ||
            set.completedAt > muscleProgress[mappedGroup].lastTrained!)
        ) {
          muscleProgress[mappedGroup].lastTrained = set.completedAt
        }
      })
    }

    exercise.base.muscleGroups?.forEach((mg) => {
      const staticMuscle = getMuscleById(mg.id)
      const mappedGroup = staticMuscle?.displayGroup || mg.displayGroup
      if (!mappedGroup || !muscleProgress[mappedGroup]) return

      if (!countedPrimaryGroups.has(mappedGroup)) {
        muscleProgress[mappedGroup].completedSets += setCount
        countedPrimaryGroups.add(mappedGroup)
        addExerciseContribution(
          mappedGroup,
          GQLMuscleContributionType.Primary,
          setCount,
          setCount,
        )
      }

      const subMuscleKey = mg.name
      if (!subMuscleProgress[mappedGroup][subMuscleKey]) {
        subMuscleProgress[mappedGroup][subMuscleKey] = {
          name: mg.name,
          alias: mg.alias || mg.name,
          completedSets: 0,
        }
      }
      subMuscleProgress[mappedGroup][subMuscleKey].completedSets += setCount

      updateLastTrained(mappedGroup)
    })

    exercise.base.secondaryMuscleGroups?.forEach((mg) => {
      const staticMuscle = getMuscleById(mg.id)
      const mappedGroup = staticMuscle?.displayGroup || mg.displayGroup
      if (!mappedGroup || !muscleProgress[mappedGroup]) return

      if (
        !countedPrimaryGroups.has(mappedGroup) &&
        !countedSecondaryGroups.has(mappedGroup)
      ) {
        muscleProgress[mappedGroup].completedSets += setCount * SECONDARY_MUSCLE_WEIGHT
        countedSecondaryGroups.add(mappedGroup)
        addExerciseContribution(
          mappedGroup,
          GQLMuscleContributionType.Secondary,
          setCount,
          setCount * SECONDARY_MUSCLE_WEIGHT,
        )
      }

      const subMuscleKey = mg.name
      if (!subMuscleProgress[mappedGroup][subMuscleKey]) {
        subMuscleProgress[mappedGroup][subMuscleKey] = {
          name: mg.name,
          alias: mg.alias || mg.name,
          completedSets: 0,
        }
      }
      subMuscleProgress[mappedGroup][subMuscleKey].completedSets +=
        setCount * SECONDARY_MUSCLE_WEIGHT

      updateLastTrained(mappedGroup)
    })
  })

  const muscleProgressArray: ComputedWeeklyMuscleProgress[] = trackedMuscleGroups.map(
    (group) => {
      const progress = muscleProgress[group]
      const targetSets = getTargetForGroup(group)
      const percentage = Math.min(100, (progress.completedSets / targetSets) * 100)

      const subMuscles = Object.values(subMuscleProgress[group]).map((sub) => ({
        name: sub.name,
        alias: sub.alias,
        completedSets: floor0(sub.completedSets),
      }))

      const exerciseContributions = Object.values(
        exerciseContributionsByGroup[group],
      ).sort(
        (a, b) =>
          b.weightedSets - a.weightedSets || b.rawSets - a.rawSets,
      )

      return {
        muscleGroup: group,
        completedSets: floor0(progress.completedSets),
        targetSets,
        percentage: round1(percentage),
        lastTrained: progress.lastTrained?.toISOString() || null,
        subMuscles,
        exerciseContributions,
      }
    },
  )

  const totalPercentage = muscleProgressArray.reduce((sum, m) => sum + m.percentage, 0)
  const overallPercentage = round1(totalPercentage / trackedMuscleGroups.length)

  return {
    overallPercentage,
    totalSets,
    muscleProgress: muscleProgressArray,
  }
}

