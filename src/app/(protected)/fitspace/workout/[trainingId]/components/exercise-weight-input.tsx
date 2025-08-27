import { useEffect, useState } from 'react'

import { Input } from '@/components/ui/input'
import { useWeightConversion } from '@/hooks/use-weight-conversion'
import { formatDecimalInput } from '@/lib/format-tempo'

interface ExerciseWeightInputProps {
  setId: string
  weightInKg?: number | null
  onWeightChange: (weightInKg: number | null) => void
  placeholder?: string
  disabled?: boolean
  showWeightUnit?: boolean
}

export function ExerciseWeightInput({
  setId,
  weightInKg,
  onWeightChange,
  placeholder,
  disabled = false,
  showWeightUnit = true,
}: ExerciseWeightInputProps) {
  const { toDisplayWeight, toStorageWeight, weightUnit } = useWeightConversion()

  // Local state to preserve user's typing experience
  const [inputValue, setInputValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  // Update local input value when weightInKg prop changes (but only when not focused)
  useEffect(() => {
    if (!isFocused) {
      const displayWeight = toDisplayWeight(weightInKg)
      setInputValue(displayWeight?.toString() || '')
    }
  }, [weightInKg, toDisplayWeight, isFocused])

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

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
  }

  return (
    <div className="relative">
      <Input
        id={`set-${setId}-weight`}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        inputMode="decimal"
        className="min-w-[80px] text-center"
        size="sm"
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
