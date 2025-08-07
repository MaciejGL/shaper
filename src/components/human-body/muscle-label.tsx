import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { Button } from '../ui/button'

export function MuscleLabel({
  label,
  value,
  isRegionSelected,
  handleRegionClick,
}: {
  label: string
  value: {
    muscleX: number
    muscleY: number
    labelX: number
    labelY: number
    aliases: string[]
    side: 'left' | 'right'
  }
  isRegionSelected: (aliases: string[]) => boolean
  handleRegionClick: (aliases: string[]) => void
}) {
  const [elementWidth, setElementWidth] = useState(0)
  const ref = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    setElementWidth(ref.current?.offsetWidth ?? 0)
  }, [ref])
  return (
    <Button
      ref={ref}
      key={label}
      size="xs"
      variant={isRegionSelected(value.aliases) ? 'default' : 'tertiary'}
      style={{
        top: `${value.labelY}px`,
        left:
          value.side === 'left'
            ? `calc(${value.labelX}px - ${elementWidth}px - 2px)`
            : 'unset',
        right:
          value.side === 'right'
            ? `calc(100% - ${value.labelX}px - ${elementWidth}px - 2px)`
            : 'unset',
      }}
      onClick={() => {
        handleRegionClick(value.aliases)
      }}
      className={cn('absolute z-10 -translate-y-1/2 animate-in')}
    >
      {label}
    </Button>
  )
}
