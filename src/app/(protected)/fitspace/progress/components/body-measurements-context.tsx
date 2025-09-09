'use client'

import { createContext, useCallback, useContext, useMemo } from 'react'

import { useUser } from '@/context/user-context'
import {
  GQLBodyMeasuresQuery,
  useBodyMeasuresQuery,
} from '@/generated/graphql-client'

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
  const { user } = useUser()

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
  } = useBodyMeasurements(bodyMeasures, user?.profile)

  const contextValue = useMemo(
    () => ({
      bodyMeasures,
      isLoading: isLoading,
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

  return (
    <BodyMeasurementsContext.Provider value={contextValue}>
      {children}
    </BodyMeasurementsContext.Provider>
  )
}
