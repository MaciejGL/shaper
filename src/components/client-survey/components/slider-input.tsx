import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

interface SliderInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
  showValue?: boolean
  minLabel?: string
  maxLabel?: string
  hideLabel?: boolean
}

export function SliderInput({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  step = 1,
  className,
  showValue = true,
  minLabel,
  maxLabel,
  hideLabel = false,
}: SliderInputProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        {!hideLabel && <Label>{label}</Label>}
        {showValue && (
          <span className="text-sm font-medium text-primary ml-auto">
            {value}
          </span>
        )}
      </div>
      <Slider
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
      {(minLabel || maxLabel) && (
        <div className="flex justify-between text-xs text-muted-foreground">
          {minLabel && <span>{minLabel}</span>}
          {maxLabel && <span>{maxLabel}</span>}
        </div>
      )}
    </div>
  )
}
