import { CheckIcon, GripVertical, XIcon } from 'lucide-react'
import type * as React from 'react'

import { ExerciseMediaPreview } from '@/components/exercise-media-preview'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BaseExerciseItemProps {
  id: string
  name: string
  muscleDisplay?: string
  images?: ({ medium?: string | null } | null)[] | null
  videoUrl?: string | null
  disabled?: boolean
  isSelected?: boolean
  onClick?: () => void
  leading?: React.ReactNode
  trailing?: React.ReactNode
}

interface SelectableExerciseItemProps {
  id: string
  name: string
  muscleDisplay?: string
  images?: ({ medium?: string | null } | null)[] | null
  videoUrl?: string | null
  isSelected: boolean
  onToggle: (id: string) => void
  disabled?: boolean
}

interface DraggableExerciseItemProps {
  id: string
  name: string
  muscleDisplay?: string
  images?: ({ medium?: string | null } | null)[] | null
  videoUrl?: string | null
  onDragHandlePointerDown: (e: React.PointerEvent<HTMLButtonElement>) => void
  onRemove: (id: string) => void
  disabled?: boolean
}

export function SelectableExerciseItem(props: SelectableExerciseItemProps) {
  const { id, isSelected, onToggle, ...rest } = props

  return (
    <BaseExerciseItem
      id={id}
      isSelected={isSelected}
      onClick={() => onToggle(id)}
      trailing={
        <div
          className={cn(
            'shrink-0 size-6 rounded-full flex-center transition-all',
            isSelected
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground/30',
          )}
        >
          <CheckIcon className="size-4" />
        </div>
      }
      {...rest}
    />
  )
}

export function DraggableExerciseItem({
  id,
  onDragHandlePointerDown,
  onRemove,
  disabled,
  ...rest
}: DraggableExerciseItemProps) {
  return (
    <BaseExerciseItem
      id={id}
      disabled={disabled}
      leading={
        <button
          type="button"
          aria-label="Reorder exercise"
          className="shrink-0 touch-none cursor-grab active:cursor-grabbing rounded-sm p-1 -m-1"
          onPointerDown={onDragHandlePointerDown}
          disabled={disabled}
        >
          <GripVertical className="size-5 text-muted-foreground" />
        </button>
      }
      trailing={
        <Button
          variant="ghost"
          size="icon-sm"
          iconOnly={<XIcon />}
          onClick={(e) => {
            e.stopPropagation()
            onRemove(id)
          }}
          disabled={disabled}
          className="shrink-0"
        >
          Remove
        </Button>
      }
      {...rest}
    />
  )
}

function BaseExerciseItem({
  name,
  muscleDisplay,
  images,
  videoUrl,
  isSelected,
  onClick,
  disabled,
  leading,
  trailing,
}: BaseExerciseItemProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-1 pr-3 rounded-lg transition-all',
        'border border-border shadow-sm',
        onClick ? 'cursor-pointer hover:bg-muted/50' : 'cursor-default',
        isSelected ? 'bg-primary/3' : 'bg-card',
        disabled && 'opacity-50 pointer-events-none',
      )}
      onClick={onClick}
    >
      {leading}
      {(images || videoUrl) && (
        <div onClick={(e) => e.stopPropagation()}>
          <ExerciseMediaPreview
            images={images}
            videoUrl={videoUrl}
            className="size-20 shrink-0 rounded-md"
            hidePagination={true}
            hideVideoOverlay={true}
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium truncate">{name}</h4>
        {muscleDisplay && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {muscleDisplay}
          </p>
        )}
      </div>
      {trailing}
    </div>
  )
}
