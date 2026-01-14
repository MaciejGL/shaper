import { CheckIcon, GripIcon, XIcon } from 'lucide-react'
import type * as React from 'react'

import { ExerciseMediaPreview } from '@/components/exercise-media-preview'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { ExerciseDetailDrawer } from '../exercise/exercise-detail-drawer'

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
  detailExercise?: React.ComponentProps<typeof ExerciseDetailDrawer>['exercise']
  belowContent?: React.ReactNode
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
  extraTrailing?: React.ReactNode
  detailExercise?: React.ComponentProps<typeof ExerciseDetailDrawer>['exercise']
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
  extraTrailing?: React.ReactNode
  detailExercise?: React.ComponentProps<typeof ExerciseDetailDrawer>['exercise']
  belowContent?: React.ReactNode
}

export function SelectableExerciseItem(props: SelectableExerciseItemProps) {
  const { id, isSelected, onToggle, extraTrailing, detailExercise, ...rest } =
    props

  return (
    <BaseExerciseItem
      id={id}
      isSelected={isSelected}
      onClick={() => onToggle(id)}
      detailExercise={detailExercise}
      trailing={
        <div className="flex items-center gap-2 shrink-0">
          {extraTrailing}
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
  extraTrailing,
  detailExercise,
  belowContent,
  ...rest
}: DraggableExerciseItemProps) {
  return (
    <BaseExerciseItem
      id={id}
      disabled={disabled}
      detailExercise={detailExercise}
      leading={
        <button
          type="button"
          aria-label="Reorder exercise"
          className="shrink-0 touch-none cursor-grab active:cursor-grabbing rounded-sm p-1 -mr-2"
          onPointerDown={onDragHandlePointerDown}
          disabled={disabled}
        >
          <GripIcon className="size-5 text-muted-foreground" />
        </button>
      }
      trailing={
        <div className="flex items-center gap-2 shrink-0">
          {extraTrailing}
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
        </div>
      }
      belowContent={belowContent}
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
  detailExercise,
  belowContent,
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
        <div
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {detailExercise ? (
            <ExerciseDetailDrawer
              exercise={detailExercise}
              trigger={
                <div>
                  <ExerciseMediaPreview
                    images={images}
                    videoUrl={videoUrl}
                    className="size-20 shrink-0 rounded-md"
                    hidePagination={true}
                    hideVideoOverlay={true}
                    disableImageToggle={true}
                  />
                </div>
              }
            />
          ) : (
            <ExerciseMediaPreview
              images={images}
              videoUrl={videoUrl}
              className="size-20 shrink-0 rounded-md"
              hidePagination={true}
              hideVideoOverlay={true}
            />
          )}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold truncate">{name}</h4>
        {muscleDisplay && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {muscleDisplay}
          </p>
        )}
        {belowContent}
      </div>
      {trailing}
    </div>
  )
}
