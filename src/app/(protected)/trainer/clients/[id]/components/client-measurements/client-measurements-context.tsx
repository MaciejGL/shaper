'use client'

import { ReactNode, createContext, useContext, useMemo } from 'react'

// Copy the utility hook from hypro progress to use here
import { useBodyMeasurements } from '@/app/(protected)/fitspace/progress/components/use-body-measurements'
import { GQLClientBodyMeasuresQuery } from '@/generated/graphql-client'

// Match the exact interface expected by hypro components
interface ClientMeasurementsContextType {
  bodyMeasures: GQLClientBodyMeasuresQuery['clientBodyMeasures']
  isLoading: boolean
  onMeasurementAdded: () => void
  getLatestMeasurement: ReturnType<
    typeof useBodyMeasurements
  >['getLatestMeasurement']
  getTrend: ReturnType<typeof useBodyMeasurements>['getTrend']
  fieldHasHistoricalData: ReturnType<
    typeof useBodyMeasurements
  >['fieldHasHistoricalData']
  measurementsByMonth: ReturnType<
    typeof useBodyMeasurements
  >['measurementsByMonth']
}

const ClientMeasurementsContext = createContext<
  ClientMeasurementsContextType | undefined
>(undefined)

interface ClientMeasurementsProviderProps {
  children: ReactNode
  measurements: GQLClientBodyMeasuresQuery['clientBodyMeasures']
}

export function ClientMeasurementsProvider({
  children,
  measurements,
}: ClientMeasurementsProviderProps) {
  const {
    getLatestMeasurement,
    getTrend,
    fieldHasHistoricalData,
    measurementsByMonth,
  } = useBodyMeasurements(measurements)

  const contextValue = useMemo(
    () => ({
      bodyMeasures: measurements, // Rename to match hypro interface
      isLoading: false, // Not loading since we already have the data
      onMeasurementAdded: () => {}, // No-op for trainer view
      getLatestMeasurement,
      getTrend,
      fieldHasHistoricalData,
      measurementsByMonth,
    }),
    [
      measurements,
      getLatestMeasurement,
      getTrend,
      fieldHasHistoricalData,
      measurementsByMonth,
    ],
  )

  return (
    <ClientMeasurementsContext.Provider value={contextValue}>
      {children}
    </ClientMeasurementsContext.Provider>
  )
}

export function useBodyMeasurementsContext() {
  const context = useContext(ClientMeasurementsContext)
  if (context === undefined) {
    throw new Error(
      'useBodyMeasurementsContext must be used within a ClientMeasurementsProvider',
    )
  }
  return context
}
