export interface RecoveryData {
  muscle: string
  hours: number
  targetHours: number
  percentRecovered: number
}

export interface TrainingAnalytics {
  totalSets: number
  trendPercent: number
  strong: string[]
  needsWork: string[]
  insight: string | null
  status: 'empty' | 'normal' | 'crushing_it'
  recovery: RecoveryData[]
}
