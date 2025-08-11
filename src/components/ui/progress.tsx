'use client'

import * as ProgressPrimitive from '@radix-ui/react-progress'
import * as React from 'react'

import { cn } from '@/lib/utils'

function Progress({
  className,
  value = 0,
  duration = 1000,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  duration?: number
}) {
  const fallbackValue = value ?? 0
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        'bg-primary/8 relative h-1.5 w-full overflow-hidden rounded-full',
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn('bg-primary h-full w-full flex-1 transition-all', {
          'bg-transparent': fallbackValue === 0,
          'bg-amber-300': fallbackValue >= 10,
          'bg-amber-400': fallbackValue >= 40,
          'bg-amber-500': fallbackValue >= 50,
          'bg-green-400': fallbackValue >= 60,
          'bg-green-500': fallbackValue >= 70,
          'bg-green-600': fallbackValue >= 80,
          'bg-green-700': fallbackValue >= 90,
        })}
        style={{
          transitionDuration: `${duration}ms`,
          transform: `translateX(-${Math.max(0, 100 - fallbackValue)}%)`,
        }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
