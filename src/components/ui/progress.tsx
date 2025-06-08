'use client'

import * as ProgressPrimitive from '@radix-ui/react-progress'
import * as React from 'react'

import { cn } from '@/lib/utils'

function Progress({
  className,
  value = 0,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const fallbackValue = value ?? 0
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        'bg-primary/20 relative h-2 w-full overflow-hidden rounded-full',
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn('bg-primary h-full w-full flex-1 transition-all', {
          'bg-amber-50': fallbackValue >= 10,
          'bg-amber-100': fallbackValue >= 20,
          'bg-amber-200': fallbackValue >= 30,
          'bg-amber-300': fallbackValue >= 40,
          'bg-amber-400': fallbackValue >= 50,
          'bg-green-400': fallbackValue >= 60,
          'bg-green-500': fallbackValue >= 70,
          'bg-green-600': fallbackValue >= 80,
          'bg-green-700': fallbackValue >= 90,
        })}
        style={{ transform: `translateX(-${100 - fallbackValue}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
