import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { Button } from '../ui/button'

export function MuscleLabel({
  label,
  value,
  isRegionSelected,
  handleRegionClick,
  hasMuscleData,
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
  hasMuscleData: (aliases: string[]) => boolean
}) {
  const [elementWidth, setElementWidth] = useState(0)
  const ref = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    setElementWidth(ref.current?.offsetWidth ?? 0)
  }, [ref])
  const isDisabled = !hasMuscleData(value.aliases)
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
      disabled={isDisabled}
      className={cn(
        isDisabled && 'pointer-events-none opacity-40',
        'absolute z-10 -translate-y-1/2 animate-in',
      )}
    >
      {label}
    </Button>
  )
}
