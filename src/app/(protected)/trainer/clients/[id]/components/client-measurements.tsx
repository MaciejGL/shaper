'use client'

import { Scale } from 'lucide-react'

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
        <h2 className="text-2xl font-semibold">Body Measurements</h2>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Body Measurements</h2>
        <Card>
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

  if (measurements.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Body Measurements</h2>
        </div>
        <ClientMeasurementsEmptyState clientName={clientName} />
      </div>
    )
  }

  return (
    <div className="space-y-6 @container/client-measurements">
      <h2 className="text-2xl font-semibold">Measurements Logs</h2>
      <div className="grid grid-cols-1 @[1000px]/client-measurements:grid-cols-2 gap-6">
        <ClientMeasurementsProvider measurements={measurements}>
          <ClientMeasurementsContent />
        </ClientMeasurementsProvider>

        {/* Body Progress Snapshots */}
        <ClientBodyProgressLogs clientId={client.id} clientName={clientName} />
      </div>
    </div>
  )
}

function ClientMeasurementsEmptyState({ clientName }: { clientName: string }) {
  return (
    <Card borderless>
      <CardContent className="pt-6">
        <div className="text-center py-8">
          <Scale className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Measurements Yet</h3>
          <p className="text-muted-foreground mb-4">
            {clientName} hasn't logged any body measurements since you started
            working together.
          </p>
          <p className="text-sm text-muted-foreground">
            Encourage them to start tracking their measurements in the Fitspace
            app to monitor progress.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export { ClientMeasurementsEmptyState }
