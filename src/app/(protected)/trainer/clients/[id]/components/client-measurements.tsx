'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useClientBodyMeasuresQuery } from '@/generated/graphql-client'

import { ClientBodyProgressLogs } from './client-measurements/client-body-progress-logs'
import { ClientMeasurementsContent } from './client-measurements/client-measurements-content'
import { ClientMeasurementsProvider } from './client-measurements/client-measurements-context'

interface ClientMeasurementsProps {
  client: {
    id: string
    firstName?: string | null
    lastName?: string | null
  }
  clientName: string
}

export function ClientMeasurements({
  client,
  clientName,
}: ClientMeasurementsProps) {
  const { data, isLoading, error } = useClientBodyMeasuresQuery({
    clientId: client.id,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card borderless>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-red-600">Error loading measurements</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const measurements = data?.clientBodyMeasures || []

  return (
    <div className="space-y-6 @container/client-measurements">
      <div className="grid grid-cols-1 @[1000px]/client-measurements:grid-cols-2 gap-6">
        <ClientMeasurementsProvider measurements={measurements}>
          <ClientMeasurementsContent clientName={clientName} />
        </ClientMeasurementsProvider>

        {/* Body Progress Snapshots */}
        <ClientBodyProgressLogs clientId={client.id} clientName={clientName} />
      </div>
    </div>
  )
}
