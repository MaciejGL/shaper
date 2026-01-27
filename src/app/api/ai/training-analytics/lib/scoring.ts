import type { MuscleProgressData, RecoveryItem } from './types'

export function calculateTrendPercent(params: {
  currentTotalSets: number
  previousWeekTotals: number[]
}): number {
  const weeksWithData = params.previousWeekTotals.filter((t) => t > 0).length
  const monthlyAverage =
    weeksWithData > 0
      ? params.previousWeekTotals.reduce((a, b) => a + b, 0) / weeksWithData
      : 0

  if (monthlyAverage < 10) return 0

  let trendPercent = Math.round(
    ((params.currentTotalSets - monthlyAverage) / monthlyAverage) * 100,
  )
  // Cap trends - don't show overly negative for incomplete weeks
  trendPercent = Math.max(-50, Math.min(200, trendPercent))
  return trendPercent
}

export function calculateStrongAndNeedsWork(params: {
  muscleData: MuscleProgressData[]
  recovery: RecoveryItem[]
}): { strong: string[]; needsWork: string[] } {
  const recoveryMap = new Map(
    params.recovery.map((r) => [r.muscle, r.percentRecovered]),
  )

  // Strong: >= 80% of target
  const strong = params.muscleData
    .filter((m) => m.percentage >= 80)
    .map((m) => m.muscle)
    .slice(0, 3)

  // Needs work: < 50% of target AND fully recovered
  const needsWork = params.muscleData
    .filter((m) => {
      const percentRecovered = recoveryMap.get(m.muscle) ?? 100
      return m.percentage < 50 && percentRecovered >= 100
    })
    .map((m) => m.muscle)
    .slice(0, 4)

  return { strong, needsWork }
}

