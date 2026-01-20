'use client'

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { GQLBodyMeasuresQuery } from '@/generated/graphql-client'
import { useDynamicUnitResolver } from '@/hooks/use-dynamic-unit-resolver'
import { cn } from '@/lib/utils'

import { MeasurementChart } from './measurement-chart'
import { MeasurementCategory, MeasurementField } from './measurement-constants'
import { MeasurementHistoryList } from './measurement-history-list'
import { StatCard } from './stat-card'
import { useBodyMeasurements } from './use-body-measurements'

interface MeasurementCategoryDrawerProps {
  category: MeasurementCategory
  measurements: GQLBodyMeasuresQuery['bodyMeasures']
  onUpdate?: () => void
  children: React.ReactNode
  focusField?: MeasurementField
  drawerDirection?: 'bottom' | 'right'
  className?: string
}

export function MeasurementCategoryDrawer({
  category,
  measurements,
  onUpdate,
  children,
  focusField,
  drawerDirection = 'bottom',
  className,
}: MeasurementCategoryDrawerProps) {
  // Filter measurements to only include those with data for the focused field
  const filteredMeasurements = focusField
    ? measurements.filter(
        (m) => m[focusField] !== null && m[focusField] !== undefined,
      )
    : measurements

  const { getLatestMeasurement, getTrend } =
    useBodyMeasurements(filteredMeasurements)
  const { resolveUnit } = useDynamicUnitResolver()

  // If focusField is provided, show only that specific field, otherwise show all category fields
  const fieldsToShow = focusField
    ? category.fields.filter((f) => f.key === focusField) // Only the clicked field
    : category.fields // All fields in category

  // Get title - if focusing on specific field, use field label only
  const drawerTitle = focusField
    ? `${category.fields.find((f) => f.key === focusField)?.label} Progress`
    : category.title

  const hasData =
    filteredMeasurements.length > 0 &&
    fieldsToShow.some((f) => getLatestMeasurement(f.key) !== null)

  return (
    <Drawer direction={drawerDirection}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent
        dialogTitle={drawerTitle}
        className={cn('max-h-[90vh]', className)}
      >
        <div className="flex flex-col min-h-0">
          <DrawerHeader className="border-b flex-none">
            <DrawerTitle>{drawerTitle}</DrawerTitle>
          </DrawerHeader>

          <div className="flex-1 min-h-0 px-4 pt-4">
            <div className="space-y-6 pb-6">
              {/* Current Stats */}
              <div
                className={cn(
                  'gap-3',
                  focusField ? 'grid grid-cols-1' : 'grid grid-cols-2',
                )}
              >
                {fieldsToShow.map((field) => {
                  const resolvedUnit = resolveUnit(field.key, field.unit)
                  return (
                    <StatCard
                      key={field.key}
                      label={field.label}
                      value={getLatestMeasurement(field.key)}
                      unit={resolvedUnit}
                      trend={getTrend(field.key)}
                      size={focusField ? 'default' : 'sm'}
                      isOnCard
                    />
                  )
                })}
              </div>

              {/* Charts for fields with enough data */}
              {hasData &&
                fieldsToShow.map((field) => {
                  const resolvedUnit = resolveUnit(field.key, field.unit)
                  return (
                    <div key={field.key}>
                      <h3 className="font-semibold mb-3">
                        {field.label} Progress
                      </h3>
                      <MeasurementChart
                        measurements={filteredMeasurements}
                        field={field.key}
                        label={field.label}
                        unit={resolvedUnit}
                      />
                    </div>
                  )
                })}

              {/* Recent History */}
              <div>
                <h3 className="font-semibold mb-3">Measurement History</h3>
                <MeasurementHistoryList
                  measurements={filteredMeasurements}
                  onUpdate={onUpdate}
                  focusField={focusField}
                  isOnCard
                />
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
