'use client'

import { Scale } from 'lucide-react'

import { MeasurementCategoryDrawer } from '@/app/(protected)/fitspace/progress/components/measurement-category-drawer'
import { MeasurementChart } from '@/app/(protected)/fitspace/progress/components/measurement-chart'
import { measurementCategories } from '@/app/(protected)/fitspace/progress/components/measurement-constants'
import { StatCard } from '@/app/(protected)/fitspace/progress/components/stat-card'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useCircumferenceConversion } from '@/hooks/use-circumference-conversion'
import { useDynamicUnitResolver } from '@/hooks/use-dynamic-unit-resolver'
import { useWeightConversion } from '@/hooks/use-weight-conversion'

import { useBodyMeasurementsContext } from './client-measurements-context'

export function ClientMeasurementsContent({
  clientName,
}: {
  clientName: string
}) {
  const { bodyMeasures, getLatestMeasurement, getTrend } =
    useBodyMeasurementsContext()

  const { toDisplayWeight, weightUnit } = useWeightConversion()
  const { toDisplayCircumference, circumferenceUnit } =
    useCircumferenceConversion()
  const { resolveUnit } = useDynamicUnitResolver()

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
  const totalLogs = bodyMeasures.length

  return (
    <div className="space-y-6">
      {bodyMeasures.length === 0 && (
        <ClientMeasurementsEmptyState clientName={clientName} />
      )}

      {/* Quick Stats Overview */}
      {bodyMeasures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Measurements Overview</CardTitle>
            <CardDescription>Latest body metrics</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
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
                      toDisplayWeight(getLatestMeasurement('weight')) ||
                      undefined
                    }
                    unit={weightUnit}
                    trend={getTrend('weight')}
                    isOnCard
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
                    isOnCard
                  />
                </button>
              </MeasurementCategoryDrawer>
            </div>
          </CardContent>
          <CardFooter className="pt-4 border-t flex flex-row">
            <div className="flex items-center justify-between w-full">
              <span className="text-sm text-muted-foreground">Total Logs</span>
              <span className="text-lg font-semibold">{totalLogs}</span>
            </div>
          </CardFooter>
        </Card>
      )}

      {/* Weight Progress Chart */}
      {bodyMeasures.length > 1 && (
        <Card>
          <CardContent>
            <h4 className="font-medium mb-4">Weight Progress</h4>
            <MeasurementChart
              measurements={bodyMeasures}
              field="weight"
              label="Weight"
              unit={weightUnit}
              className="h-[200px] w-full"
            />
          </CardContent>
        </Card>
      )}

      {/* Detailed Measurements by Category */}
      {bodyMeasures.length > 0 && (
        <div className="space-y-6">
          <h4 className="font-medium">Detailed Measurements</h4>
          <div className="grid gap-6">
            {measurementCategories.slice(1).map((category) => (
              <Card key={category.id}>
                <CardContent className="pt-6">
                  <h5 className="font-medium mb-4">{category.title}</h5>
                  <div className="grid grid-cols-2 @xl/client-detail-page:grid-cols-3 gap-3">
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
                            isOnCard
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
                              isOnCard
                            />
                          </button>
                        </MeasurementCategoryDrawer>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
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
