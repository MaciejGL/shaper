'use client'

import {
  ChevronRight,
  Plus,
  Ruler,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'

import { ButtonLink } from '@/components/ui/button-link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SectionIcon } from '@/components/ui/section-icon'
import { cn } from '@/lib/utils'

interface BodyMeasurement {
  id: string
  type: 'weight' | 'waist' | 'chest' | 'bicep' | 'bodyFat'
  label: string
  current: number
  previous?: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  changeAmount: number
  isPositiveTrend: boolean // Whether trend direction is good for this measurement
}

interface BodyProgressSnapshotProps {
  measurements?: BodyMeasurement[]
  lastMeasuredDate?: string
  isLoading?: boolean
}

// Mock data - replace with real body measurement data
const mockMeasurements: BodyMeasurement[] = [
  {
    id: '1',
    type: 'weight',
    label: 'Weight',
    current: 77.2,
    previous: 77.5,
    unit: 'kg',
    trend: 'down',
    changeAmount: 0.3,
    isPositiveTrend: true, // Depends on user goals
  },
  {
    id: '2',
    type: 'waist',
    label: 'Waist',
    current: 82,
    previous: 83,
    unit: 'cm',
    trend: 'down',
    changeAmount: 1,
    isPositiveTrend: true,
  },
  {
    id: '3',
    type: 'bicep',
    label: 'Bicep',
    current: 38,
    previous: 37.5,
    unit: 'cm',
    trend: 'up',
    changeAmount: 0.5,
    isPositiveTrend: true,
  },
]

function MeasurementItem({ measurement }: { measurement: BodyMeasurement }) {
  const getTrendColor = () => {
    if (measurement.trend === 'stable') {
      return 'text-gray-600 dark:text-gray-400'
    }
    return measurement.isPositiveTrend
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400'
  }

  const getTrendIcon = () => {
    switch (measurement.trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3" />
      case 'down':
        return <TrendingDown className="h-3 w-3" />
      default:
        return <div className="h-3 w-3 rounded-full bg-current" />
    }
  }

  const getTrendText = () => {
    const sign =
      measurement.trend === 'up'
        ? '+'
        : measurement.trend === 'down'
          ? '-'
          : '±'
    return `${sign}${measurement.changeAmount}${measurement.unit}`
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
      <div className="flex items-center gap-3">
        <div>
          <div className="font-medium text-sm">{measurement.label}</div>
          <div className="text-xs text-muted-foreground">
            {measurement.current}
            {measurement.unit}
          </div>
        </div>
      </div>

      <div
        className={cn(
          'flex items-center gap-1 text-xs font-medium',
          getTrendColor(),
        )}
      >
        {getTrendIcon()}
        <span>{getTrendText()}</span>
      </div>
    </div>
  )
}

function EmptyMeasurements() {
  return (
    <div className="text-center py-6 px-4">
      <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
        <Ruler className="h-6 w-6 text-muted-foreground/70" />
      </div>
      <p className="text-sm text-muted-foreground mb-2">
        No measurements recorded
      </p>
      <p className="text-xs text-muted-foreground/70 mb-4">
        Track your body measurements to see progress
      </p>
      <ButtonLink href="/fitspace/progress" size="sm" variant="outline">
        <Plus className="h-4 w-4 mr-1" />
        Add Measurements
      </ButtonLink>
    </div>
  )
}

function MeasurementsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50"
        >
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-muted rounded animate-pulse" />
            <div className="space-y-1">
              <div className="h-4 bg-muted rounded animate-pulse w-16" />
              <div className="h-3 bg-muted rounded animate-pulse w-12" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 bg-muted rounded animate-pulse" />
            <div className="h-3 w-8 bg-muted rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function BodyProgressSnapshot({
  measurements = mockMeasurements,
  lastMeasuredDate = '1 week ago',
  isLoading,
}: BodyProgressSnapshotProps) {
  if (isLoading) {
    return (
      <Card variant="secondary">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <SectionIcon icon={Ruler} variant="default" />
            Body Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MeasurementsSkeleton />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="secondary">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <SectionIcon icon={Ruler} variant="default" />
          Body Progress
        </CardTitle>
      </CardHeader>

      <CardContent>
        {measurements.length === 0 ? (
          <EmptyMeasurements />
        ) : (
          <>
            {/* Latest measurements */}
            <div className="space-y-3 mb-4">
              <div className="text-xs text-muted-foreground mb-2">
                Latest measurements:
              </div>
              {measurements.map((measurement) => (
                <MeasurementItem
                  key={measurement.id}
                  measurement={measurement}
                />
              ))}
            </div>

            {/* Last measured indicator */}
            <div className="text-xs text-muted-foreground/70 mb-4 text-center">
              Last measured {lastMeasuredDate}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2 border-t border-border/50">
              <ButtonLink
                href="/fitspace/progress"
                variant="tertiary"
                size="sm"
                iconStart={<Plus />}
              >
                Add Measurement
              </ButtonLink>
              <ButtonLink
                href="/fitspace/progress"
                variant="tertiary"
                size="sm"
                className="flex-1"
                iconEnd={<ChevronRight />}
              >
                View Progress
              </ButtonLink>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
