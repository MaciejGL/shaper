import { Minus, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDisplayUnits } from '@/hooks/use-display-units'
import { formatDecimalInput } from '@/lib/format-tempo'

interface QuantityControlsProps {
  id: string
  value: number
  unit: string
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
}

export function QuantityControls({
  id,
  value,
  unit,
  onChange,
  min = 0,
  max,
  step,
  disabled = false,
}: QuantityControlsProps) {
  const { convertToDisplayUnit, convertFromDisplayUnit, getStepForUnit } =
    useDisplayUnits()

  // Convert storage value to display value
  const displayConversion = convertToDisplayUnit(value, unit)
  const [displayValue, setDisplayValue] = useState(displayConversion.quantity)
  const [isFocused, setIsFocused] = useState(false)

  // Update display value when storage value changes (but only when not focused)
  useEffect(() => {
    if (!isFocused) {
      const newDisplayConversion = convertToDisplayUnit(value, unit)
      setDisplayValue(newDisplayConversion.quantity)
    }
  }, [value, unit, convertToDisplayUnit, isFocused])

  // Use smart step based on display unit, or provided step
  const effectiveStep = step || getStepForUnit(displayConversion.unit)

  const handleDecrement = () => {
    const newDisplayValue = Math.max(0, displayValue - effectiveStep)
    setDisplayValue(newDisplayValue)

    // Convert back to storage unit and call onChange
    const storageValue = convertFromDisplayUnit(
      newDisplayValue,
      displayConversion.unit,
      unit,
    )
    const finalValue = Math.max(min, storageValue)
    onChange(finalValue)
  }

  const handleIncrement = () => {
    const newDisplayValue = displayValue + effectiveStep
    const maxDisplayValue = max
      ? convertToDisplayUnit(max, unit).quantity
      : undefined
    const finalDisplayValue = maxDisplayValue
      ? Math.min(maxDisplayValue, newDisplayValue)
      : newDisplayValue

    setDisplayValue(finalDisplayValue)

    // Convert back to storage unit and call onChange
    const storageValue = convertFromDisplayUnit(
      finalDisplayValue,
      displayConversion.unit,
      unit,
    )
    const finalValue = max ? Math.min(max, storageValue) : storageValue
    onChange(finalValue)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = formatDecimalInput(e)
    const numericValue = parseFloat(sanitizedValue) || 0
    setDisplayValue(numericValue)

    // Convert back to storage unit and call onChange
    const storageValue = convertFromDisplayUnit(
      numericValue,
      displayConversion.unit,
      unit,
    )
    onChange(storageValue)
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="tertiary"
        size="sm"
        onClick={handleDecrement}
        disabled={disabled || displayValue <= 0}
      >
        <Minus className="size-3" />
        {effectiveStep > 1 && <span className="text-sm">{effectiveStep}</span>}
      </Button>
      <Input
        id={id}
        variant="secondary"
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="w-24 text-right"
        type="text"
        step={effectiveStep}
        disabled={disabled}
        iconEnd={<span className="text-sm">{displayConversion.unit}</span>}
      />
      <Button
        variant="tertiary"
        size="sm"
        onClick={handleIncrement}
        disabled={disabled}
      >
        <Plus className="size-3" />
        {effectiveStep > 1 && <span className="text-sm">{effectiveStep}</span>}
      </Button>
    </div>
  )
}
