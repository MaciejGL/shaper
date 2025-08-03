import { Input } from '@/components/ui/input'
import { useWeightConversion } from '@/hooks/use-weight-conversion'

interface ExerciseWeightInputProps {
  setId: string
  weightInKg?: number | null
  onWeightChange: (weightInKg: number | null) => void
  placeholder?: string
  disabled?: boolean
}

export function ExerciseWeightInput({
  setId,
  weightInKg,
  onWeightChange,
  placeholder,
  disabled = false,
}: ExerciseWeightInputProps) {
  const { toDisplayWeight, toStorageWeight, weightUnit } = useWeightConversion()

  const displayWeight = toDisplayWeight(weightInKg)
  const inputValue = displayWeight?.toString() || ''

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    if (value === '' || value === null) {
      onWeightChange(null)
      return
    }

    const numericValue = parseFloat(value)
    if (isNaN(numericValue)) {
      return // Invalid input, don't update
    }

    const weightInKg = toStorageWeight(numericValue)
    onWeightChange(weightInKg)
  }

  return (
    <div className="relative">
      <Input
        id={`set-${setId}-weight`}
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        className="min-w-[96px] text-center pr-8"
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
        {weightUnit}
      </div>
    </div>
  )
}
