'use client'

import { useDroppable } from '@dnd-kit/core'

import { cn } from '@/lib/utils'

interface DropZoneProps {
  id: string
  dayOfWeek: number
  position: number
  isActive: boolean
}

export function DropZone({ id, dayOfWeek, position, isActive }: DropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: {
      type: 'drop-zone',
      dayOfWeek,
      position,
    },
  })

  if (!isActive) return null

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'h-0 mx-2 rounded-lg transition-all duration-200 ease-in-out',
        isOver
          ? 'bg-neutral-950/30 h-[100px] shadow-md'
          : 'bg-neutral-950/30 hover:bg-neutral-950/50',
      )}
    ></div>
  )
}
