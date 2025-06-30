'use client'

import { format } from 'date-fns'
import { Plus, Ruler, Scale, TrendingDown, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface BodyMeasurementsProps {
  bodyMeasures: any[]
  onAddMeasurement: (measurements: any) => void
}

interface MeasurementData {
  weight: string
  bodyFat: string
  chest: string
  waist: string
  hips: string
  neck: string
  bicepsLeft: string
  bicepsRight: string
  thighLeft: string
  thighRight: string
  notes: string
}

export function BodyMeasurements({
  bodyMeasures,
  onAddMeasurement,
}: BodyMeasurementsProps) {
  const [isLogging, setIsLogging] = useState(false)

  // Calculate trends for each measurement
  const getWeightTrend = () => {
    if (bodyMeasures.length < 2) return null
    const recent = bodyMeasures[0]?.weight
    const previous = bodyMeasures[1]?.weight
    if (!recent || !previous) return null
    return recent - previous
  }

  const getBodyFatTrend = () => {
    if (bodyMeasures.length < 2) return null
    const recent = bodyMeasures[0]?.bodyFat
    const previous = bodyMeasures[1]?.bodyFat
    if (!recent || !previous) return null
    return recent - previous
  }

  const handleAddMeasurement = (measurements: MeasurementData) => {
    onAddMeasurement(measurements)
    setIsLogging(false)
  }

  return (
    <div className="space-y-6">
      {/* Quick Log Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Body Measurements
          </CardTitle>
          <Button onClick={() => setIsLogging(!isLogging)} size="sm">
            <Plus className="h-4 w-4" />
            Log Measurements
          </Button>
        </CardHeader>
        <CardContent>
          {isLogging && (
            <QuickLogForm
              onSubmit={handleAddMeasurement}
              onCancel={() => setIsLogging(false)}
            />
          )}

          {/* Current Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <StatCard
              label="Weight"
              value={bodyMeasures[0]?.weight}
              unit="kg"
              trend={getWeightTrend()}
              icon={<Scale className="h-4 w-4" />}
            />
            <StatCard
              label="Body Fat"
              value={bodyMeasures[0]?.bodyFat}
              unit="%"
              trend={getBodyFatTrend()}
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <StatCard
              label="Waist"
              value={bodyMeasures[0]?.waist}
              unit="cm"
              icon={<Ruler className="h-4 w-4" />}
            />
            <StatCard
              label="Chest"
              value={bodyMeasures[0]?.chest}
              unit="cm"
              icon={<Ruler className="h-4 w-4" />}
            />
          </div>
        </CardContent>
      </Card>

      {/* Progress Charts */}
      {bodyMeasures.length > 1 && (
        <div className="grid md:grid-cols-2 gap-6">
          <WeightProgressChart data={bodyMeasures} />
          <BodyCompositionChart data={bodyMeasures} />
        </div>
      )}

      {/* No Data State */}
      {bodyMeasures.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Scale className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Measurements Yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Start tracking your body measurements to see progress over time.
              </p>
              <Button onClick={() => setIsLogging(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Log First Measurement
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function QuickLogForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (measurements: MeasurementData) => void
  onCancel: () => void
}) {
  const [measurements, setMeasurements] = useState<MeasurementData>({
    weight: '',
    bodyFat: '',
    chest: '',
    waist: '',
    hips: '',
    neck: '',
    bicepsLeft: '',
    bicepsRight: '',
    thighLeft: '',
    thighRight: '',
    notes: '',
  })

  const handleSubmit = () => {
    onSubmit(measurements)
  }

  const updateMeasurement = (field: keyof MeasurementData, value: string) => {
    setMeasurements((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="bg-muted p-4 rounded-lg space-y-4 mb-4">
      <h3 className="font-medium">Add New Measurements</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            value={measurements.weight}
            onChange={(e) => updateMeasurement('weight', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="bodyFat">Body Fat (%)</Label>
          <Input
            id="bodyFat"
            type="number"
            step="0.1"
            value={measurements.bodyFat}
            onChange={(e) => updateMeasurement('bodyFat', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="chest">Chest (cm)</Label>
          <Input
            id="chest"
            type="number"
            step="0.1"
            value={measurements.chest}
            onChange={(e) => updateMeasurement('chest', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="waist">Waist (cm)</Label>
          <Input
            id="waist"
            type="number"
            step="0.1"
            value={measurements.waist}
            onChange={(e) => updateMeasurement('waist', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="hips">Hips (cm)</Label>
          <Input
            id="hips"
            type="number"
            step="0.1"
            value={measurements.hips}
            onChange={(e) => updateMeasurement('hips', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="neck">Neck (cm)</Label>
          <Input
            id="neck"
            type="number"
            step="0.1"
            value={measurements.neck}
            onChange={(e) => updateMeasurement('neck', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any additional notes about your measurements..."
          value={measurements.notes}
          onChange={(e) => updateMeasurement('notes', e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSubmit}>Save Measurements</Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  unit,
  trend,
  icon,
}: {
  label: string
  value?: number
  unit: string
  trend?: number | null
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm text-muted-foreground">{label}</span>
          </div>
          {trend !== null && trend !== undefined && (
            <div className="flex items-center gap-1">
              {trend > 0 ? (
                <TrendingUp className="h-3 w-3 text-red-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-green-500" />
              )}
              <span className="text-xs text-muted-foreground">
                {Math.abs(trend).toFixed(1)}
                {unit}
              </span>
            </div>
          )}
        </div>
        <div className="mt-2">
          <span className="text-2xl font-bold">
            {value ? value.toFixed(1) : '--'}
          </span>
          <span className="text-sm text-muted-foreground ml-1">{unit}</span>
        </div>
      </CardContent>
    </Card>
  )
}

const chartConfig = {
  weight: {
    label: 'Weight',
    color: 'var(--chart-1)',
  },
  bodyFat: {
    label: 'Body Fat',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

function WeightProgressChart({ data }: { data: any[] }) {
  const chartData = data
    .filter((d) => d.weight)
    .map((d) => ({
      date: format(new Date(d.measuredAt), 'MMM dd'),
      weight: d.weight,
    }))
    .reverse()

  if (chartData.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weight Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="var(--color-weight)"
              strokeWidth={2}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function BodyCompositionChart({ data }: { data: any[] }) {
  const chartData = data
    .filter((d) => d.bodyFat)
    .map((d) => ({
      date: format(new Date(d.measuredAt), 'MMM dd'),
      bodyFat: d.bodyFat,
    }))
    .reverse()

  if (chartData.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Body Fat Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="bodyFat"
              stroke="var(--color-bodyFat)"
              strokeWidth={2}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
