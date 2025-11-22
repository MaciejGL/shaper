import { useEffect, useState } from 'react'

import { Input } from '@/components/ui/input'
import { useWeightConversion } from '@/hooks/use-weight-conversion'
import { formatDecimalInput, formatNumberSmart } from '@/lib/format-tempo'

interface ExerciseWeightInputProps {
  setId: string
  weightInKg?: number | null
  onWeightChange: (weightInKg: number | null) => void
  placeholder?: string
  disabled?: boolean
  showWeightUnit?: boolean
  decimals?: number
}

export function ExerciseWeightInput({
  setId,
  weightInKg,
  onWeightChange,
  placeholder,
  disabled = false,
  showWeightUnit = true,
  decimals = 2,
}: ExerciseWeightInputProps) {
  const { toDisplayWeight, toStorageWeight, weightUnit } = useWeightConversion()

  // Local state to preserve user's typing experience
  const [inputValue, setInputValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  // Update local input value when weightInKg prop changes (but only when not focused)
  useEffect(() => {
    if (!isFocused) {
      const displayWeight = toDisplayWeight(weightInKg)
      const formattedValue =
        displayWeight !== null ? formatNumberSmart(displayWeight, decimals) : ''
      setInputValue(formattedValue)
    }
  }, [weightInKg, toDisplayWeight, decimals, isFocused])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Use formatDecimalInput to allow decimal points but clean other characters
    const sanitizedValue = formatDecimalInput(e)
    setInputValue(sanitizedValue)

    if (sanitizedValue === '' || sanitizedValue === null) {
      onWeightChange(null)
      return
    }

    const numericValue = parseFloat(sanitizedValue)
    if (isNaN(numericValue)) {
      return // Invalid input, don't update
    }

    const weightInKg = toStorageWeight(numericValue)
    onWeightChange(weightInKg)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Explicitly allow comma input as decimal separator
    if (
      e.key === ',' &&
      !inputValue.includes('.') &&
      !inputValue.includes(',')
    ) {
      e.preventDefault()
      const newValue = inputValue + '.'
      setInputValue(newValue)
    }
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

  return (
    <div className="relative">
      <Input
        id={`set-${setId}-weight`}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        inputMode="decimal"
        className="text-center h-8 focus-visible:ring-0 text-sm w-full"
        variant="secondary"
        size="lg"
        iconEnd={
          showWeightUnit ? (
            <div className="text-xs text-muted-foreground pointer-events-none">
              {weightUnit}
            </div>
          ) : null
        }
      />
    </div>
  )
}
