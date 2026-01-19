import { CheckIcon, Dumbbell, GripIcon, XIcon } from 'lucide-react'
import type * as React from 'react'

import { ExerciseMediaPreview } from '@/components/exercise-media-preview'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { ExerciseDetailDrawer } from '../exercise/exercise-detail-drawer'
import { Card, CardContent } from '@/components/ui/card'

export interface BaseExerciseItemProps {
  id: string
  name: string
  muscleDisplay?: string
  equipmentDisplay?: string
  images?: ({ medium?: string | null } | null)[] | null
  videoUrl?: string | null
  disabled?: boolean
  isSelected?: boolean
  onClick?: () => void
  leading?: React.ReactNode
  detailExercise?: React.ComponentProps<typeof ExerciseDetailDrawer>['exercise']
  belowContent?: React.ReactNode
  trailing?: React.ReactNode
  className?: string
  classNameImage?: string
}

interface SelectableExerciseItemProps {
  id: string
  name: string
  muscleDisplay?: string
  equipmentDisplay?: string
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
  equipmentDisplay?: string
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

export function BaseExerciseItem({
  name,
  muscleDisplay,
  equipmentDisplay,
  images,
  videoUrl,
  isSelected,
  onClick,
  disabled,
  leading,
  detailExercise,
  belowContent,
  trailing,
  className,
  classNameImage,
}: BaseExerciseItemProps) {
  const infoLine = [muscleDisplay, equipmentDisplay].filter(Boolean).join(' • ')

  return (
    <Card
      className={cn(
        'transition-all duration-200 shadow-sm border-border p-1',
        onClick ? 'cursor-pointer hover:bg-muted/30 hover:border-border/50' : 'cursor-default',
        isSelected && 'bg-primary/5 border-primary/20 ring-1 ring-primary/20',
        disabled && 'opacity-50 pointer-events-none',
        className,
      )}
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-3 pl-0">
        {leading}
        {(images?.length && images.length > 0 || videoUrl) ? (
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
                      className={cn("size-26 shrink-0 rounded-xl", classNameImage)}
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
                className={cn("size-26 shrink-0 rounded-xl", classNameImage)}
                hidePagination={true}
                hideVideoOverlay={true}
              />
            )}
          </div>
        ) : <div className={cn("size-26 shrink-0 rounded-xl bg-muted flex-center", classNameImage)} >
          <Dumbbell className="size-6 text-muted-foreground" />
        </div>}
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold leading-tight">{name}</h4>
          {infoLine ? (
            <p className="text-sm text-muted-foreground/80 truncate mt-1">
              {infoLine}
            </p>
          ) : null}

          {belowContent}
        </div>
        {trailing}
      </CardContent>
    </Card>
  )
}
