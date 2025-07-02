import { format } from 'date-fns'
import { useMemo } from 'react'

import { GQLBodyMeasuresQuery } from '@/generated/graphql-client'

import { MeasurementField } from './measurement-constants'

export function useBodyMeasurements(
  bodyMeasures: GQLBodyMeasuresQuery['bodyMeasures'],
) {
  // Get the most recent non-null value for each measurement type
  const getLatestMeasurement = (
    field: MeasurementField,
  ): number | undefined => {
    for (const measurement of bodyMeasures) {
      const value = measurement[field]
      if (typeof value === 'number') {
        return value
      }
    }
    return undefined
  }

  // Calculate trends for each measurement by comparing the two most recent values
  const getTrend = (field: MeasurementField) => {
    const recentValues = bodyMeasures
      .map((measurement) => measurement[field])
      .filter((value) => value !== null && value !== undefined)

    if (recentValues.length < 2) return null
    return (recentValues[0] as number) - (recentValues[1] as number)
  }

  // Check if a category has any data
  const categoryHasData = (
    categoryFields: readonly { key: MeasurementField }[],
  ) => {
    return categoryFields.some(
      (field) => getLatestMeasurement(field.key) !== undefined,
    )
  }

  // Check if a specific field has historical data (multiple measurements)
  // This determines if the field should be clickable in the UI
  const fieldHasHistoricalData = (field: MeasurementField): boolean => {
    const fieldValues = bodyMeasures
      .map((measurement) => measurement[field])
      .filter((value) => value !== null && value !== undefined)

    // Require at least 2 measurements to consider it "historical data" worth viewing
    return fieldValues.length >= 2
  }

  // Get all measurements for a specific field (for drawer content)
  const getFieldMeasurements = (field: MeasurementField) => {
    return bodyMeasures.filter(
      (measurement) =>
        measurement[field] !== null && measurement[field] !== undefined,
    )
  }

  // Group measurements by month for history
  const measurementsByMonth = useMemo(() => {
    const grouped: Record<string, typeof bodyMeasures> = {}

    bodyMeasures.forEach((measurement) => {
      const monthKey = format(new Date(measurement.measuredAt), 'MMMM yyyy')
      if (!grouped[monthKey]) {
        grouped[monthKey] = []
      }
      grouped[monthKey].push(measurement)
    })

    return Object.entries(grouped).map(([month, measurements]) => ({
      month,
      measurements: measurements.sort(
        (a, b) =>
          new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime(),
      ),
    }))
  }, [bodyMeasures])

  return {
    getLatestMeasurement,
    getTrend,
    categoryHasData,
    fieldHasHistoricalData,
    getFieldMeasurements,
    measurementsByMonth,
  }
}
