'use client'

import { Input } from '@/components/ui/input'
import { useCircumferenceConversion } from '@/hooks/use-circumference-conversion'
import { cn } from '@/lib/utils'

// Format number - remove .0 for whole numbers
function formatValue(value: number): string {
  return value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)
}

interface MeasurementInputLabelProps {
  label: string
  value: string
  lastValue?: number
  side: 'left' | 'right'
  onChange: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
}

export function MeasurementInputLabel({
  label,
  value,
  lastValue,
  side,
  onChange,
  onFocus,
  onBlur,
}: MeasurementInputLabelProps) {
  const { circumferenceUnit, toDisplayCircumference } =
    useCircumferenceConversion()
  const hasValue = value !== ''

  const displayLastValue = lastValue
    ? toDisplayCircumference(lastValue)
    : undefined
  const placeholder = displayLastValue ? formatValue(displayLastValue) : ''

  return (
    <div
      className={cn(
        'flex flex-col gap-0.5 w-full',
        side === 'left' ? 'items-end' : 'items-start',
      )}
    >
      <span
        className={cn(
          'text-[10px] font-medium whitespace-nowrap uppercase tracking-wide',
          hasValue ? 'text-foreground' : 'text-muted-foreground/70',
        )}
      >
        {label}
      </span>
      <Input
        id={`measurement-input-${label}`}
        type="number"
        inputMode="decimal"
        step="0.1"
        size="sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        iconEnd={circumferenceUnit}
        className={cn(
          'w-full px-1.5 text-sm rounded-md',
          'bg-primary/5 dark:bg-primary/8',
          'placeholder:text-muted-foreground/40',
          'transition-all duration-200',
          'focus-visible:ring-1 focus-visible:ring-primary',
          hasValue && 'ring-1 ring-primary/40 bg-primary/10',
        )}
      />
    </div>
  )
}
