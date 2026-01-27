'use client'

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Pencil, Play, PlusIcon, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Loader } from '@/components/loader'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  type GQLGetFavouriteWorkoutsQuery,
  type GQLUpdateFavouriteWorkoutInput,
  useUpdateFavouriteWorkoutMutation,
} from '@/generated/graphql-client'
import type { WorkoutStatusAnalysis } from '@/hooks/use-favourite-workouts'
import { useOptimisticMutation } from '@/lib/optimistic-mutations'

import { AddExerciseToFavouriteDrawer } from '../favourites/add-exercise-to-favourite-drawer'
import { SortableFavouriteExerciseItem } from '../favourites/sortable-favourite-exercise-item'
import { useFavouriteCardData } from '../favourites/use-favourite-card-data'
import { useFavouriteCardMutations } from '../favourites/use-favourite-card-mutations'

import type { FavouriteWorkout } from './types'

interface DayEditorViewProps {
  day: FavouriteWorkout | null
  isLoading: boolean
  workoutStatus?: WorkoutStatusAnalysis

  onBack: () => void
  onStartWorkout: (favouriteId: string) => void
  isStartingWorkout: boolean
  onRequestDeleteDay: (favouriteId: string) => void
  onCreateAnotherDay: () => void
}

export function DayEditorView({
  day,
  isLoading,
  workoutStatus,
  onStartWorkout,
  isStartingWorkout,
  onRequestDeleteDay,
}: DayEditorViewProps) {
  const [showAddExercise, setShowAddExercise] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState('')
  const skipNextBlurRef = useRef(false)
  const editableTitleRef = useRef<HTMLSpanElement | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  const exercises = day?.exercises ?? []

  const { handleAddSet, handleRemoveSet, handleRemoveExercise, handleDragEnd } =
    useFavouriteCardMutations({
      favouriteId: day?.id ?? '',
      exercises,
    })

  const safeWorkoutStatus: WorkoutStatusAnalysis = useMemo(() => {
    return (
      workoutStatus ?? {
        status: 'can-start',
        canStart: true,
        needsConfirmation: false,
        message: '',
      }
    )
  }, [workoutStatus])

  const { mutateAsync: updateFavourite } = useUpdateFavouriteWorkoutMutation()
  const queryKey = useMemo(() => ['GetFavouriteWorkouts'], [])
  const { optimisticMutate: updateMetadataOptimistic } = useOptimisticMutation<
    GQLGetFavouriteWorkoutsQuery,
    unknown,
    { input: GQLUpdateFavouriteWorkoutInput }
  >({
    queryKey,
    mutationFn: ({ input }) => updateFavourite({ input }),
    updateFn: (oldData, { input }) => {
      if (!oldData?.getFavouriteWorkouts) return oldData
      return {
        ...oldData,
        getFavouriteWorkouts: oldData.getFavouriteWorkouts.map((fav) =>
          fav.id === input.id
            ? {
                ...fav,
                title: input.title ?? fav.title,
              }
            : fav,
        ),
      }
    },
  })

  const { isEmpty, totalSets, estimatedMinutes, buttonProps } =
    useFavouriteCardData({
      favourite: day,
      workoutStatus: safeWorkoutStatus,
      isStarting: isStartingWorkout,
    })

  useEffect(() => {
    if (!day) return
    if (!isEditing) {
      setDraftTitle(day.title)
    }
  }, [day, isEditing])

  const handleStartEdit = () => {
    if (!day) return
    setIsEditing(true)
    setDraftTitle(day.title)
  }

  const handleCancelEdit = () => {
    if (!day) return
    skipNextBlurRef.current = true
    setIsEditing(false)
    setDraftTitle(day.title)
  }

  const handleSaveEdit = async () => {
    if (!day) return
    const nextTitle = draftTitle.trim()
    if (!nextTitle) {
      handleCancelEdit()
      return
    }

    skipNextBlurRef.current = true
    await updateMetadataOptimistic({
      input: {
        id: day.id,
        title: nextTitle,
      },
    })
    setIsEditing(false)
  }

  useEffect(() => {
    if (!isEditing) return
    if (!editableTitleRef.current) return

    editableTitleRef.current.textContent = draftTitle
    requestAnimationFrame(() => {
      const el = editableTitleRef.current
      if (!el) return
      el.focus()
      // place caret at end
      const range = document.createRange()
      range.selectNodeContents(el)
      range.collapse(false)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    })
  }, [draftTitle, isEditing])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader />
      </div>
    )
  }

  if (!day) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">Day not found.</p>
      </div>
    )
  }

  const startButton = !isEmpty ? (
    <Button
      variant={buttonProps.variant}
      size="md"
      iconEnd={<Play className="size-4" />}
      onClick={() => onStartWorkout(day.id)}
      disabled={buttonProps.disabled || isEmpty}
      loading={buttonProps.loading}
      aria-label={buttonProps.text}
    >
      {buttonProps.text}
    </Button>
  ) : null

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-end gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="icon-md"
              iconOnly={<Trash2 />}
              onClick={() => onRequestDeleteDay(day.id)}
              aria-label="Delete day"
            />
            {buttonProps.disabled && buttonProps.subtext && startButton ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>{startButton}</div>
                </TooltipTrigger>
                <TooltipContent>{buttonProps.subtext}</TooltipContent>
              </Tooltip>
            ) : (
              startButton
            )}
          </div>
        </div>

        <div className="space-y-2">
          {isEditing ? (
            <span
              ref={editableTitleRef}
              contentEditable
              suppressContentEditableWarning
              role="textbox"
              aria-label="Day title"
              className="block text-xl font-semibold outline-none bg-transparent"
              onInput={(e) => {
                const next = (e.currentTarget.textContent ?? '')
                  .replace(/\n/g, ' ')
                  .slice(0, 100)
                if ((e.currentTarget.textContent ?? '') !== next) {
                  e.currentTarget.textContent = next
                }
                setDraftTitle(next)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  void handleSaveEdit()
                }
                if (e.key === 'Escape') {
                  e.preventDefault()
                  handleCancelEdit()
                }
              }}
              onBlur={() => {
                if (skipNextBlurRef.current) {
                  skipNextBlurRef.current = false
                  return
                }
                void handleSaveEdit()
              }}
            />
          ) : (
            <button
              type="button"
              onClick={handleStartEdit}
              className="text-left w-full"
              aria-label="Edit day title"
            >
              <span className="inline-flex items-center gap-1">
                <span className="text-xl font-semibold">{day.title}</span>
                <Pencil className="size-4 text-muted-foreground" />
              </span>
            </button>
          )}
          {!isEmpty ? (
            <p className="text-xs text-muted-foreground">
              {day.exercises.length} exercises · {totalSets} sets
              {estimatedMinutes > 0 ? ` · ~${estimatedMinutes}min` : ''}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Empty day</p>
          )}
        </div>

        {isEmpty ? (
          <Button
            variant="default"
            size="lg"
            iconStart={<PlusIcon />}
            onClick={() => setShowAddExercise(true)}
            className="w-full"
          >
            Add first exercise
          </Button>
        ) : (
          <div className="space-y-3">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={exercises.map((ex) => ex.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-2">
                  {exercises.map((exercise) => (
                    <SortableFavouriteExerciseItem
                      key={exercise.id}
                      exercise={exercise}
                      onAddSet={handleAddSet}
                      onRemoveSet={handleRemoveSet}
                      onRemoveExercise={handleRemoveExercise}
                      classNameImage="size-20"
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <Button
              variant="default"
              className="w-full"
              iconStart={<PlusIcon />}
              onClick={() => setShowAddExercise(true)}
            >
              Add exercise
            </Button>
          </div>
        )}

        {/* Start action moved to header */}
      </div>

      {showAddExercise ? (
        <AddExerciseToFavouriteDrawer
          open={showAddExercise}
          onClose={() => setShowAddExercise(false)}
          favouriteId={day.id}
        />
      ) : null}
    </>
  )
}
