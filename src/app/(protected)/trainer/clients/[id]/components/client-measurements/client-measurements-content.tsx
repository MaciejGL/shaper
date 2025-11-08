'use client'

import { Scale } from 'lucide-react'

import { MeasurementCategoryDrawer } from '@/app/(protected)/fitspace/progress/components/measurement-category-drawer'
import { MeasurementChart } from '@/app/(protected)/fitspace/progress/components/measurement-chart'
import { measurementCategories } from '@/app/(protected)/fitspace/progress/components/measurement-constants'
import { StatCard } from '@/app/(protected)/fitspace/progress/components/stat-card'
import { Card, CardContent } from '@/components/ui/card'
import { useCircumferenceConversion } from '@/hooks/use-circumference-conversion'
import { useDynamicUnitResolver } from '@/hooks/use-dynamic-unit-resolver'
import { useWeightConversion } from '@/hooks/use-weight-conversion'

import { ClientHeader } from '../header'

import { useBodyMeasurementsContext } from './client-measurements-context'

export function ClientMeasurementsContent({
  clientName,
}: {
  clientName: string
}) {
  const { bodyMeasures, getLatestMeasurement, getTrend } =
    useBodyMeasurementsContext()

  // User preference conversion hooks - same pattern as DetailedMeasurements
  const { toDisplayWeight, weightUnit } = useWeightConversion()
  const { toDisplayCircumference, circumferenceUnit } =
    useCircumferenceConversion()
  const { resolveUnit } = useDynamicUnitResolver()

  // List of circumference measurement fields (same as DetailedMeasurements)
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

  return (
    <div className="space-y-8">
      {/* Quick Stats Overview - Read-only for trainer */}
      <div className="space-y-4">
        <ClientHeader title="Measurements" />
        {bodyMeasures.length === 0 && (
          <ClientMeasurementsEmptyState clientName={clientName} />
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MeasurementCategoryDrawer
            key={'weight'}
            category={measurementCategories[0]}
            measurements={bodyMeasures}
            focusField={'weight'}
            drawerDirection="right"
          >
            <button className="text-left w-full">
              <StatCard
                label="Weight"
                value={
                  toDisplayWeight(getLatestMeasurement('weight')) || undefined
                }
                unit={weightUnit}
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
            <button className="text-left w-full">
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
          <h3 className="text-lg font-medium">Weight Progress</h3>
          <MeasurementChart
            measurements={bodyMeasures}
            field="weight"
            label="Weight"
            unit={weightUnit}
            className="h-full w-full min-h-0 bg-card dark:bg-black/20 rounded-lg p-2"
          />
        </div>
      )}

      {/* Detailed Measurements by Category */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Detailed Measurements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        unit={resolveUnit(field.key, field.unit)}
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
                      <button className="text-left w-full">
                        <StatCard
                          key={field.key}
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

function ClientMeasurementsEmptyState({ clientName }: { clientName: string }) {
  return (
    <Card>
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
