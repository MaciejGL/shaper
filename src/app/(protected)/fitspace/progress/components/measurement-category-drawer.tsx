'use client'

import { format } from 'date-fns'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

import { Button } from '@/components/ui/button'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Drawer,
  DrawerTrigger,
  SimpleDrawerContent,
} from '@/components/ui/drawer'
import { GQLBodyMeasuresQuery } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { AddMeasurementModal } from './add-measurement-modal'
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
  const { getLatestMeasurement, getTrend } = useBodyMeasurements(measurements)

  // If focusField is provided, show only that specific field, otherwise show all category fields
  const fieldsToShow = focusField
    ? category.fields.filter((f) => f.key === focusField) // Only the clicked field
    : category.fields // All fields in category

  // Get title - if focusing on specific field, use field label only
  const drawerTitle = focusField
    ? `${category.fields.find((f) => f.key === focusField)?.label} Progress`
    : category.title
  // Prepare chart data for fields that have multiple data points
  const getChartData = (field: MeasurementField, label: string) => {
    const data = measurements
      .slice()
      .reverse()
      .filter((measurement) => measurement[field] != null)
      .map((measurement) => ({
        date: format(new Date(measurement.measuredAt), 'dd MMM'),
        [field]: measurement[field],
      }))

    if (data.length < 2) return null

    const chartConfig = {
      [field]: {
        label: `${label} (${category.fields.find((f) => f.key === field)?.unit})`,
        color: 'var(--chart-1)',
      },
    } satisfies ChartConfig

    return { data, chartConfig }
  }
  // Get fields that have data for charts, prioritizing focused field
  const fieldsWithChartData = fieldsToShow.filter((field) => {
    const chartInfo = getChartData(field.key, field.label)
    return chartInfo !== null
  })

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
                />
              )
            })}
          </div>

          {/* Charts for fields with enough data - prioritize focused field */}
          {fieldsWithChartData.map((field) => {
            const chartInfo = getChartData(field.key, field.label)
            if (!chartInfo) return null

            return (
              <div key={field.key}>
                <h3 className="font-semibold mb-3">{field.label} Progress</h3>
                <ChartContainer
                  config={chartInfo.chartConfig}
                  className="h-[200px] w-full bg-card dark:bg-black/20 rounded-lg p-2"
                >
                  <LineChart
                    data={chartInfo.data}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="2 2" opacity={0.3} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                      height={20}
                    />
                    <YAxis
                      tick={{ fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                      width={30}
                      tickFormatter={(value) =>
                        `${value.toFixed(1)}${field.unit}`
                      }
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      dataKey={field.key}
                      type="monotone"
                      stroke={`var(--color-${field.key})`}
                      strokeWidth={2.5}
                      dot={{ r: 2.5 }}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ChartContainer>
              </div>
            )
          })}

          {/* Recent History */}
          <div>
            <h3 className="font-semibold mb-3">Recent History</h3>
            <MeasurementHistoryList
              measurements={measurements}
              onUpdate={onUpdate}
              focusField={focusField}
              maxMonths={6}
            />
          </div>
        </div>
      </SimpleDrawerContent>
    </Drawer>
  )
}
