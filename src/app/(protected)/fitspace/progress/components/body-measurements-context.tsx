'use client'

import { createContext, useCallback, useContext, useMemo } from 'react'

import { Loader } from '@/components/loader'
import {
  GQLBodyMeasuresQuery,
  useBodyMeasuresQuery,
  useProfileQuery,
} from '@/generated/graphql-client'

import { MeasurementsEmptyState } from './measurements-empty-state'
import { useBodyMeasurements } from './use-body-measurements'

// Context for body measurements data and operations
interface BodyMeasurementsContextType {
  bodyMeasures: GQLBodyMeasuresQuery['bodyMeasures']
  isLoading: boolean
  onMeasurementAdded: () => void
  // Expose commonly used functions from useBodyMeasurements hook
  getLatestMeasurement: ReturnType<
    typeof useBodyMeasurements
  >['getLatestMeasurement']
  getTrend: ReturnType<typeof useBodyMeasurements>['getTrend']
  getEstimatedBodyFat: ReturnType<
    typeof useBodyMeasurements
  >['getEstimatedBodyFat']
  fieldHasHistoricalData: ReturnType<
    typeof useBodyMeasurements
  >['fieldHasHistoricalData']
  measurementsByMonth: ReturnType<
    typeof useBodyMeasurements
  >['measurementsByMonth']
}

const BodyMeasurementsContext =
  createContext<BodyMeasurementsContextType | null>(null)

export function useBodyMeasurementsContext() {
  const context = useContext(BodyMeasurementsContext)
  if (!context) {
    throw new Error(
      'useBodyMeasurementsContext must be used within BodyMeasurementsProvider',
    )
  }
  return context
}

interface BodyMeasurementsProviderProps {
  children: React.ReactNode
}

export function BodyMeasurementsProvider({
  children,
}: BodyMeasurementsProviderProps) {
  const { data, refetch, isLoading } = useBodyMeasuresQuery()
  const { data: profileData } = useProfileQuery()

  const bodyMeasures = useMemo(
    () => data?.bodyMeasures || [],
    [data?.bodyMeasures],
  )

  const handleMeasurementAdded = useCallback(() => {
    refetch()
  }, [refetch])

  // Get utility functions from the hook, now with profile data
  const {
    getLatestMeasurement,
    getTrend,
    getEstimatedBodyFat,
    fieldHasHistoricalData,
    measurementsByMonth,
  } = useBodyMeasurements(bodyMeasures, profileData?.profile)

  const contextValue = useMemo(
    () => ({
      bodyMeasures,
      isLoading,
      onMeasurementAdded: handleMeasurementAdded,
      getLatestMeasurement,
      getTrend,
      getEstimatedBodyFat,
      fieldHasHistoricalData,
      measurementsByMonth,
    }),
    [
      bodyMeasures,
      isLoading,
      getLatestMeasurement,
      getTrend,
      getEstimatedBodyFat,
      fieldHasHistoricalData,
      measurementsByMonth,
      handleMeasurementAdded,
    ],
  )

  // Handle loading and empty states at the provider level
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader />
      </div>
    )
  }

  if (bodyMeasures.length === 0) {
    return (
      <MeasurementsEmptyState onMeasurementAdded={handleMeasurementAdded} />
    )
  }

  return (
    <BodyMeasurementsContext.Provider value={contextValue}>
      {children}
    </BodyMeasurementsContext.Provider>
  )
}
