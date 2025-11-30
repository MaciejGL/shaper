'use client'

import { useState } from 'react'

import { FrontBodyView } from '@/components/human-body/body-front/body-front'
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

// Map fields to their categories
const circumferenceFields = ['chest', 'waist', 'hips', 'neck']
const limbFields = [
  'bicepsLeft',
  'bicepsRight',
  'thighLeft',
  'thighRight',
  'calfLeft',
  'calfRight',
]

function getCategoryForField(field: string) {
  if (circumferenceFields.includes(field)) {
    return measurementCategories[1] // circumferences
  }
  if (limbFields.includes(field)) {
    return measurementCategories[2] // limbs
  }
  return measurementCategories[1] // default
}

const SVG_WIDTH = 170
const SVG_HEIGHT = 340
const CONTAINER_HEIGHT = 340

const measurementPositions: MeasurementPosition[] = [
  // Left side measurements (scaled to 170x340 from original 200x400)
  {
    field: MeasurementFieldEnum.Neck,
    label: 'Neck',
    bodyX: 86,
    bodyY: 63,
    inputX: -16,
    inputY: 55,
    side: 'left',
  },
  {
    field: MeasurementFieldEnum.BicepsLeft,
    label: 'L. Bicep',
    bodyX: 47,
    bodyY: 110,
    inputX: -16,
    inputY: 110,
    side: 'left',
  },
  {
    field: MeasurementFieldEnum.Waist,
    label: 'Waist',
    bodyX: 85,
    bodyY: 136,
    inputX: -16,
    inputY: 165,
    side: 'left',
  },
  {
    field: MeasurementFieldEnum.ThighLeft,
    label: 'L. Thigh',
    bodyX: 68,
    bodyY: 196,
    inputX: -16,
    inputY: 220,
    side: 'left',
  },
  {
    field: MeasurementFieldEnum.CalfLeft,
    label: 'L. Calf',
    bodyX: 64,
    bodyY: 264,
    inputX: -16,
    inputY: 295,
    side: 'left',
  },
  // Right side measurements
  {
    field: MeasurementFieldEnum.Chest,
    label: 'Chest',
    bodyX: 85,
    bodyY: 89,
    inputX: 167,
    inputY: 55,
    side: 'right',
  },
  {
    field: MeasurementFieldEnum.BicepsRight,
    label: 'R. Bicep',
    bodyX: 123,
    bodyY: 110,
    inputX: 167,
    inputY: 110,
    side: 'right',
  },
  {
    field: MeasurementFieldEnum.Hips,
    label: 'Hips',
    bodyX: 85,
    bodyY: 157,
    inputX: 167,
    inputY: 165,
    side: 'right',
  },
  {
    field: MeasurementFieldEnum.ThighRight,
    label: 'R. Thigh',
    bodyX: 102,
    bodyY: 196,
    inputX: 167,
    inputY: 220,
    side: 'right',
  },
  {
    field: MeasurementFieldEnum.CalfRight,
    label: 'R. Calf',
    bodyX: 106,
    bodyY: 264,
    inputX: 167,
    inputY: 295,
    side: 'right',
  },
]

const noopGetPathProps = () => ({
  className:
    'fill-muted-foreground/15 dark:fill-muted-foreground/10 pointer-events-none',
  onClick: () => {},
})

const noopHandler = () => false

export function MeasurementBodyMapDisplay() {
  const { bodyMeasures, getLatestMeasurement, onMeasurementAdded } =
    useBodyMeasurementsContext()
  const { toDisplayCircumference, circumferenceUnit } =
    useCircumferenceConversion()
  const [hoveredField, setHoveredField] = useState<MeasurementFieldEnum | null>(
    null,
  )

  return (
    <div
      className="relative w-full"
      style={{ height: `${CONTAINER_HEIGHT}px` }}
    >
      {/* Body silhouette using existing FrontBodyView */}
      <div className="absolute [&_svg]:w-[170px] [&_svg]:h-[340px] left-1/2 -translate-x-1/2 pointer-events-none opacity-60">
        <FrontBodyView
          getPathProps={noopGetPathProps}
          isRegionSelected={noopHandler}
          handleRegionClick={() => {}}
          hideLabels={true}
        />
      </div>

      {/* SVG overlay for connection lines */}
      <svg
        width={SVG_WIDTH}
        height={SVG_HEIGHT}
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
      >
        {measurementPositions.map((pos) => {
          const field = pos.field as MeasurementField
          const value = getLatestMeasurement(field)
          return (
            <MeasurementConnectionLine
              key={pos.field}
              bodyX={pos.bodyX}
              bodyY={pos.bodyY}
              inputX={pos.inputX}
              inputY={pos.inputY}
              side={pos.side}
              hasValue={value !== undefined && value !== null}
              isFocused={hoveredField === pos.field}
            />
          )
        })}
      </svg>

      {/* Display labels positioned absolutely */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ width: `${SVG_WIDTH}px`, height: `${SVG_HEIGHT}px` }}
      >
        {measurementPositions.map((pos) => {
          const field = pos.field as MeasurementField
          const rawValue = getLatestMeasurement(field)
          const displayValue = rawValue
            ? toDisplayCircumference(rawValue)
            : null
          const hasValue = displayValue !== null

          const category = getCategoryForField(field)
          const fieldMeasurements = bodyMeasures.filter(
            (m) => m[field] !== null && m[field] !== undefined,
          )
          const hasFieldData = fieldMeasurements.length > 0

          const labelContent = (
            <div
              className={cn(
                'absolute flex flex-col gap-0.5 -translate-y-1/2',
                pos.side === 'left' ? 'items-end' : 'items-start',
                hasFieldData ? 'cursor-pointer' : 'cursor-default',
              )}
              style={{
                top: `${pos.inputY}px`,
                left:
                  pos.side === 'left'
                    ? `${pos.inputX - 80}px`
                    : `${pos.inputX}px`,
              }}
              onMouseEnter={() => hasFieldData && setHoveredField(pos.field)}
              onMouseLeave={() => hasFieldData && setHoveredField(null)}
            >
              <span
                className={cn(
                  'text-[10px] font-medium whitespace-nowrap uppercase tracking-wide',
                  hasValue ? 'text-foreground' : 'text-muted-foreground/70',
                )}
              >
                {pos.label}
              </span>
              <div
                className={cn(
                  'w-24 h-7 px-1.5 text-xs rounded-md flex items-center',
                  'bg-primary/5 dark:bg-primary/8',
                  'transition-all duration-200',
                  pos.side === 'left' ? 'justify-end' : 'justify-start',
                  hasValue && 'ring-1 ring-primary/40 bg-primary/10',
                  hoveredField === pos.field && 'ring-1 ring-primary',
                )}
              >
                {hasValue ? (
                  <span className="text-foreground">
                    {displayValue?.toFixed(1)}{' '}
                    <span className="text-muted-foreground text-[10px]">
                      {circumferenceUnit}
                    </span>
                  </span>
                ) : (
                  <span className="text-muted-foreground/40">—</span>
                )}
              </div>
            </div>
          )

          if (hasFieldData) {
            return (
              <MeasurementCategoryDrawer
                key={pos.field}
                category={category}
                measurements={fieldMeasurements}
                onUpdate={onMeasurementAdded}
                focusField={field}
              >
                <button className="contents">{labelContent}</button>
              </MeasurementCategoryDrawer>
            )
          }

          return <div key={pos.field}>{labelContent}</div>
        })}
      </div>
    </div>
  )
}
