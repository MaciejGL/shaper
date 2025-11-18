import { Minus, Plus } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface StepperInputProps {
  value?: string | number
  label?: string
  htmlFor?: string
  onIncrement: () => void
  onDecrement: () => void
  children: React.ReactNode
  className?: string
}

export function StepperInput({
  label,
  onIncrement,
  onDecrement,
  children,
  className,
  htmlFor,
}: StepperInputProps) {
  return (
    <div className="space-y-1 flex flex-col items-center">
      {label && (
        <label htmlFor={htmlFor} className="text-xs">
          {label}
        </label>
      )}
      <div
        className={cn('grid grid-cols-[auto_1fr_auto] items-center', className)}
      >
        <Button
          type="button"
          size="icon-lg"
          variant="tertiary"
          iconOnly={<Minus />}
          onClick={onDecrement}
          className="shrink-0 rounded-r-none"
        />
        {children}
        <Button
          type="button"
          size="icon-lg"
          variant="tertiary"
          iconOnly={<Plus />}
          onClick={onIncrement}
          className="shrink-0 rounded-l-none"
        />
      </div>
    </div>
  )
}

export function getWeightIncrement(currentValue: number): number {
  if (currentValue < 10) {
    return 0.25
  }
  return 2.5
}

export function getRepsIncrement(): number {
  return 1
}

export function incrementValue(
  currentValue: string | null,
  getIncrement: (val: number) => number,
): string {
  const numValue = currentValue ? parseFloat(currentValue) : 0
  if (isNaN(numValue)) return '0'

  const increment = getIncrement(numValue)
  const newValue = Math.round((numValue + increment) * 100) / 100

  return newValue.toString()
}

export function decrementValue(
  currentValue: string | null,
  getIncrement: (val: number) => number,
): string {
  const numValue = currentValue ? parseFloat(currentValue) : 0
  if (isNaN(numValue)) return '0'

  const increment = getIncrement(numValue)
  const newValue = Math.max(0, Math.round((numValue - increment) * 100) / 100)

  return newValue.toString()
}
