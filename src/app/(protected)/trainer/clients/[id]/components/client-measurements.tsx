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

  return (
    <div className="grid grid-cols-1 @3xl/client-detail-page:grid-cols-[3fr_minmax(400px,2fr)] gap-6">
      {/* Left Column: Main Content */}
      <div className="space-y-6">
        <ClientMeasurementsProvider measurements={measurements}>
          <ClientMeasurementsContent clientName={clientName} />
        </ClientMeasurementsProvider>
      </div>

      {/* Right Column: Stats & Progress */}
      <div className="space-y-6">
        <ClientBodyProgressLogs clientId={client.id} clientName={clientName} />
      </div>
    </div>
  )
}
