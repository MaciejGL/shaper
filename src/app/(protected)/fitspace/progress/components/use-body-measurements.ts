import { format } from 'date-fns'
import { differenceInYears } from 'date-fns'
import { useMemo } from 'react'

import { GQLBodyMeasuresQuery } from '@/generated/graphql-client'
import {
  getBestBodyFatEstimate,
  getBodyFatCategory,
} from '@/lib/body-composition'

import { MeasurementField } from './measurement-constants'

export function useBodyMeasurements(
  bodyMeasures: GQLBodyMeasuresQuery['bodyMeasures'],
  userProfile?: {
    height?: number | null
    weight?: number | null
    sex?: string | null
    birthday?: string | null
  } | null,
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

  // Get estimated body fat percentage based on available measurements
  const getEstimatedBodyFat = () => {
    if (!userProfile) return null

    const latestMeasurement = bodyMeasures[0] // Most recent measurement

    // If user has manually entered body fat, use that instead
    if (latestMeasurement?.bodyFat) {
      return {
        percentage: latestMeasurement.bodyFat,
        method: 'Manual Entry',
        confidence: 'high' as const,
        isEstimated: false,
        category: getBodyFatCategory(
          latestMeasurement.bodyFat,
          (userProfile.sex as 'male' | 'female') || 'male',
        ),
      }
    }

    // Calculate age from birthday
    const age = userProfile.birthday
      ? differenceInYears(new Date(), new Date(userProfile.birthday))
      : 0

    // Use the latest measurement data combined with profile data
    const weight = getLatestMeasurement('weight') || userProfile.weight || 0
    const height = userProfile.height || 0
    const waist = getLatestMeasurement('waist') || 0
    const neck = getLatestMeasurement('neck') || 0
    const hips = getLatestMeasurement('hips') || 0
    const sex = (userProfile.sex as 'male' | 'female') || 'male'

    // Ensure we have minimum required data
    if (!weight || !height || !age || !sex) return null

    const estimation = getBestBodyFatEstimate({
      weight,
      height,
      age,
      sex,
      waist: waist || undefined,
      neck: neck || undefined,
      hips: hips || undefined,
    })

    if (estimation.percentage === 0) return null

    return {
      percentage: estimation.percentage,
      method: estimation.method,
      confidence: estimation.confidence,
      isEstimated: true,
      category: getBodyFatCategory(estimation.percentage, sex),
      missingMeasurements: estimation.missingMeasurements,
    }
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
    getEstimatedBodyFat,
    categoryHasData,
    fieldHasHistoricalData,
    getFieldMeasurements,
    measurementsByMonth,
  }
}
