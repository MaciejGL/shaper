import { differenceInDays } from 'date-fns'
import { useMemo } from 'react'

import { useBodyMeasurementsContext } from '../body-measurements-context'
import { useBodyProgressLogs } from '../body-progress/use-body-progress-logs'

interface SnapshotWithWeight {
  id: string
  date: string
  weight?: number
  bodyFat?: number
  image1Url?: string | null
  image2Url?: string | null
  image3Url?: string | null
}

export function useSnapshots() {
  const { progressLogs, isLoading: progressLogsLoading } = useBodyProgressLogs()
  const { bodyMeasures, isLoading: measurementsLoading } =
    useBodyMeasurementsContext()

  const snapshotsWithWeight = useMemo(() => {
    if (!progressLogs.length || !bodyMeasures.length) {
      return {
        latestSnapshot: null,
        previousSnapshot: null,
        isLoading: progressLogsLoading || measurementsLoading,
        error: null,
      }
    }

    // Sort progress logs by date (most recent first)
    const sortedLogs = [...progressLogs].sort(
      (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime(),
    )

    // Find weight measurements within ±5 days of each snapshot
    const findWeightForSnapshot = (
      snapshotDate: string,
    ): number | undefined => {
      // Find the closest weight measurement within 5 days
      let closestWeight: number | undefined
      let closestDistance = Infinity

      for (const measurement of bodyMeasures) {
        if (measurement.weight === null || measurement.weight === undefined)
          continue

        const distance = Math.abs(
          differenceInDays(
            new Date(snapshotDate),
            new Date(measurement.measuredAt),
          ),
        )

        if (distance <= 5 && distance < closestDistance) {
          closestWeight = measurement.weight
          closestDistance = distance
        }
      }

      return closestWeight
    }

    // Get latest snapshot with weight
    const latestLog = sortedLogs[0]
    const latestWeight = findWeightForSnapshot(latestLog.loggedAt)

    const latestSnapshot: SnapshotWithWeight | null = latestLog
      ? {
          id: latestLog.id,
          date: latestLog.loggedAt,
          weight: latestWeight,
          image1Url: latestLog.image1?.url,
          image2Url: latestLog.image2?.url,
          image3Url: latestLog.image3?.url,
        }
      : null

    // Get previous snapshot with weight (second most recent)
    const previousLog = sortedLogs[1]
    const previousWeight = findWeightForSnapshot(previousLog?.loggedAt || '')

    const previousSnapshot: SnapshotWithWeight | null = previousLog
      ? {
          id: previousLog.id,
          date: previousLog.loggedAt,
          weight: previousWeight,
          image1Url: previousLog.image1?.url,
          image2Url: previousLog.image2?.url,
          image3Url: previousLog.image3?.url,
        }
      : null

    return {
      latestSnapshot,
      previousSnapshot,
      progressLogs,
      isLoading: progressLogsLoading || measurementsLoading,
      error: null,
    }
  }, [progressLogs, bodyMeasures, progressLogsLoading, measurementsLoading])

  return snapshotsWithWeight
}
