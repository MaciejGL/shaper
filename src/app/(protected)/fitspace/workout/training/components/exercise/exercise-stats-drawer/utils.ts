import { format } from 'date-fns'

import {
  OneRmPointKg,
  RepMaxConfidence,
  RepMaxSuggestionKg,
  TimePeriod,
  VolumePointKg,
} from './types'

function average(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function safeDate(value: string): Date | null {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function timePeriodCutoffMs(timePeriod: TimePeriod): number {
  const now = Date.now()
  switch (timePeriod) {
    case '1month':
      return now - 30 * 24 * 60 * 60 * 1000
    case '3months':
      return now - 90 * 24 * 60 * 60 * 1000
    case '6months':
      return now - 180 * 24 * 60 * 60 * 1000
    case '1year':
      return now - 365 * 24 * 60 * 60 * 1000
    case 'all':
      return 0
  }
}

export function deriveLatestSessionAvg1RMKg(
  estimated1RMProgress:
    | {
        date: string
        detailedLogs: { estimated1RM: number }[]
      }[]
    | null
    | undefined,
): number | null {
  const points = buildOneRmSeriesKg(estimated1RMProgress, 'all')
  if (points.length === 0) return null
  return points[points.length - 1].oneRMKg
}

export function buildOneRmSeriesKg(
  estimated1RMProgress:
    | {
        date: string
        detailedLogs: { estimated1RM: number }[]
      }[]
    | null
    | undefined,
  timePeriod: TimePeriod,
): OneRmPointKg[] {
  const cutoffMs = timePeriodCutoffMs(timePeriod)

  const rows = (estimated1RMProgress ?? [])
    .map((entry) => {
      const date = safeDate(entry.date)
      if (!date) return null

      const oneRms = entry.detailedLogs
        .map((l) => l.estimated1RM)
        .filter((v) => typeof v === 'number' && Number.isFinite(v) && v > 0)

      const avg = average(oneRms)
      if (avg <= 0) return null

      const timestamp = date.getTime()
      if (timestamp < cutoffMs) return null

      return {
        label: format(date, 'd MMM'),
        oneRMKg: avg,
        timestamp,
      } satisfies OneRmPointKg
    })
    .filter((v): v is OneRmPointKg => v !== null)
    .sort((a, b) => a.timestamp - b.timestamp)

  // Mobile-friendly: cap points
  return rows.slice(-15)
}

export function calculatePercentChange(points: { value: number }[]): number {
  if (points.length < 2) return 0
  const first = points[0].value
  const last = points[points.length - 1].value
  if (first <= 0 || last <= 0) return 0
  return ((last - first) / first) * 100
}

export function buildWeeklyVolumeSeriesKg(
  totalVolumeProgress:
    | {
        week: string
        totalVolume: number
        totalSets: number
      }[]
    | null
    | undefined,
  timePeriod: TimePeriod,
): VolumePointKg[] {
  const cutoffMs = timePeriodCutoffMs(timePeriod)

  const rows = (totalVolumeProgress ?? [])
    .map((entry) => {
      const date = safeDate(entry.week)
      if (!date) return null

      const volumeKg =
        typeof entry.totalVolume === 'number' && Number.isFinite(entry.totalVolume)
          ? entry.totalVolume
          : 0
      const sets =
        typeof entry.totalSets === 'number' && Number.isFinite(entry.totalSets)
          ? entry.totalSets
          : 0

      const timestamp = date.getTime()
      if (timestamp < cutoffMs) return null

      return {
        label: format(date, 'MMM d'),
        volumeKg: Math.max(0, volumeKg),
        sets: Math.max(0, Math.round(sets)),
        timestamp,
      } satisfies VolumePointKg
    })
    .filter((v): v is VolumePointKg => v !== null)
    .sort((a, b) => a.timestamp - b.timestamp)

  return rows.slice(-12)
}

/**
 * NSCA Training Load Chart - evidence-based %1RM table
 * Source: https://www.nsca.com/contentassets/61d813865e264c6e852cadfe247eae52/nsca_training_load_chart.pdf
 * 11RM is interpolated (NSCA lists 10RM and 12RM only)
 */
const NSCA_PERCENT_1RM: Record<number, number> = {
  1: 100,
  2: 95,
  3: 93,
  4: 90,
  5: 87,
  6: 85,
  7: 83,
  8: 80,
  9: 77,
  10: 75,
  11: 72.5,
  12: 70,
}

/**
 * Confidence levels based on rep range accuracy:
 * - High (3-8 reps): Best accuracy, validated across multiple studies
 * - Medium (1-2, 9-10 reps): Good accuracy but slightly more variable
 * - Low (11-12 reps): Less accurate, more individual variation
 */
function getRepMaxConfidence(reps: number): RepMaxConfidence {
  if (reps >= 3 && reps <= 8) return 'high'
  if (reps <= 2 || (reps >= 9 && reps <= 10)) return 'medium'
  return 'low'
}

export function buildRepMaxSuggestionsKg(
  oneRMKg: number,
): RepMaxSuggestionKg[] {
  if (!Number.isFinite(oneRMKg) || oneRMKg <= 0) return []

  const suggestions: RepMaxSuggestionKg[] = []
  for (let reps = 1; reps <= 12; reps++) {
    const percentOf1RM = NSCA_PERCENT_1RM[reps]
    const weightKg = oneRMKg * (percentOf1RM / 100)

    suggestions.push({
      reps,
      weightKg: Math.max(0, weightKg),
      percentOf1RM,
      confidence: getRepMaxConfidence(reps),
    })
  }

  return suggestions
}

export function roundDisplayWeight(
  displayWeight: number,
  unit: 'kg' | 'lbs',
): number {
  if (!Number.isFinite(displayWeight)) return 0
  const step = unit === 'lbs' ? 5 : 2.5
  return Math.round(displayWeight / step) * step
}

