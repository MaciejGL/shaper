import { forwardRef } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useWeightConversion } from '@/hooks/use-weight-conversion'

interface WeightInputProps {
  id?: string
  label?: string
  weightInKg?: number | null
  onWeightChange?: (weightInKg: number | null) => void
  showLabel?: boolean
  decimals?: number
  disabled?: boolean
  className?: string
  placeholder?: string
}

export const WeightInput = forwardRef<HTMLInputElement, WeightInputProps>(
  (
    {
      id,
      label,
      weightInKg,
      onWeightChange,
      showLabel = true,
      decimals = 1,
      disabled = false,
      className,
      placeholder,
    },
    ref,
  ) => {
    const { toDisplayWeight, toStorageWeight, getWeightLabel, weightUnit } =
      useWeightConversion()

    const displayWeight = toDisplayWeight(weightInKg)
    const inputValue = displayWeight?.toFixed(decimals) || ''

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value

      if (value === '' || value === null) {
        onWeightChange?.(null)
        return
      }

      const numericValue = parseFloat(value)
      if (isNaN(numericValue)) {
        return // Invalid input, don't update
      }

      const weightInKg = toStorageWeight(numericValue)
      onWeightChange?.(weightInKg)
    }

    const finalLabel = label || getWeightLabel()
    const inputId =
      id || `weight-input-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="space-y-2">
        {showLabel && (
          <Label htmlFor={inputId} className="text-sm">
            {finalLabel}
          </Label>
        )}
        <div className="relative">
          <Input
            ref={ref}
            id={inputId}
            value={inputValue}
            onChange={handleInputChange}
            disabled={disabled}
            className={className}
            placeholder={placeholder}
            iconEnd={
              <div className="text-sm text-muted-foreground pointer-events-none">
                {weightUnit}
              </div>
            }
          />
        </div>
      </div>
    )
  },
)

WeightInput.displayName = 'WeightInput'
