export interface MuscleProgressData {
  muscle: string
  completedSets: number
  targetSets: number
  percentage: number
}

export interface RecentRecoveryInput {
  muscle: string
  lastTrained: Date | null
  effectiveSetsForTarget: number
}

export interface RecoveryItem {
  muscle: string
  hours: number
  targetHours: number
  percentRecovered: number
}

export interface TrainingAnalyticsResponse {
  totalSets: number
  trendPercent: number
  strong: string[]
  needsWork: string[]
  insight: string | null
  status: 'empty' | 'normal' | 'crushing_it'
  recovery: RecoveryItem[]
}

