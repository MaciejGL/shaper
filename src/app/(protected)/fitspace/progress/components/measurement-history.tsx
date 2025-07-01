import { Calendar } from 'lucide-react'

import { CardTitle } from '@/components/ui/card'
import { GQLBodyMeasuresQuery } from '@/generated/graphql-client'

import { MeasurementLogItem } from './measurement-log-item'
import { useBodyMeasurements } from './use-body-measurements'

interface MeasurementHistoryProps {
  bodyMeasures: GQLBodyMeasuresQuery['bodyMeasures']
  onMeasurementAdded: () => void
}

export function MeasurementHistory({
  bodyMeasures,
  onMeasurementAdded,
}: MeasurementHistoryProps) {
  const { measurementsByMonth } = useBodyMeasurements(bodyMeasures)

  if (bodyMeasures.length === 0) {
    return null
  }

  return (
    <div className="mt-10">
      <div className="px-2">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Measurement History
        </CardTitle>
      </div>
      <div className="px-2">
        <div className="space-y-6 pt-6">
          {measurementsByMonth.map(({ month, measurements }) => (
            <div key={month}>
              <h3 className="font-semibold text-lg mb-3">{month}</h3>
              {measurements.map((measurement) => (
                <MeasurementLogItem
                  key={measurement.id}
                  measurement={measurement}
                  onUpdate={onMeasurementAdded}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
