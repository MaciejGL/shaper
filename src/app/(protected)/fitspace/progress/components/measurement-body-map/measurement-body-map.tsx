'use client'

import { useState } from 'react'

import { MeasurementFieldEnum } from '../measurement-constants'

import { BaseMeasurementBodyMap, LabelSize } from './base-measurement-body-map'
import { MeasurementInputLabel } from './measurement-input-label'

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

  return (
    <BaseMeasurementBodyMap
      size={size}
      hoveredField={focusedField}
      renderLabel={({ position, config }) => (
        <div
          style={{ height: `${config.height}px` }}
          className="flex items-center"
        >
          <MeasurementInputLabel
            label={position.label}
            value={values[position.field]}
            lastValue={lastValues[position.field]}
            side={position.side}
            onChange={(value) => onChange(position.field, value)}
            onFocus={() => setFocusedField(position.field)}
            onBlur={() => setFocusedField(null)}
          />
        </div>
      )}
    />
  )
}
