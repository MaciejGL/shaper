import { CheckSquareIcon, SquareIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CheckboxGroupProps {
  options: { value: string; label: string }[]
  value: string[]
  onChange: (value: string[]) => void
  className?: string
}

export function CheckboxGroup({
  options,
  value,
  onChange,
  className,
}: CheckboxGroupProps) {
  const toggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue]
    onChange(newValue)
  }

  return (
    <div className={cn('grid grid-cols-1 gap-1', className)}>
      {options.map((option) => (
        <Button
          key={option.value}
          variant={value.includes(option.value) ? 'default' : 'tertiary'}
          onClick={() => toggleOption(option.value)}
          className="h-auto p-3 justify-start gap-2"
          iconStart={
            value.includes(option.value) ? (
              <CheckSquareIcon />
            ) : (
              <SquareIcon className="text-muted-foreground" />
            )
          }
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
