'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Grip, MinusIcon, PlusIcon, X } from 'lucide-react'

import { BaseExerciseItem } from '@/app/(protected)/fitspace/workout/training/components/add-single-exercise/selectable-exercise-item'
import { AnimateNumber } from '@/components/animate-number'
import { Button } from '@/components/ui/button'
import type { GQLGetFavouriteWorkoutsQuery } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

type FavouriteExercise = NonNullable<
  NonNullable<GQLGetFavouriteWorkoutsQuery>['getFavouriteWorkouts']
>[number]['exercises'][number]

interface SortableFavouriteExerciseItemProps {
  exercise: FavouriteExercise
  onAddSet: (id: string) => void
  onRemoveSet: (id: string) => void
  onRemoveExercise: (id: string) => void
  classNameImage?: string
}

export function SortableFavouriteExerciseItem({
  exercise,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
  classNameImage,
}: SortableFavouriteExerciseItemProps) {
  const previewImages =
    exercise.base?.images?.map((img) => ({
      medium: img.medium ?? img.url ?? img.thumbnail ?? null,
    })) ?? null
  const videoUrl = exercise.base?.videoUrl ?? null
  const detailExercise = exercise.base ?? undefined

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: exercise.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="w-full">
      <BaseExerciseItem
        id={exercise.id}
        name={exercise.name}
        images={previewImages}
        videoUrl={videoUrl}
        className={cn('shadow-sm border-border py-2 relative')}
        classNameImage={classNameImage}
        detailExercise={detailExercise}
        leading={
          <button
            type="button"
            aria-label="Reorder exercise"
            className="shrink-0 touch-none cursor-grab active:cursor-grabbing rounded-sm p-1 -mr-2"
            {...attributes}
            {...listeners}
          >
            <Grip className="size-3 text-muted-foreground" />
          </button>
        }
        trailing={
          <Button
            variant="ghost"
            size="icon-sm"
            iconOnly={<X />}
            onClick={(e) => {
              e.stopPropagation()
              onRemoveExercise(exercise.id)
            }}
            className="shrink-0 absolute right-2 top-1/2 -translate-y-1/2"
          >
            Remove
          </Button>
        }
        belowContent={
          <div className="mt-2 flex justify-start items-baseline gap-2">
            <p className="text-sm text-muted-foreground">Sets</p>
            <div
              className="grid grid-cols-3 items-center gap-0.5 bg-card rounded-xl p-0.5"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Button
                size="icon-sm"
                variant="tertiary"
                className="rounded-xl"
                iconOnly={<MinusIcon />}
                onClick={(e) => {
                  e.stopPropagation()
                  onRemoveSet(exercise.id)
                }}
              >
                Remove set
              </Button>
              <AnimateNumber
                value={exercise.sets.length}
                duration={300}
                className="text-center text-lg font-medium"
              />
              <Button
                size="icon-sm"
                className="rounded-xl"
                variant="tertiary"
                iconOnly={<PlusIcon />}
                onClick={(e) => {
                  e.stopPropagation()
                  onAddSet(exercise.id)
                }}
              >
                Add set
              </Button>
            </div>
          </div>
        }
      />
    </div>
  )
}

