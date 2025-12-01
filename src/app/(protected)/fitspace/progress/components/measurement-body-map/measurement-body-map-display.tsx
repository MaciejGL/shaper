'use client'

import { ArrowDown, ArrowUp } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { BodyFrontSilhouette } from '@/components/human-body/body-front-silhouette'
import { useCircumferenceConversion } from '@/hooks/use-circumference-conversion'
import { cn } from '@/lib/utils'

import { useBodyMeasurementsContext } from '../body-measurements-context'
import { MeasurementCategoryDrawer } from '../measurement-category-drawer'
import {
  MeasurementField,
  MeasurementFieldEnum,
  measurementCategories,
} from '../measurement-constants'

import { MeasurementConnectionLine } from './measurement-connection-line'
import { MeasurementPosition } from './types'

// ============================================================================
// Types & Constants
// ============================================================================

type LabelSize = 'sm' | 'md'

interface LabelSizeConfig {
  height: number
  labelWidth: number
  valueBoxHeight: number
  valueBoxWidth: number
  labelFontSize: string
  valueFontSize: string
  gap: number // gap between labels when stacked
}

const LABEL_SIZE_CONFIG: Record<LabelSize, LabelSizeConfig> = {
  sm: {
    height: 38,
    labelWidth: 88,
    valueBoxHeight: 24,
    valueBoxWidth: 80,
    labelFontSize: 'text-[9px]',
    valueFontSize: 'text-[11px]',
    gap: 4,
  },
  md: {
    height: 48,
    labelWidth: 100,
    valueBoxHeight: 28,
    valueBoxWidth: 96,
    labelFontSize: 'text-[10px]',
    valueFontSize: 'text-xs',
    gap: 8,
  },
}

// Base dimensions for SVG body (original design at 170x340)
const BASE_SVG_WIDTH = 170
const BASE_SVG_HEIGHT = 340
const ASPECT_RATIO = BASE_SVG_HEIGHT / BASE_SVG_WIDTH

// Gap between labels and SVG
const COLUMN_GAP = 8

const CIRCUMFERENCE_FIELDS = ['chest', 'waist', 'hips', 'neck']
const LIMB_FIELDS = [
  'bicepsLeft',
  'bicepsRight',
  'thighLeft',
  'thighRight',
  'calfLeft',
  'calfRight',
]

// Body points for connection lines (relative to base 170x340 SVG)
// inputY is the label index (0-4) for ordering
const MEASUREMENT_POSITIONS: MeasurementPosition[] = [
  // Left side (order matters - top to bottom)
  {
    field: MeasurementFieldEnum.Neck,
    label: 'Neck',
    bodyX: 86,
    bodyY: 74,
    inputX: 0,
    inputY: 0,
    side: 'left',
  },
  {
    field: MeasurementFieldEnum.BicepsLeft,
    label: 'L. Bicep',
    bodyX: 47,
    bodyY: 110,
    inputX: 0,
    inputY: 1,
    side: 'left',
  },
  {
    field: MeasurementFieldEnum.Waist,
    label: 'Waist',
    bodyX: 85,
    bodyY: 145,
    inputX: 0,
    inputY: 2,
    side: 'left',
  },
  {
    field: MeasurementFieldEnum.ThighLeft,
    label: 'L. Thigh',
    bodyX: 61,
    bodyY: 220,
    inputX: 0,
    inputY: 3,
    side: 'left',
  },
  {
    field: MeasurementFieldEnum.CalfLeft,
    label: 'L. Calf',
    bodyX: 64,
    bodyY: 310,
    inputX: 0,
    inputY: 4,
    side: 'left',
  },
  // Right side (order matters - top to bottom)
  {
    field: MeasurementFieldEnum.Chest,
    label: 'Chest',
    bodyX: 85,
    bodyY: 102,
    inputX: 0,
    inputY: 0,
    side: 'right',
  },
  {
    field: MeasurementFieldEnum.BicepsRight,
    label: 'R. Bicep',
    bodyX: 123,
    bodyY: 110,
    inputX: 0,
    inputY: 1,
    side: 'right',
  },
  {
    field: MeasurementFieldEnum.Hips,
    label: 'Hips',
    bodyX: 85,
    bodyY: 175,
    inputX: 0,
    inputY: 2,
    side: 'right',
  },
  {
    field: MeasurementFieldEnum.ThighRight,
    label: 'R. Thigh',
    bodyX: 110,
    bodyY: 220,
    inputX: 0,
    inputY: 3,
    side: 'right',
  },
  {
    field: MeasurementFieldEnum.CalfRight,
    label: 'R. Calf',
    bodyX: 107,
    bodyY: 310,
    inputX: 0,
    inputY: 4,
    side: 'right',
  },
]

const LABEL_COUNT = 5

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

/**
 * Calculate the Y position of a label's center given its index (0-4)
 * Labels are evenly distributed across the container height
 */
function getLabelCenterY(
  index: number,
  containerHeight: number,
  labelHeight: number,
  labelCount: number,
): number {
  // Total space taken by all labels
  const totalLabelsHeight = labelCount * labelHeight
  // Space between labels
  const totalGapSpace = containerHeight - totalLabelsHeight
  const gapBetween = totalGapSpace / (labelCount - 1)

  // Y position of this label's top edge
  const labelTop = index * (labelHeight + gapBetween)
  // Return center of this label
  return labelTop + labelHeight / 2
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
  size: LabelSize
}

function LabelItem({
  position,
  displayValue,
  displayTrend,
  unit,
  isHovered,
  hasFieldData,
  onHover,
  size,
}: LabelItemProps) {
  const config = LABEL_SIZE_CONFIG[size]
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
          <span className="text-foreground">
            {formatValue(displayValue)}{' '}
            <span className="text-muted-foreground text-[10px]">{unit}</span>
          </span>
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
      </div>
    </div>
  )
}

interface ConnectionLinesOverlayProps {
  positions: MeasurementPosition[]
  hoveredField: MeasurementFieldEnum | null
  // Layout dimensions
  containerWidth: number
  containerHeight: number
  labelColumnWidth: number
  svgWidth: number
  svgOffsetY: number // vertical offset for centering SVG
  labelHeight: number
}

function ConnectionLinesOverlay({
  positions,
  hoveredField,
  containerWidth,
  containerHeight,
  labelColumnWidth,
  svgWidth,
  svgOffsetY,
  labelHeight,
}: ConnectionLinesOverlayProps) {
  const scale = svgWidth / BASE_SVG_WIDTH
  const svgOffsetX = labelColumnWidth + COLUMN_GAP

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={containerWidth}
      height={containerHeight}
      viewBox={`0 0 ${containerWidth} ${containerHeight}`}
    >
      {positions.map((pos) => {
        // Body point: scale and offset by SVG position
        const bodyX = svgOffsetX + pos.bodyX * scale
        const bodyY = svgOffsetY + pos.bodyY * scale

        // Label center Y based on flex distribution
        const labelIndex = pos.inputY
        const labelY = getLabelCenterY(
          labelIndex,
          containerHeight,
          labelHeight,
          LABEL_COUNT,
        )

        // Label X is at the edge closest to SVG
        const labelX =
          pos.side === 'left'
            ? labelColumnWidth // right edge of left column
            : labelColumnWidth + COLUMN_GAP + svgWidth + COLUMN_GAP // left edge of right column

        return (
          <MeasurementConnectionLine
            key={pos.field}
            bodyX={bodyX}
            bodyY={bodyY}
            inputX={labelX}
            inputY={labelY}
            side={pos.side}
            isFocused={hoveredField === pos.field}
            useAbsoluteCoords
          />
        )
      })}
    </svg>
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

  // Measure container width
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }

    updateWidth()

    const observer = new ResizeObserver(updateWidth)
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Get size config
  const config = LABEL_SIZE_CONFIG[size]
  const labelColumnWidth = config.labelWidth

  // Calculate layout dimensions
  const svgColumnWidth = containerWidth - labelColumnWidth * 2 - COLUMN_GAP * 2
  const svgWidth = Math.max(0, svgColumnWidth)
  const svgHeight = svgWidth * ASPECT_RATIO

  // Minimum height to fit all labels without overlap
  const minLabelHeight =
    LABEL_COUNT * config.height + (LABEL_COUNT - 1) * config.gap

  // Container height is the greater of SVG height or minimum label height
  const containerHeight = Math.max(svgHeight, minLabelHeight)

  // Calculate SVG vertical offset for centering
  const svgOffsetY = (containerHeight - svgHeight) / 2

  // Filter positions by side
  const leftPositions = MEASUREMENT_POSITIONS.filter((p) => p.side === 'left')
  const rightPositions = MEASUREMENT_POSITIONS.filter((p) => p.side === 'right')

  const renderLabel = (pos: MeasurementPosition) => {
    const field = pos.field as MeasurementField
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
        position={pos}
        displayValue={displayValue}
        displayTrend={displayTrend}
        unit={circumferenceUnit}
        isHovered={hoveredField === pos.field}
        hasFieldData={hasFieldData}
        onHover={(hovered) => setHoveredField(hovered ? pos.field : null)}
        size={size}
      />
    )

    if (hasFieldData) {
      return (
        <MeasurementCategoryDrawer
          key={pos.field}
          category={getCategoryForField(field)}
          measurements={fieldMeasurements}
          onUpdate={onMeasurementAdded}
          focusField={field}
        >
          <button className="contents">{labelElement}</button>
        </MeasurementCategoryDrawer>
      )
    }

    return <div key={pos.field}>{labelElement}</div>
  }

  // Don't render until we have container width
  if (containerWidth === 0) {
    return (
      <div
        ref={containerRef}
        className="w-full"
        style={{ height: minLabelHeight }}
      />
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: `${containerHeight}px` }}
    >
      {/* Three-column layout */}
      <div
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `${labelColumnWidth}px 1fr ${labelColumnWidth}px`,
          gap: `${COLUMN_GAP}px`,
        }}
      >
        {/* Left labels column */}
        <div className="flex flex-col justify-between">
          {leftPositions.map(renderLabel)}
        </div>

        {/* SVG body column */}
        <div className="relative flex items-center justify-center">
          <div
            className="pointer-events-none opacity-60 [&_svg]:w-full [&_svg]:h-full"
            style={{ width: `${svgWidth}px`, height: `${svgHeight}px` }}
          >
            <BodyFrontSilhouette />
          </div>
        </div>

        {/* Right labels column */}
        <div className="flex flex-col justify-between">
          {rightPositions.map(renderLabel)}
        </div>
      </div>

      {/* Connection lines overlay */}
      <ConnectionLinesOverlay
        positions={MEASUREMENT_POSITIONS}
        hoveredField={hoveredField}
        containerWidth={containerWidth}
        containerHeight={containerHeight}
        labelColumnWidth={labelColumnWidth}
        svgWidth={svgWidth}
        svgOffsetY={svgOffsetY}
        labelHeight={config.height}
      />
    </div>
  )
}
