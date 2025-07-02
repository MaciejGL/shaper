import { useBodyMeasurementsContext } from './body-measurements-context'
import { MeasurementCategoryDrawer } from './measurement-category-drawer'
import { measurementCategories } from './measurement-constants'
import { StatCard } from './stat-card'

export function DetailedMeasurements() {
  const { bodyMeasures, getLatestMeasurement, getTrend, onMeasurementAdded } =
    useBodyMeasurementsContext()

  if (bodyMeasures.length === 0) {
    return null
  }

  return measurementCategories.slice(1).map((category) => {
    return (
      <div key={category.id} className="px-2">
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
                        value={getLatestMeasurement(field.key)}
                        unit={field.unit}
                        trend={getTrend(field.key)}
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
                  unit={field.unit}
                  trend={getTrend(field.key)}
                />
              )
            })}
          </div>
        </div>
      </div>
    )
  })
}
