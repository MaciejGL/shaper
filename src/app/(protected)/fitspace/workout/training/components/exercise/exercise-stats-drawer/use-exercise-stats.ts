'use client'

import { formatDistanceToNowStrict } from 'date-fns'
import { useMemo } from 'react'

import type { RepMaxConfidence, TimePeriod } from './types'
import {
  buildOneRmSeriesKg,
  buildRepMaxSuggestionsKg,
  buildWeeklyVolumeSeriesKg,
  calculatePercentChange,
  deriveLatestSessionAvg1RMKg,
} from './utils'

export function useExerciseStats({
  exercise,
  timePeriod,
  toDisplayWeight,
  weightUnit,
}: {
  exercise:
    | {
        estimated1RMProgress?:
          | {
              date: string
              detailedLogs: { estimated1RM: number }[]
            }[]
          | null
        totalVolumeProgress?:
          | {
              week: string
              totalVolume: number
              totalSets: number
            }[]
          | null
        lastPerformed?: string | null
      }
    | null
    | undefined
  timePeriod: TimePeriod
  toDisplayWeight: (weightKg: number | null | undefined) => number | null
  weightUnit: 'kg' | 'lbs'
}): {
  currentOneRM: number
  oneRmChangePercent: number
  oneRmSeries: { label: string; oneRM: number; timestamp: number }[]

  lastWeekVolume: number
  weekOverWeekChangePercent: number
  volumeSeries: { label: string; volume: number; sets: number; timestamp: number }[]

  latestOneRMKg: number | null
  repMaxSuggestions: {
    reps: number
    percentOf1RM: number
    displayWeight: number
    confidence: RepMaxConfidence
  }[]

  lastPerformedLabel: string | null
} {
  const oneRmSeriesKg = useMemo(
    () => buildOneRmSeriesKg(exercise?.estimated1RMProgress, timePeriod),
    [exercise?.estimated1RMProgress, timePeriod],
  )

  const oneRmSeries = useMemo(() => {
    return oneRmSeriesKg.map((p) => ({
      label: p.label,
      oneRM: toDisplayWeight(p.oneRMKg) ?? 0,
      timestamp: p.timestamp,
    }))
  }, [oneRmSeriesKg, toDisplayWeight])

  const currentOneRM = oneRmSeries.length
    ? oneRmSeries[oneRmSeries.length - 1].oneRM
    : 0

  const oneRmChangePercent = useMemo(() => {
    const points = oneRmSeries.map((p) => ({ value: p.oneRM }))
    return calculatePercentChange(points)
  }, [oneRmSeries])

  const volumeSeriesKg = useMemo(
    () => buildWeeklyVolumeSeriesKg(exercise?.totalVolumeProgress, timePeriod),
    [exercise?.totalVolumeProgress, timePeriod],
  )

  const volumeSeries = useMemo(() => {
    return volumeSeriesKg.map((p) => ({
      label: p.label,
      volume: toDisplayWeight(p.volumeKg) ?? 0,
      sets: p.sets,
      timestamp: p.timestamp,
    }))
  }, [toDisplayWeight, volumeSeriesKg])

  const lastWeekVolume = volumeSeries.length
    ? volumeSeries[volumeSeries.length - 1].volume
    : 0
  const prevWeekVolume =
    volumeSeries.length >= 2 ? volumeSeries[volumeSeries.length - 2].volume : 0
  const weekOverWeekChangePercent =
    prevWeekVolume > 0
      ? ((lastWeekVolume - prevWeekVolume) / prevWeekVolume) * 100
      : 0

  const latestOneRMKg = useMemo(
    () => deriveLatestSessionAvg1RMKg(exercise?.estimated1RMProgress),
    [exercise?.estimated1RMProgress],
  )

  const repMaxSuggestions = useMemo(() => {
    const base = latestOneRMKg ?? 0
    return buildRepMaxSuggestionsKg(base).map((row) => {
      const display = toDisplayWeight(row.weightKg) ?? 0
      return {
        reps: row.reps,
        percentOf1RM: row.percentOf1RM,
        displayWeight: display,
        confidence: row.confidence,
      }
    })
  }, [latestOneRMKg, toDisplayWeight])

  const lastPerformed = exercise?.lastPerformed ?? null
  const lastPerformedLabel = useMemo(() => {
    if (!lastPerformed) return null
    const date = new Date(lastPerformed)
    if (Number.isNaN(date.getTime())) return null
    return formatDistanceToNowStrict(date, { addSuffix: true })
  }, [lastPerformed])

  return {
    currentOneRM,
    oneRmChangePercent,
    oneRmSeries,
    lastWeekVolume,
    weekOverWeekChangePercent,
    volumeSeries,
    latestOneRMKg,
    repMaxSuggestions,
    lastPerformedLabel,
  }
}

