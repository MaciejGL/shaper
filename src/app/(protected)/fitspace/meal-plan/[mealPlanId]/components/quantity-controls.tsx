import { Minus, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value) || 0
    const clampedValue = Math.max(min, max ? Math.min(max, newValue) : newValue)
    onChange(clampedValue)
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="secondary"
        size="icon-sm"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        iconOnly={<Minus />}
      />
      <Input
        id={id}
        variant="secondary"
        value={value}
        onChange={handleInputChange}
        className="w-24 text-right"
        type="number"
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        iconEnd={<span className="text-sm">{unit}</span>}
      />
      <Button
        variant="secondary"
        size="icon-sm"
        onClick={handleIncrement}
        disabled={disabled || (max !== undefined && value >= max)}
      >
        <Plus className="size-3" />
      </Button>
    </div>
  )
}
