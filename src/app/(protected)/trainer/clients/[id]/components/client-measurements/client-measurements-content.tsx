'use client'

import { MeasurementCategoryDrawer } from '@/app/(protected)/fitspace/progress/components/measurement-category-drawer'
import { MeasurementChart } from '@/app/(protected)/fitspace/progress/components/measurement-chart'
import { measurementCategories } from '@/app/(protected)/fitspace/progress/components/measurement-constants'
import { StatCard } from '@/app/(protected)/fitspace/progress/components/stat-card'

import { useBodyMeasurementsContext } from './client-measurements-context'

export function ClientMeasurementsContent() {
  const { bodyMeasures, getLatestMeasurement, getTrend } =
    useBodyMeasurementsContext()

  return (
    <div className="space-y-8">
      {/* Quick Stats Overview - Read-only for trainer */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MeasurementCategoryDrawer
            key={'weight'}
            category={measurementCategories[0]}
            measurements={bodyMeasures}
            focusField={'weight'}
            drawerDirection="right"
          >
            <button className="text-left">
              <StatCard
                label="Weight"
                value={getLatestMeasurement('weight')}
                unit="kg"
                trend={getTrend('weight')}
              />
            </button>
          </MeasurementCategoryDrawer>
          <MeasurementCategoryDrawer
            key={'bodyFat'}
            category={measurementCategories[1]}
            measurements={bodyMeasures}
            focusField={'bodyFat'}
            drawerDirection="right"
          >
            <button className="text-left">
              <StatCard
                label="Body Fat"
                value={getLatestMeasurement('bodyFat')}
                unit="%"
                trend={getTrend('bodyFat')}
              />
            </button>
          </MeasurementCategoryDrawer>
        </div>
      </div>

      {/* Weight Progress Chart */}
      {bodyMeasures.length > 1 && (
        <div className="space-y-4 max-w-lg">
          <h3 className="text-lg font-semibold">Weight Progress</h3>
          <MeasurementChart
            measurements={bodyMeasures}
            field="weight"
            label="Weight"
            unit="kg"
            className="h-full w-full min-h-0 bg-card dark:bg-black/20 rounded-lg p-2"
          />
        </div>
      )}

      {/* Detailed Measurements by Category */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Detailed Measurements</h3>
        <div className="grid grid-cols-2 gap-4">
          {measurementCategories.slice(1).map((category) => (
            <div key={category.id} className="space-y-4">
              <h4 className="font-medium">{category.title}</h4>
              <div className="grid grid-cols-2 gap-3">
                {category.fields.map((field) => {
                  const hasFieldData = bodyMeasures.some(
                    (measurement) =>
                      measurement[field.key] !== null &&
                      measurement[field.key] !== undefined,
                  )

                  if (!hasFieldData) {
                    return (
                      <StatCard
                        key={field.key}
                        label={field.label}
                        value={getLatestMeasurement(field.key)}
                        unit={field.unit}
                        trend={getTrend(field.key)}
                      />
                    )
                  }

                  return (
                    <MeasurementCategoryDrawer
                      key={field.key}
                      category={category}
                      measurements={bodyMeasures}
                      focusField={field.key}
                      drawerDirection="right"
                    >
                      <button className="text-left">
                        <StatCard
                          key={field.key}
                          label={field.label}
                          value={getLatestMeasurement(field.key)}
                          unit={field.unit}
                          trend={getTrend(field.key)}
                        />
                      </button>
                    </MeasurementCategoryDrawer>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
