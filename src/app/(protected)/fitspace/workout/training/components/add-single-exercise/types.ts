import type { HighLevelGroup } from '@/config/muscles'

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
