'use client'

import * as React from 'react'

import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'

export interface RadioGridOption<T extends string> {
  value: T
  label: string
  description?: string
  icon?: React.ReactNode
}

interface RadioGridGroupProps<T extends string> {
  /** The currently selected value */
  value: T
  /** Callback when selection changes */
  onValueChange: (value: T) => void
  /** Array of options to display */
  options: RadioGridOption<T>[]
  /** Number of columns in the grid (default: 2) */
  columns?: number
  /** Additional CSS classes for the container */
  className?: string
  /** Additional CSS classes for individual option items */
  itemClassName?: string
  /** Optional description text shown below the options */
  description?: string
}

/**
 * A reusable radio group component that displays options in a grid layout.
 * Commonly used for preferences and settings where users choose between multiple options.
 *
 * @example
 * ```tsx
 * const weightOptions = [
 *   { value: 'kg', label: 'Kilograms (kg)' },
 *   { value: 'lbs', label: 'Pounds (lbs)' }
 * ]
 *
 * <RadioButtons
 *   value={selectedWeight}
 *   onValueChange={setSelectedWeight}
 *   options={weightOptions}
 *   columns={2}
 * />
 * ```
 */
export function RadioButtons<T extends string>({
  value,
  onValueChange,
  options,
  columns = 2,
  className,
  itemClassName,
  description,
}: RadioGridGroupProps<T>) {
  return (
    <div className={cn('space-y-3', className)}>
      <RadioGroup
        className={cn('grid gap-1', `grid-cols-${columns}`)}
        value={value}
        onValueChange={onValueChange}
      >
        {options.map((option) => (
          <Label
            key={option.value}
            htmlFor={option.value}
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-md cursor-pointer transition-colors',
              'bg-card-on-card dark:hover:bg-card-on-card/80 hover:bg-primary/10',
              value === option.value && 'bg-primary/20',
              itemClassName,
            )}
          >
            <RadioGroupItem
              value={option.value}
              id={option.value}
              className={itemClassName}
            />
            <div className="flex-1">
              <span className="text-sm font-medium">{option.label}</span>
              {option.description && (
                <p className="text-xs text-muted-foreground">
                  {option.description}
                </p>
              )}
            </div>
            {option.icon && option.icon}
          </Label>
        ))}
      </RadioGroup>

      {description && (
        <p className="text-xs text-muted-foreground whitespace-pre-line">
          {description}
        </p>
      )}
    </div>
  )
}
