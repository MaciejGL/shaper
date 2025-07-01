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

import { AddMeasurementModal } from './add-measurement-modal'
import { MeasurementCategory, MeasurementField } from './measurement-constants'
import { StatCard } from './stat-card'
import { useBodyMeasurements } from './use-body-measurements'

interface MeasurementCategoryDrawerProps {
  category: MeasurementCategory
  measurements: GQLBodyMeasuresQuery['bodyMeasures']
  onUpdate: () => void
  children: React.ReactNode
}

export function MeasurementCategoryDrawer({
  category,
  measurements,
  onUpdate,
  children,
}: MeasurementCategoryDrawerProps) {
  const { getLatestMeasurement, getTrend } = useBodyMeasurements(measurements)

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

  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <SimpleDrawerContent
        title={category.title}
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
          <div>
            <h3 className="font-semibold mb-3">Current Measurements</h3>
            <div className="grid grid-cols-2 gap-3">
              {category.fields.map((field) => (
                <StatCard
                  key={field.key}
                  label={field.label}
                  value={getLatestMeasurement(field.key)}
                  unit={field.unit}
                  trend={getTrend(field.key)}
                  size="sm"
                />
              ))}
            </div>
          </div>

          {/* Charts for fields with enough data */}
          {category.fields.map((field) => {
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
            <div className="space-y-2">
              {measurements.slice(0, 5).map((measurement) => {
                const relevantFields = category.fields.filter(
                  (field) =>
                    measurement[field.key] !== null &&
                    measurement[field.key] !== undefined,
                )

                if (relevantFields.length === 0) return null

                return (
                  <div key={measurement.id} className="border rounded-lg p-3">
                    <div className="text-sm text-muted-foreground mb-2">
                      {format(new Date(measurement.measuredAt), 'PPP')}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {relevantFields.map((field) => (
                        <div key={field.key}>
                          <span className="text-muted-foreground">
                            {field.label}:
                          </span>{' '}
                          <span className="font-medium">
                            {measurement[field.key]}
                            {field.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </SimpleDrawerContent>
    </Drawer>
  )
}
