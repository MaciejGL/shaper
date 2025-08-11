import { Minus, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatNumberInput } from '@/lib/format-tempo'

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
  step = 1,
  disabled = false,
}: QuantityControlsProps) {
  const handleDecrement = () => {
    const newValue = Math.max(min, value - step)
    onChange(newValue)
  }

  const handleIncrement = () => {
    const newValue = max ? Math.min(max, value + step) : value + step
    onChange(newValue)
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="tertiary"
        size="sm"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
      >
        <Minus className="size-3" />
        {step > 1 && <span className="text-sm">{step}</span>}
      </Button>
      <Input
        id={id}
        variant="secondary"
        value={value}
        onChange={(e) => {
          const newValue = formatNumberInput(e)
          onChange(Number(newValue))
        }}
        className="w-24 text-right"
        type="text"
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        iconEnd={<span className="text-sm">{unit}</span>}
      />
      <Button
        variant="tertiary"
        size="sm"
        onClick={handleIncrement}
        disabled={disabled || (max !== undefined && value >= max)}
      >
        <Plus className="size-3" />
        {step > 1 && <span className="text-sm">{step}</span>}
      </Button>
    </div>
  )
}
