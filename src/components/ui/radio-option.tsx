'use client'

import { cn } from '@/lib/utils'

interface RadioOptionProps<T extends string> {
  value: T
  selectedValue: T
  onChange: (value: T) => void
  label: string
  description?: string
  suffix?: string
  name: string
  variant?: 'default' | 'filled'
  className?: string
}

export function RadioOption<T extends string>({
  value,
  selectedValue,
  onChange,
  label,
  description,
  suffix,
  name,
  variant = 'default',
  className,
}: RadioOptionProps<T>) {
  const isSelected = selectedValue === value

  return (
    <label
      className={cn(
        'flex items-center p-4 rounded-lg border cursor-pointer transition-all duration-100 hover:bg-muted/50',
        isSelected
          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
          : 'border-border',
        className,
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={isSelected}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                variant === 'filled' && isSelected
                  ? 'border-primary bg-primary'
                  : isSelected
                    ? 'border-primary'
                    : 'border-gray-300',
              )}
            >
              {isSelected && (
                <div
                  className={cn(
                    'w-2 h-2 rounded-full',
                    variant === 'filled' ? 'bg-white' : 'bg-primary',
                  )}
                />
              )}
            </div>
            <span className="font-medium">
              {label}
              {suffix && ` ${suffix}`}
            </span>
          </div>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-1 ml-6">
            {description}
          </p>
        )}
      </div>
    </label>
  )
}
