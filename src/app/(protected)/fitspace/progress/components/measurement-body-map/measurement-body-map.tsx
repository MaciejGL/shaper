'use client'

import { useEffect, useRef, useState } from 'react'

import { BodyFrontSilhouette } from '@/components/human-body/body-front-silhouette'

import { MeasurementFieldEnum } from '../measurement-constants'

import { MeasurementConnectionLine } from './measurement-connection-line'
import { MeasurementInputLabel } from './measurement-input-label'
import { MeasurementPosition } from './types'

// ============================================================================
// Types & Constants
// ============================================================================

type LabelSize = 'sm' | 'md'

interface LabelSizeConfig {
  height: number
  labelWidth: number
  gap: number
}

const LABEL_SIZE_CONFIG: Record<LabelSize, LabelSizeConfig> = {
  sm: {
    height: 42,
    labelWidth: 88,
    gap: 4,
  },
  md: {
    height: 52,
    labelWidth: 100,
    gap: 8,
  },
}

// Base dimensions for SVG body (original design at 170x340)
const BASE_SVG_WIDTH = 170
const BASE_SVG_HEIGHT = 340
const ASPECT_RATIO = BASE_SVG_HEIGHT / BASE_SVG_WIDTH

// Gap between labels and SVG
const COLUMN_GAP = 8

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
  const totalLabelsHeight = labelCount * labelHeight
  const totalGapSpace = containerHeight - totalLabelsHeight
  const gapBetween = totalGapSpace / (labelCount - 1)

  const labelTop = index * (labelHeight + gapBetween)
  return labelTop + labelHeight / 2
}

// ============================================================================
// Subcomponents
// ============================================================================

interface ConnectionLinesOverlayProps {
  positions: MeasurementPosition[]
  focusedField: MeasurementFieldEnum | null
  // Layout dimensions
  containerWidth: number
  containerHeight: number
  labelColumnWidth: number
  svgWidth: number
  svgOffsetY: number
  labelHeight: number
}

function ConnectionLinesOverlay({
  positions,
  focusedField,
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
            ? labelColumnWidth
            : labelColumnWidth + COLUMN_GAP + svgWidth + COLUMN_GAP

        return (
          <MeasurementConnectionLine
            key={pos.field}
            bodyX={bodyX}
            bodyY={bodyY}
            inputX={labelX}
            inputY={labelY}
            side={pos.side}
            isFocused={focusedField === pos.field}
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

interface MeasurementBodyMapProps {
  values: Record<MeasurementFieldEnum, string>
  lastValues: Record<MeasurementFieldEnum, number | undefined>
  onChange: (field: MeasurementFieldEnum, value: string) => void
  size?: LabelSize
}

export function MeasurementBodyMap({
  values,
  lastValues,
  onChange,
  size = 'md',
}: MeasurementBodyMapProps) {
  const [focusedField, setFocusedField] = useState<MeasurementFieldEnum | null>(
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

  const renderInput = (pos: MeasurementPosition) => (
    <div
      key={pos.field}
      style={{ height: `${config.height}px` }}
      className="flex items-center"
    >
      <MeasurementInputLabel
        label={pos.label}
        value={values[pos.field]}
        lastValue={lastValues[pos.field]}
        side={pos.side}
        onChange={(value) => onChange(pos.field, value)}
        onFocus={() => setFocusedField(pos.field)}
        onBlur={() => setFocusedField(null)}
      />
    </div>
  )

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
        {/* Left inputs column */}
        <div className="flex flex-col justify-between">
          {leftPositions.map(renderInput)}
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

        {/* Right inputs column */}
        <div className="flex flex-col justify-between">
          {rightPositions.map(renderInput)}
        </div>
      </div>

      {/* Connection lines overlay */}
      <ConnectionLinesOverlay
        positions={MEASUREMENT_POSITIONS}
        focusedField={focusedField}
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
