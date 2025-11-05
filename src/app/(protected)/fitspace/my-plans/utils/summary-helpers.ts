import { differenceInDays, differenceInWeeks, format } from 'date-fns'

import type { GQLGetPlanSummaryQuery } from '@/generated/graphql-client'

type PlanSummary = GQLGetPlanSummaryQuery['getPlanSummary']

/**
 * Format duration for display
 */
export function formatDuration(startDate: string, endDate: string | null) {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : new Date()

  const weeks = differenceInWeeks(end, start)
  const days = differenceInDays(end, start)

  if (weeks === 0) {
    return `${days} day${days !== 1 ? 's' : ''}`
  }

  return `${weeks} week${weeks !== 1 ? 's' : ''}`
}

/**
 * Format date range for display
 */
export function formatDateRange(startDate: string, endDate: string | null) {
  const start = format(new Date(startDate), 'MMM d, yyyy')
  const end = endDate ? format(new Date(endDate), 'MMM d, yyyy') : 'Present'

  return `${start} - ${end}`
}

/**
 * Get top progressions sorted by improvement
 */
export function getTopProgressions(
  progressions: PlanSummary['strengthProgress'],
  limit: number = 5,
) {
  return progressions
    .filter((p) => p.improvementPercentage > 0)
    .sort((a, b) => b.improvementPercentage - a.improvementPercentage)
    .slice(0, limit)
}

/**
 * Get top personal records sorted by estimated 1RM
 */
export function getTopPersonalRecords(
  records: PlanSummary['personalRecords'],
  limit: number = 5,
) {
  return records
    .sort((a, b) => b.bestEstimated1RM - a.bestEstimated1RM)
    .slice(0, limit)
}

/**
 * Calculate improvement percentage
 */
export function calculateImprovementPercentage(start: number, end: number) {
  if (start === 0) return 0
  return ((end - start) / start) * 100
}

/**
 * Format weight for display
 */
export function formatWeight(
  weight: number | null | undefined,
  unit: string = 'kg',
) {
  if (weight == null) return '-'
  return `${weight.toFixed(1)} ${unit}`
}

/**
 * Format volume for display (shorten large numbers)
 */
export function formatVolume(volume: number) {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`
  }
  return volume.toFixed(0)
}

/**
 * Get adherence color class
 */
export function getAdherenceColor(adherence: number) {
  if (adherence >= 90) return 'text-green-600 dark:text-green-400'
  if (adherence >= 75) return 'text-yellow-600 dark:text-yellow-400'
  if (adherence >= 50) return 'text-orange-600 dark:text-orange-400'
  return 'text-orange-600 dark:text-orange-400'
}

/**
 * Get improvement color class
 */
export function getImprovementColor(improvement: number) {
  if (improvement > 0) return 'text-green-600 dark:text-green-400'
  if (improvement < 0) return 'text-red-600 dark:text-red-400'
  return 'text-muted-foreground'
}

/**
 * Generate shareable text summary
 */
export function generateShareableText(summary: PlanSummary, planTitle: string) {
  const duration = formatDuration(
    summary.duration.startDate,
    summary.duration.endDate || null,
  )
  const adherence = Math.round(summary.adherence)

  const topProgression = summary.strengthProgress[0]
  const topAchievement = topProgression
    ? `${topProgression.exerciseName}: +${topProgression.improvementPercentage.toFixed(1)}%`
    : ''

  return `🏋️ Training Complete: ${planTitle}
    
${duration} • ${adherence}% adherence

🏆 Top Achievement
${topAchievement}

💪 ${summary.workoutsCompleted} workouts completed
📈 ${summary.totalPRsAchieved} PRs achieved
🔥 ${formatVolume(summary.totalVolumeLifted)}kg total volume

#fitness #training #progress`
}

/**
 * Check if section should be shown
 */
export function shouldShowSection(
  section: 'strengthProgress' | 'bodyComposition' | 'personalRecords',
  summary: PlanSummary,
) {
  switch (section) {
    case 'strengthProgress':
      return summary.strengthProgress.length > 0
    case 'bodyComposition':
      return summary.bodyComposition !== null
    case 'personalRecords':
      return summary.personalRecords.length > 0
    default:
      return false
  }
}
