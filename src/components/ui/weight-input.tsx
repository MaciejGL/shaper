import { forwardRef, useEffect, useState } from 'react'

import { Input } from '@/components/ui/input'
import { useWeightConversion } from '@/hooks/use-weight-conversion'
import { formatDecimalInput, formatNumberSmart } from '@/lib/format-tempo'

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

    // Local state to preserve user's typing experience
    const [inputValue, setInputValue] = useState('')
    const [isFocused, setIsFocused] = useState(false)

    // Update local input value when weightInKg prop changes (but only when not focused)
    useEffect(() => {
      if (!isFocused) {
        const displayWeight = toDisplayWeight(weightInKg)
        const formattedValue =
          displayWeight !== null
            ? formatNumberSmart(displayWeight, decimals)
            : ''
        setInputValue(formattedValue)
      }
    }, [weightInKg, toDisplayWeight, decimals, isFocused])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Use formatDecimalInput to allow decimal points but clean other characters
      const formattedValue = formatDecimalInput(e)
      setInputValue(formattedValue)

      if (formattedValue === '' || formattedValue === null) {
        onWeightChange?.(null)
        return
      }

      const numericValue = parseFloat(formattedValue)
      if (isNaN(numericValue)) {
        return // Invalid input, don't update parent
      }

      const weightInKg = toStorageWeight(numericValue)
      onWeightChange?.(weightInKg)
    }

    const handleFocus = () => {
      setIsFocused(true)
    }

    const handleBlur = () => {
      setIsFocused(false)
      // Format the value when focus is lost
      const numericValue = parseFloat(inputValue)
      if (!isNaN(numericValue)) {
        const displayWeight = toDisplayWeight(toStorageWeight(numericValue))
        if (displayWeight !== null) {
          setInputValue(formatNumberSmart(displayWeight, decimals))
        }
      }
    }

    const finalLabel = label || getWeightLabel()
    const inputId =
      id || `weight-input-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="relative">
        <Input
          ref={ref}
          id={inputId}
          value={inputValue}
          label={showLabel ? finalLabel : undefined}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className={className}
          placeholder={placeholder}
          variant="secondary"
          iconEnd={
            <div className="text-sm text-muted-foreground pointer-events-none">
              {weightUnit}
            </div>
          }
        />
      </div>
    )
  },
)

WeightInput.displayName = 'WeightInput'
