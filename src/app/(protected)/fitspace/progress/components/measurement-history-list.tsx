import { GQLBodyMeasuresQuery } from '@/generated/graphql-client'

import {
  MeasurementField,
  measurementCategories,
} from './measurement-constants'
import { MeasurementLogItem } from './measurement-log-item'
import { useBodyMeasurements } from './use-body-measurements'

interface MeasurementHistoryListProps {
  measurements: GQLBodyMeasuresQuery['bodyMeasures']
  onUpdate: () => void
  focusField?: MeasurementField // If provided, show only this field's data
  maxMonths?: number // Limit number of months to display
  isOnCard?: boolean
}

export function MeasurementHistoryList({
  measurements,
  onUpdate,
  focusField,
  maxMonths,
  isOnCard = false,
}: MeasurementHistoryListProps) {
  const { measurementsByMonth } = useBodyMeasurements(measurements)

  const monthsToShow = maxMonths
    ? measurementsByMonth.slice(0, maxMonths)
    : measurementsByMonth

  // Helper function to get field info from measurement constants
  const getFieldInfo = (fieldKey: MeasurementField) => {
    for (const category of measurementCategories) {
      const field = category.fields.find((f) => f.key === fieldKey)
      if (field) return field
    }
    return null
  }

  return (
    <div className="space-y-4">
      {monthsToShow.map(({ month, measurements: monthMeasurements }) => (
        <div key={month}>
          <h4 className="font-semibold text-base mb-2">{month}</h4>
          <div className="space-y-0">
            {monthMeasurements.map((measurement) => {
              // If focusing on specific field, filter measurements
              if (focusField) {
                const hasFieldData =
                  measurement[focusField] !== null &&
                  measurement[focusField] !== undefined
                if (!hasFieldData) return null
              }

              // If we have a focus field, pass only that field to MeasurementLogItem
              const relevantFields = focusField
                ? (() => {
                    const fieldInfo = getFieldInfo(focusField)
                    return fieldInfo
                      ? [
                          {
                            key: focusField,
                            label: fieldInfo.label,
                            unit: fieldInfo.unit,
                          },
                        ]
                      : undefined
                  })()
                : undefined

              return (
                <MeasurementLogItem
                  key={measurement.id}
                  measurement={measurement}
                  onUpdate={onUpdate}
                  relevantFields={relevantFields}
                  isOnCard={isOnCard}
                />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
