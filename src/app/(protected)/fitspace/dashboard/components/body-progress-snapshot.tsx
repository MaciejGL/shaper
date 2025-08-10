'use client'

import { format, formatDistanceToNow } from 'date-fns'
import {
  ChevronRight,
  Plus,
  Ruler,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { useMemo } from 'react'

import { ButtonLink } from '@/components/ui/button-link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SectionIcon } from '@/components/ui/section-icon'
import {
  type GQLBodyMeasuresQuery,
  useBodyMeasuresQuery,
} from '@/generated/graphql-client'
import { useWeightConversion } from '@/hooks/use-weight-conversion'
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
  measuredAt: string // Date when measurement was taken
}

interface BodyProgressSnapshotProps {
  isLoading?: boolean
}

// Helper function to calculate trend from body measurements
function calculateTrend(
  field:
    | 'weight'
    | 'waist'
    | 'chest'
    | 'bicepsLeft'
    | 'bicepsRight'
    | 'bodyFat',
  bodyMeasures: NonNullable<GQLBodyMeasuresQuery['bodyMeasures']>,
): {
  trend: 'up' | 'down' | 'stable'
  changeAmount: number
  isPositiveTrend: boolean
} {
  const recentValues = bodyMeasures
    .map((measurement) => measurement[field])
    .filter((value) => value !== null && value !== undefined) as number[]

  if (recentValues.length < 2) {
    return { trend: 'stable', changeAmount: 0, isPositiveTrend: true }
  }

  const current = recentValues[0] // Most recent
  const previous = recentValues[1] // Second most recent
  const change = current - previous

  // Determine if trend is positive based on measurement type
  const isPositiveTrend = (() => {
    switch (field) {
      case 'weight':
      case 'waist':
        return change <= 0 // Weight loss and waist reduction are generally positive
      case 'chest':
      case 'bicepsLeft':
      case 'bicepsRight':
        return change >= 0 // Muscle growth is positive
      case 'bodyFat':
        return change <= 0 // Body fat reduction is positive
      default:
        return true
    }
  })()

  const trend: 'up' | 'down' | 'stable' =
    Math.abs(change) < 0.1 ? 'stable' : change > 0 ? 'up' : 'down'

  return {
    trend,
    changeAmount: Math.round(Math.abs(change) * 100) / 100, // Round to 2 decimal places
    isPositiveTrend: trend === 'stable' ? true : isPositiveTrend,
  }
}

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
    if (measurement.trend === 'stable') {
      return 'No change'
    }
    const sign = measurement.trend === 'up' ? '+' : '-'
    return `${sign}${measurement.changeAmount}${measurement.unit}`
  }

  const formatMeasurementDate = (dateString: string) => {
    const date = new Date(dateString)
    const isRecent = Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000 // Less than 7 days

    if (isRecent) {
      return formatDistanceToNow(date, { addSuffix: true })
    } else {
      return format(date, 'MMM d, yyyy')
    }
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <div className="font-medium text-sm">{measurement.label}</div>
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

        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {measurement.current}
            {measurement.unit}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatMeasurementDate(measurement.measuredAt)}
          </div>
        </div>
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

export function BodyProgressSnapshot({ isLoading }: BodyProgressSnapshotProps) {
  const { toDisplayWeight, weightUnit } = useWeightConversion()

  // Fetch body measurements and profile data
  const {
    data: bodyMeasuresData,
    isLoading: isMeasuresLoading,
    error: measuresError,
  } = useBodyMeasuresQuery()

  const bodyMeasures = useMemo(
    () => bodyMeasuresData?.bodyMeasures || [],
    [bodyMeasuresData?.bodyMeasures],
  )

  // Helper function to get latest measurement
  const getLatestMeasurement = useMemo(
    () =>
      (
        field:
          | 'weight'
          | 'waist'
          | 'chest'
          | 'bicepsLeft'
          | 'bicepsRight'
          | 'bodyFat',
      ): number | undefined => {
        for (const measurement of bodyMeasures) {
          const value = measurement[field]
          if (typeof value === 'number') {
            return value
          }
        }
        return undefined
      },
    [bodyMeasures],
  )

  // Transform body measurements into dashboard format
  const measurements: BodyMeasurement[] = useMemo(() => {
    if (!bodyMeasures.length) return []

    const result: BodyMeasurement[] = []

    // Weight
    const weight = getLatestMeasurement('weight')
    if (weight) {
      const weightTrend = calculateTrend('weight', bodyMeasures)
      const latestWeightMeasurement = bodyMeasures.find((m) => m.weight)
      result.push({
        id: 'weight',
        type: 'weight',
        label: 'Weight',
        current: Math.round((toDisplayWeight(weight) ?? 0) * 10) / 10, // Round to 1 decimal
        unit: weightUnit,
        trend: weightTrend.trend,
        changeAmount:
          Math.round((toDisplayWeight(weightTrend.changeAmount) ?? 0) * 10) /
          10, // Round to 1 decimal
        isPositiveTrend: weightTrend.isPositiveTrend,
        measuredAt:
          latestWeightMeasurement?.measuredAt || new Date().toISOString(),
      })
    }

    // Waist
    const waist = getLatestMeasurement('waist')
    if (waist) {
      const waistTrend = calculateTrend('waist', bodyMeasures)
      const latestWaistMeasurement = bodyMeasures.find((m) => m.waist)
      result.push({
        id: 'waist',
        type: 'waist',
        label: 'Waist',
        current: Math.round(waist * 10) / 10, // Round to 1 decimal
        unit: 'cm',
        trend: waistTrend.trend,
        changeAmount: waistTrend.changeAmount,
        isPositiveTrend: waistTrend.isPositiveTrend,
        measuredAt:
          latestWaistMeasurement?.measuredAt || new Date().toISOString(),
      })
    }

    // Bicep (use left bicep, or average if both available)
    const bicepLeft = getLatestMeasurement('bicepsLeft')
    const bicepRight = getLatestMeasurement('bicepsRight')
    const bicep =
      bicepLeft && bicepRight
        ? (bicepLeft + bicepRight) / 2
        : bicepLeft || bicepRight

    if (bicep) {
      const bicepTrend = calculateTrend('bicepsLeft', bodyMeasures) // Use left for trend
      const latestBicepMeasurement = bodyMeasures.find(
        (m) => m.bicepsLeft || m.bicepsRight,
      )
      result.push({
        id: 'bicep',
        type: 'bicep',
        label: 'Bicep',
        current: Math.round(bicep * 10) / 10, // Round to 1 decimal
        unit: 'cm',
        trend: bicepTrend.trend,
        changeAmount: bicepTrend.changeAmount,
        isPositiveTrend: bicepTrend.isPositiveTrend,
        measuredAt:
          latestBicepMeasurement?.measuredAt || new Date().toISOString(),
      })
    }

    return result.slice(0, 3) // Show only top 3 measurements
  }, [bodyMeasures, toDisplayWeight, weightUnit, getLatestMeasurement])

  // Calculate last measured date
  const lastMeasuredDate = useMemo(() => {
    if (!bodyMeasures.length) return undefined
    const mostRecent = bodyMeasures[0]?.measuredAt
    if (!mostRecent) return undefined
    return formatDistanceToNow(new Date(mostRecent), { addSuffix: true })
  }, [bodyMeasures])

  const combinedLoading = isLoading || isMeasuresLoading
  if (combinedLoading) {
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
        {measuresError || measurements.length === 0 ? (
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
            {lastMeasuredDate && (
              <div className="text-xs text-muted-foreground/70 mb-4 text-center">
                Last measured {lastMeasuredDate}
              </div>
            )}

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
