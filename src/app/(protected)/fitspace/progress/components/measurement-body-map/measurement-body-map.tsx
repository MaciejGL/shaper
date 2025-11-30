'use client'

import { useState } from 'react'

import { FrontBodyView } from '@/components/human-body/body-front/body-front'

import { MeasurementFieldEnum } from '../measurement-constants'

import { MeasurementConnectionLine } from './measurement-connection-line'
import { MeasurementInputLabel } from './measurement-input-label'
import { MeasurementPosition } from './types'

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

interface MeasurementBodyMapProps {
  values: Record<MeasurementFieldEnum, string>
  lastValues: Record<MeasurementFieldEnum, number | undefined>
  onChange: (field: MeasurementFieldEnum, value: string) => void
}

const noopGetPathProps = () => ({
  className:
    'fill-muted-foreground/15 dark:fill-muted-foreground/10 pointer-events-none',
  onClick: () => {},
})

const noopHandler = () => false

export function MeasurementBodyMap({
  values,
  lastValues,
  onChange,
}: MeasurementBodyMapProps) {
  const [focusedField, setFocusedField] = useState<MeasurementFieldEnum | null>(
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
        {measurementPositions.map((pos) => (
          <MeasurementConnectionLine
            key={pos.field}
            bodyX={pos.bodyX}
            bodyY={pos.bodyY}
            inputX={pos.inputX}
            inputY={pos.inputY}
            side={pos.side}
            hasValue={values[pos.field] !== ''}
            isFocused={focusedField === pos.field}
          />
        ))}
      </svg>

      {/* Input labels positioned absolutely */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ width: `${SVG_WIDTH}px`, height: `${SVG_HEIGHT}px` }}
      >
        {measurementPositions.map((pos) => (
          <MeasurementInputLabel
            key={pos.field}
            label={pos.label}
            value={values[pos.field]}
            lastValue={lastValues[pos.field]}
            inputX={pos.inputX}
            inputY={pos.inputY}
            side={pos.side}
            onChange={(value) => onChange(pos.field, value)}
            onFocus={() => setFocusedField(pos.field)}
            onBlur={() => setFocusedField(null)}
          />
        ))}
      </div>
    </div>
  )
}
