'use client'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerTrigger,
  SimpleDrawerContent,
} from '@/components/ui/drawer'
import { GQLBodyMeasuresQuery } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { AddMeasurementModal } from './add-measurement-modal'
import { MeasurementChart } from './measurement-chart'
import { MeasurementCategory, MeasurementField } from './measurement-constants'
import { MeasurementHistoryList } from './measurement-history-list'
import { StatCard } from './stat-card'
import { useBodyMeasurements } from './use-body-measurements'

interface MeasurementCategoryDrawerProps {
  category: MeasurementCategory
  measurements: GQLBodyMeasuresQuery['bodyMeasures']
  onUpdate: () => void
  children: React.ReactNode
  focusField?: MeasurementField
}

export function MeasurementCategoryDrawer({
  category,
  measurements,
  onUpdate,
  children,
  focusField,
}: MeasurementCategoryDrawerProps) {
  // Filter measurements to only include those with data for the focused field
  const filteredMeasurements = focusField
    ? measurements.filter(
        (m) => m[focusField] !== null && m[focusField] !== undefined,
      )
    : measurements

  const { getLatestMeasurement, getTrend } =
    useBodyMeasurements(filteredMeasurements)

  // If focusField is provided, show only that specific field, otherwise show all category fields
  const fieldsToShow = focusField
    ? category.fields.filter((f) => f.key === focusField) // Only the clicked field
    : category.fields // All fields in category

  // Get title - if focusing on specific field, use field label only
  const drawerTitle = focusField
    ? `${category.fields.find((f) => f.key === focusField)?.label} Progress`
    : category.title

  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <SimpleDrawerContent
        title={drawerTitle}
        footer={
          <div className="flex gap-2">
            <AddMeasurementModal onSuccess={onUpdate}>
              <Button className="flex-1">Add Measurement</Button>
            </AddMeasurementModal>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Current Stats */}
          <div
            className={cn(
              'gap-3',
              focusField ? 'grid grid-cols-1' : 'grid grid-cols-2',
            )}
          >
            {fieldsToShow.map((field) => {
              return (
                <StatCard
                  key={field.key}
                  label={field.label}
                  value={getLatestMeasurement(field.key)}
                  unit={field.unit}
                  trend={getTrend(field.key)}
                  size={focusField ? 'default' : 'sm'}
                  isOnCard
                />
              )
            })}
          </div>

          {/* Charts for fields with enough data */}
          {fieldsToShow.map((field) => (
            <div key={field.key}>
              <h3 className="font-semibold mb-3">{field.label} Progress</h3>
              <MeasurementChart
                measurements={filteredMeasurements}
                field={field.key}
                label={field.label}
                unit={field.unit}
              />
            </div>
          ))}

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
      </SimpleDrawerContent>
    </Drawer>
  )
}
