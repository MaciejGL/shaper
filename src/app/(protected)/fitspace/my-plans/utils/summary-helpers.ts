import { differenceInDays, differenceInWeeks, format, getYear } from 'date-fns'

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
  const startDateObj = new Date(startDate)
  const endDateObj = endDate ? new Date(endDate) : null

  if (endDateObj && getYear(startDateObj) === getYear(endDateObj)) {
    const start = format(startDateObj, 'd MMM')
    const end = format(endDateObj, 'd MMM yyyy')
    return `${start} - ${end}`
  }

  const start = format(startDateObj, 'd MMM yyyy')
  const end = endDateObj ? format(endDateObj, 'd MMM yyyy') : 'Present'

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
