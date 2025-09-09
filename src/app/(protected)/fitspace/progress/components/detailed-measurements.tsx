import { useCircumferenceConversion } from '@/hooks/use-circumference-conversion'
import { useDynamicUnitResolver } from '@/hooks/use-dynamic-unit-resolver'
import { useWeightConversion } from '@/hooks/use-weight-conversion'

import { useBodyMeasurementsContext } from './body-measurements-context'
import { MeasurementCategoryDrawer } from './measurement-category-drawer'
import { measurementCategories } from './measurement-constants'
import { StatCard } from './stat-card'

export function DetailedMeasurements() {
  const {
    bodyMeasures,
    getLatestMeasurement,
    getTrend,
    onMeasurementAdded,
    isLoading,
  } = useBodyMeasurementsContext()
  const { toDisplayWeight, weightUnit } = useWeightConversion()
  const { toDisplayCircumference, circumferenceUnit } =
    useCircumferenceConversion()
  const { resolveUnit } = useDynamicUnitResolver()

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

  return measurementCategories.slice(1).map((category) => {
    return (
      <div key={category.id}>
        <div className="font-semibold">{category.title}</div>

        <div className="pt-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {category.fields.map((field) => {
              // Get all measurements that have data for this specific field
              const fieldMeasurements = bodyMeasures.filter(
                (measurement) =>
                  measurement[field.key] !== null &&
                  measurement[field.key] !== undefined,
              )

              // Only make clickable if there are actual measurements for this field
              const hasFieldData = fieldMeasurements.length > 0

              // If field has data, make it clickable with drawer
              if (hasFieldData) {
                return (
                  <MeasurementCategoryDrawer
                    key={field.key}
                    category={category}
                    measurements={fieldMeasurements}
                    onUpdate={onMeasurementAdded}
                    focusField={field.key}
                  >
                    <button className="text-left">
                      <StatCard
                        label={field.label}
                        value={
                          field.key === 'weight'
                            ? toDisplayWeight(
                                getLatestMeasurement(field.key),
                              ) || undefined
                            : circumferenceFields.includes(field.key)
                              ? toDisplayCircumference(
                                  getLatestMeasurement(field.key),
                                ) || undefined
                              : getLatestMeasurement(field.key)
                        }
                        unit={
                          field.key === 'weight'
                            ? weightUnit
                            : circumferenceFields.includes(field.key)
                              ? circumferenceUnit
                              : field.unit
                        }
                        trend={getTrend(field.key)}
                        isLoading={isLoading}
                      />
                    </button>
                  </MeasurementCategoryDrawer>
                )
              }

              // If no data for this field, show non-clickable StatCard
              return (
                <StatCard
                  key={field.key}
                  label={field.label}
                  value={getLatestMeasurement(field.key)}
                  unit={resolveUnit(field.key, field.unit)}
                  trend={getTrend(field.key)}
                  isLoading={isLoading}
                />
              )
            })}
          </div>
        </div>
      </div>
    )
  })
}
