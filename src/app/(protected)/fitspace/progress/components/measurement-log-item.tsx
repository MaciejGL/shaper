import { format } from 'date-fns'
import { Pencil } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { GQLBodyMeasuresQuery } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { AddMeasurementModal } from './add-measurement-modal'

interface MeasurementLogItemProps {
  measurement: GQLBodyMeasuresQuery['bodyMeasures'][0]
  onUpdate: () => void
  relevantFields?: {
    key: keyof GQLBodyMeasuresQuery['bodyMeasures'][0]
    label: string
    unit: string
  }[]
  isOnCard?: boolean
}

export function MeasurementLogItem({
  measurement,
  onUpdate,
  relevantFields,
  isOnCard = false,
}: MeasurementLogItemProps) {
  // Count non-null measurements
  const measurementCount = [
    measurement.weight,
    measurement.bodyFat,
    measurement.chest,
    measurement.waist,
    measurement.hips,
    measurement.neck,
    measurement.bicepsLeft,
    measurement.bicepsRight,
    measurement.thighLeft,
    measurement.thighRight,
    measurement.calfLeft,
    measurement.calfRight,
  ].filter((value) => value !== null && value !== undefined).length

  const measurementText =
    measurementCount === 1
      ? '1 measurement'
      : `${measurementCount} measurements`
  const date = new Date(measurement.measuredAt)
  const formattedDate = format(date, 'eee, d MMM')

  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 last-of-type:rounded-b-lg first-of-type:rounded-t-lg not-last-of-type:border-b border-border bg-card',
        isOnCard && 'bg-card-on-card border-muted-foreground/20',
      )}
    >
      <div className="flex-1">
        {!relevantFields && (
          <p className="text-sm font-medium">{measurementText}</p>
        )}
        <p className="text-xs text-muted-foreground">{formattedDate}</p>
        {relevantFields && (
          <div className="mt-2 space-y-1">
            {relevantFields.map((field) => (
              <div key={field.key} className="flex items-center gap-2">
                <span className="text-sm">{field.label}:</span>{' '}
                <span className="font-medium text-sm">
                  {measurement[field.key]}
                  {field.unit}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <AddMeasurementModal measurement={measurement} onSuccess={onUpdate}>
        <Button
          variant="secondary"
          size="sm"
          iconOnly={<Pencil />}
          className={cn(relevantFields && 'self-start')}
        >
          Edit
        </Button>
      </AddMeasurementModal>
    </div>
  )
}
