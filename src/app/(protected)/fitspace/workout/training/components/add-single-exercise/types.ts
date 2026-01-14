import type { HighLevelGroup } from '@/config/muscles'
import type { GQLFitspaceGetExercisesQuery } from '@/generated/graphql-client'

export interface WeeklyGroupSummary {
  groupId: HighLevelGroup
  label: string
  setsDone: number
  setsGoal: number
}

export interface AddedExerciseInfo {
  trainingExerciseId: string
  hasLogs: boolean
}

export type ExerciseListExercise = NonNullable<
  NonNullable<GQLFitspaceGetExercisesQuery['getExercises']>['publicExercises']
>[number]
