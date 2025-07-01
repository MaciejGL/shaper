'use client'

import { useMemo } from 'react'

import { useBodyMeasuresQuery } from '@/generated/graphql-client'

import { DetailedMeasurements } from './detailed-measurements'
import { MeasurementHistory } from './measurement-history'
import { MeasurementsEmptyState } from './measurements-empty-state'
import { MeasurementsOverview } from './measurements-overview'
import { WeightProgressChart } from './weight-progress-chart'

export function BodyMeasurements() {
  const { data, refetch } = useBodyMeasuresQuery()
  const bodyMeasures = useMemo(
    () => data?.bodyMeasures || [],
    [data?.bodyMeasures],
  )

  const handleMeasurementAdded = () => {
    refetch()
  }

  // Show empty state when no measurements exist
  if (bodyMeasures.length === 0) {
    return (
      <MeasurementsEmptyState onMeasurementAdded={handleMeasurementAdded} />
    )
  }

  return (
    <div className="space-y-8">
      {/* Quick Stats Overview */}
      <MeasurementsOverview
        bodyMeasures={bodyMeasures}
        onMeasurementAdded={handleMeasurementAdded}
      />

      {/* Weight Progress Chart */}
      {bodyMeasures.length > 1 && <WeightProgressChart data={bodyMeasures} />}

      {/* Detailed Measurements by Category */}
      <DetailedMeasurements
        bodyMeasures={bodyMeasures}
        onMeasurementAdded={handleMeasurementAdded}
      />

      {/* Measurement History */}
      <MeasurementHistory
        bodyMeasures={bodyMeasures}
        onMeasurementAdded={handleMeasurementAdded}
      />
    </div>
  )
}
