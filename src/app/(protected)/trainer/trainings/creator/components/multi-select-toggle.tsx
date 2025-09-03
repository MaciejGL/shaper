'use client'

import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface MultiSelectToggleOption<T> {
  value: T
  label: string
}

interface MultiSelectToggleProps<T> {
  label: string
  description?: string
  options: MultiSelectToggleOption<T>[]
  selected: T[]
  onChange: (selected: T[]) => void
  disabled?: boolean
  className?: string
  maxSelected?: number
}

export function MultiSelectToggle<T extends string>({
  label,
  description,
  options,
  selected,
  onChange,
  disabled = false,
  className,
  maxSelected = 3,
}: MultiSelectToggleProps<T>) {
  const handleToggle = (value: T) => {
    if (disabled) return

    const isSelected = selected.includes(value)
    if (isSelected) {
      onChange(selected.filter((item) => item !== value))
    } else {
      if (selected.length >= maxSelected) {
        toast.info(`You can only select up to ${maxSelected} items`)
        return
      }
      if (selected.length < maxSelected) {
        onChange([...selected, value])
      }
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="space-y-1">
        <Label className="text-sm font-medium">{label}</Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option.value)
          return (
            <Badge
              key={option.value}
              size="lg"
              variant={isSelected ? 'primary' : 'outline'}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:scale-105',
                disabled && 'cursor-not-allowed opacity-50',
                isSelected && 'ring-2 ring-primary/20',
              )}
              onClick={() => handleToggle(option.value)}
            >
              {option.label}
            </Badge>
          )
        })}
      </div>
    </div>
  )
}
