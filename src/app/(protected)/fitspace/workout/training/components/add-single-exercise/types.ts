import type { HighLevelGroup } from '@/constants/muscles'

export interface WeeklyGroupSummary {
  groupId: HighLevelGroup
  label: string
  setsDone: number
  setsGoal: number
}
