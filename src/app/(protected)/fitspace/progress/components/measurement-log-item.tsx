import { Pencil } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { GQLBodyMeasuresQuery } from '@/generated/graphql-client'
import { useCircumferenceConversion } from '@/hooks/use-circumference-conversion'
import { useTimeFormatting } from '@/hooks/use-time-formatting'
import { useWeightConversion } from '@/hooks/use-weight-conversion'
import { cn } from '@/lib/utils'

import { AddMeasurementModal } from './add-measurement-modal'

interface MeasurementLogItemProps {
  measurement: GQLBodyMeasuresQuery['bodyMeasures'][0]
  onUpdate?: () => void
  relevantFields?: {
    key: keyof GQLBodyMeasuresQuery['bodyMeasures'][0]
    label: string
    unit: string
  }[]
}

export function MeasurementLogItem({
  measurement,
  onUpdate,
  relevantFields,
}: MeasurementLogItemProps) {
  const { toDisplayWeight, weightUnit } = useWeightConversion()
  const { toDisplayCircumference, circumferenceUnit } =
    useCircumferenceConversion()
  const { formatDateTime } = useTimeFormatting()

  // List of circumference measurement fields
  const circumferenceFields = [
    'chest',
    'waist',
    'hips',
    'neck',
    'bicepsLeft',
    'bicepsRight',
    'thighLeft',
    'thighRight',
    'calfLeft',
    'calfRight',
  ]
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
  const formattedDate = formatDateTime(date, { includeDay: true })

  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 last-of-type:rounded-b-lg first-of-type:rounded-t-lg border  not-last-of-type:border-b-0 border-border bg-card',
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
                  {field.key === 'weight' && measurement[field.key]
                    ? `${toDisplayWeight(measurement[field.key] as number)?.toFixed(1)} ${weightUnit}`
                    : circumferenceFields.includes(field.key) &&
                        measurement[field.key]
                      ? `${toDisplayCircumference(measurement[field.key] as number)?.toFixed(1)} ${circumferenceUnit}`
                      : `${measurement[field.key]}${field.unit}`}
                </span>
              </div>
            ))}
            {measurement.notes && (
              <div className="bg-muted rounded-md p-2 pt-2 text-xs text-muted-foreground whitespace-pre-wrap">
                {measurement.notes}
              </div>
            )}
          </div>
        )}
      </div>
      {onUpdate && (
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
      )}
    </div>
  )
}
