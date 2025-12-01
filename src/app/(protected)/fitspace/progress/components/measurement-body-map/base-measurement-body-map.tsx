'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'

import { BodyFrontSilhouette } from '@/components/human-body/body-front-silhouette'
import { useUser } from '@/context/user-context'

import { MeasurementFieldEnum } from '../measurement-constants'

import { MeasurementConnectionLine } from './measurement-connection-line'
import { MeasurementPosition } from './types'

// ============================================================================
// Types & Constants (Exported for use by wrapper components)
// ============================================================================

export type LabelSize = 'sm' | 'md'

export interface LabelSizeConfig {
  height: number
  labelWidth: number
  valueBoxHeight: number
  valueBoxWidth: number
  labelFontSize: string
  valueFontSize: string
  gap: number
}

export const LABEL_SIZE_CONFIG: Record<LabelSize, LabelSizeConfig> = {
  sm: {
    height: 38,
    labelWidth: 88,
    valueBoxHeight: 30,
    valueBoxWidth: 80,
    labelFontSize: 'text-[9px]',
    valueFontSize: 'text-sm',
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

// Body points for connection lines (relative to base 170x340 SVG)
// inputY is the label index (0-4) for ordering
// Male coordinates adjusted for wider body (194 vs 174 for female)
export const MEASUREMENT_POSITIONS: MeasurementPosition[] = [
  // Left side (order matters - top to bottom)
  {
    field: MeasurementFieldEnum.Neck,
    label: 'Neck',
    femaleBodyX: 86,
    femaleBodyY: 74,
    maleBodyX: 84,
    maleBodyY: 50,
    inputX: 0,
    inputY: 0,
    side: 'left',
  },
  {
    field: MeasurementFieldEnum.BicepsLeft,
    label: 'L. Bicep',
    femaleBodyX: 47,
    femaleBodyY: 110,
    maleBodyX: 42,
    maleBodyY: 101,
    inputX: 0,
    inputY: 1,
    side: 'left',
  },
  {
    field: MeasurementFieldEnum.Waist,
    label: 'Waist',
    femaleBodyX: 85,
    femaleBodyY: 145,
    maleBodyX: 85,
    maleBodyY: 136,
    inputX: 0,
    inputY: 2,
    side: 'left',
  },
  {
    field: MeasurementFieldEnum.ThighLeft,
    label: 'L. Thigh',
    femaleBodyX: 61,
    femaleBodyY: 220,
    maleBodyX: 61,
    maleBodyY: 208,
    inputX: 0,
    inputY: 3,
    side: 'left',
  },
  {
    field: MeasurementFieldEnum.CalfLeft,
    label: 'L. Calf',
    femaleBodyX: 64,
    femaleBodyY: 310,
    maleBodyX: 64,
    maleBodyY: 290,
    inputX: 0,
    inputY: 4,
    side: 'left',
  },
  // Right side (order matters - top to bottom)
  {
    field: MeasurementFieldEnum.Chest,
    label: 'Chest',
    femaleBodyX: 95,
    femaleBodyY: 102,
    maleBodyX: 98,
    maleBodyY: 82,
    inputX: 0,
    inputY: 0,
    side: 'right',
  },
  {
    field: MeasurementFieldEnum.BicepsRight,
    label: 'R. Bicep',
    femaleBodyX: 123,
    femaleBodyY: 110,
    maleBodyX: 129,
    maleBodyY: 101,
    inputX: 0,
    inputY: 1,
    side: 'right',
  },
  {
    field: MeasurementFieldEnum.Hips,
    label: 'Hips',
    femaleBodyX: 100,
    femaleBodyY: 175,
    maleBodyX: 99,
    maleBodyY: 166,
    inputX: 0,
    inputY: 2,
    side: 'right',
  },
  {
    field: MeasurementFieldEnum.ThighRight,
    label: 'R. Thigh',
    femaleBodyX: 110,
    femaleBodyY: 220,
    maleBodyX: 110,
    maleBodyY: 208,
    inputX: 0,
    inputY: 3,
    side: 'right',
  },
  {
    field: MeasurementFieldEnum.CalfRight,
    label: 'R. Calf',
    femaleBodyX: 107,
    femaleBodyY: 310,
    maleBodyX: 107,
    maleBodyY: 290,
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
// Connection Lines Overlay (Internal)
// ============================================================================

interface ConnectionLinesOverlayProps {
  positions: MeasurementPosition[]
  hoveredField: MeasurementFieldEnum | null
  containerWidth: number
  containerHeight: number
  labelColumnWidth: number
  svgWidth: number
  svgOffsetY: number
  labelHeight: number
  isMale: boolean
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
  isMale,
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
        // Use male-specific coordinates if available and user is male
        const rawBodyX =
          isMale && pos.maleBodyX !== undefined
            ? pos.maleBodyX
            : pos.femaleBodyX
        const rawBodyY =
          isMale && pos.maleBodyY !== undefined
            ? pos.maleBodyY
            : pos.femaleBodyY

        const bodyX = svgOffsetX + rawBodyX * scale
        const bodyY = svgOffsetY + rawBodyY * scale

        const labelIndex = pos.inputY
        const labelY = getLabelCenterY(
          labelIndex,
          containerHeight,
          labelHeight,
          LABEL_COUNT,
        )

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
            isFocused={hoveredField === pos.field}
            useAbsoluteCoords
          />
        )
      })}
    </svg>
  )
}

// ============================================================================
// Main Base Component
// ============================================================================

export interface LabelRenderProps {
  position: MeasurementPosition
  config: LabelSizeConfig
}

export interface BaseMeasurementBodyMapProps {
  size?: LabelSize
  renderLabel: (props: LabelRenderProps) => ReactNode
  hoveredField?: MeasurementFieldEnum | null
}

export function BaseMeasurementBodyMap({
  size = 'md',
  renderLabel,
  hoveredField = null,
}: BaseMeasurementBodyMapProps) {
  const { user } = useUser()
  const isMale = user?.profile?.sex !== 'Female'

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
          {leftPositions.map((pos) => (
            <div key={pos.field}>{renderLabel({ position: pos, config })}</div>
          ))}
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
          {rightPositions.map((pos) => (
            <div key={pos.field}>{renderLabel({ position: pos, config })}</div>
          ))}
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
        isMale={isMale}
      />
    </div>
  )
}
