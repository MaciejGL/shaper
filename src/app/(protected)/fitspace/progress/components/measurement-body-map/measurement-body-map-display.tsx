'use client'

import { ArrowDown, ArrowUp } from 'lucide-react'
import { useState } from 'react'

import { useCircumferenceConversion } from '@/hooks/use-circumference-conversion'
import { cn } from '@/lib/utils'

import { useBodyMeasurementsContext } from '../body-measurements-context'
import { MeasurementCategoryDrawer } from '../measurement-category-drawer'
import {
  MeasurementField,
  MeasurementFieldEnum,
  measurementCategories,
} from '../measurement-constants'

import {
  BaseMeasurementBodyMap,
  LABEL_SIZE_CONFIG,
  LabelSize,
  LabelSizeConfig,
} from './base-measurement-body-map'
import { MeasurementPosition } from './types'

// ============================================================================
// Constants
// ============================================================================

const CIRCUMFERENCE_FIELDS = ['chest', 'waist', 'hips', 'neck']
const LIMB_FIELDS = [
  'bicepsLeft',
  'bicepsRight',
  'thighLeft',
  'thighRight',
  'calfLeft',
  'calfRight',
]

// ============================================================================
// Helpers
// ============================================================================

function getCategoryForField(field: string) {
  if (CIRCUMFERENCE_FIELDS.includes(field)) return measurementCategories[1]
  if (LIMB_FIELDS.includes(field)) return measurementCategories[2]
  return measurementCategories[1]
}

function formatValue(value: number): string {
  return value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)
}

// ============================================================================
// Subcomponents
// ============================================================================

function TrendIndicator({
  trend,
  unit,
}: {
  trend: number | null
  unit: string
}) {
  if (trend === null || trend === 0) return null

  const isIncrease = trend > 0
  return (
    <div
      className={cn(
        'flex items-center gap-0.5',
        isIncrease ? 'text-emerald-500' : 'text-amber-500',
      )}
    >
      {isIncrease ? (
        <ArrowUp className="size-2.5" />
      ) : (
        <ArrowDown className="size-2.5" />
      )}
      <span className="text-[9px]">
        {formatValue(Math.abs(trend))} {unit}
      </span>
    </div>
  )
}

interface LabelItemProps {
  position: MeasurementPosition
  displayValue: number | null
  displayTrend: number | null
  unit: string
  isHovered: boolean
  hasFieldData: boolean
  onHover: (hovered: boolean) => void
  config: LabelSizeConfig
}

function LabelItem({
  position,
  displayValue,
  displayTrend,
  unit,
  isHovered,
  hasFieldData,
  onHover,
  config,
}: LabelItemProps) {
  const hasValue = displayValue !== null
  const isLeft = position.side === 'left'

  return (
    <div
      className={cn(
        'flex flex-col justify-center',
        isLeft ? 'items-end' : 'items-start',
        hasFieldData ? 'cursor-pointer' : 'cursor-default',
      )}
      style={{ height: `${config.height}px` }}
      onMouseEnter={() => hasFieldData && onHover(true)}
      onMouseLeave={() => hasFieldData && onHover(false)}
    >
      {/* Label row with trend */}
      <div
        className={cn(
          'flex items-center gap-1',
          isLeft ? 'flex-row-reverse' : 'flex-row',
        )}
      >
        <p
          className={cn(
            'font-medium whitespace-nowrap uppercase tracking-wide',
            config.labelFontSize,
            hasValue ? 'text-foreground' : 'text-muted-foreground/70',
          )}
        >
          {position.label}
        </p>
        {displayTrend !== null && (
          <TrendIndicator trend={displayTrend} unit={unit} />
        )}
      </div>

      {/* Value box */}
      <div
        className={cn(
          'px-1.5 rounded-md flex items-center',
          config.valueFontSize,
          'bg-primary/5 dark:bg-primary/8',
          'transition-all duration-200',
          isLeft ? 'justify-end' : 'justify-start',
          hasValue && 'bg-primary/10',
          isHovered && 'ring-1 ring-primary',
        )}
        style={{
          width: `${config.valueBoxWidth}px`,
          height: `${config.valueBoxHeight}px`,
        }}
      >
        {hasValue ? (
          <span className="text-foreground text-sm">
            {formatValue(displayValue)}{' '}
            <span className="text-muted-foreground text-xs">{unit}</span>
          </span>
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

interface MeasurementBodyMapDisplayProps {
  size?: LabelSize
}

export function MeasurementBodyMapDisplay({
  size = 'md',
}: MeasurementBodyMapDisplayProps) {
  const { bodyMeasures, getLatestMeasurement, getTrend, onMeasurementAdded } =
    useBodyMeasurementsContext()
  const { toDisplayCircumference, circumferenceUnit } =
    useCircumferenceConversion()
  const [hoveredField, setHoveredField] = useState<MeasurementFieldEnum | null>(
    null,
  )

  const config = LABEL_SIZE_CONFIG[size]

  return (
    <BaseMeasurementBodyMap
      size={size}
      hoveredField={hoveredField}
      renderLabel={({ position }) => {
        const field = position.field as MeasurementField
        const rawValue = getLatestMeasurement(field)
        const displayValue = rawValue ? toDisplayCircumference(rawValue) : null
        const rawTrend = getTrend(field)
        const displayTrend =
          rawTrend !== null ? toDisplayCircumference(rawTrend) : null

        const fieldMeasurements = bodyMeasures.filter(
          (m) => m[field] !== null && m[field] !== undefined,
        )
        const hasFieldData = fieldMeasurements.length > 0

        const labelElement = (
          <LabelItem
            position={position}
            displayValue={displayValue}
            displayTrend={displayTrend}
            unit={circumferenceUnit}
            isHovered={hoveredField === position.field}
            hasFieldData={hasFieldData}
            onHover={(hovered) =>
              setHoveredField(hovered ? position.field : null)
            }
            config={config}
          />
        )

        if (hasFieldData) {
          return (
            <MeasurementCategoryDrawer
              category={getCategoryForField(field)}
              measurements={fieldMeasurements}
              onUpdate={onMeasurementAdded}
              focusField={field}
            >
              <button className="contents">{labelElement}</button>
            </MeasurementCategoryDrawer>
          )
        }

        return labelElement
      }}
    />
  )
}
