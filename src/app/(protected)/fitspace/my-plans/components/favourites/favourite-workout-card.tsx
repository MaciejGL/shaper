'use client'

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import {
  Check,
  ChevronRight,
  Clock,
  FolderInput,
  Pen,
  Pencil,
  PlusIcon,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardContent, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  GQLGetFavouriteWorkoutFoldersQuery,
  GQLGetFavouriteWorkoutsQuery,
} from '@/generated/graphql-client'
import {
  WorkoutStatusAnalysis,
  useUpdateFavouriteWorkout,
} from '@/hooks/use-favourite-workouts'
import { cn } from '@/lib/utils'
import { scrollToElement } from '@/lib/utils/scroll-to'

import { AddExerciseToFavouriteDrawer } from './add-exercise-to-favourite-drawer'
import { EditFavouriteMetadataDrawer } from './edit-favourite-metadata-drawer'
import { MoveToFolderDrawer } from './move-to-folder-drawer'
import { SortableFavouriteExerciseItem } from './sortable-favourite-exercise-item'
import { useFavouriteCardData } from './use-favourite-card-data'
import { useFavouriteCardMutations } from './use-favourite-card-mutations'

interface FavouriteWorkoutCardProps {
  favourite: NonNullable<
    NonNullable<GQLGetFavouriteWorkoutsQuery>['getFavouriteWorkouts']
  >[number]
  onStart: () => void
  onRefetch: () => void
  onDelete: () => void
  workoutStatus: WorkoutStatusAnalysis
  isLoading: boolean
  folders?: NonNullable<
    NonNullable<GQLGetFavouriteWorkoutFoldersQuery>['getFavouriteWorkoutFolders']
  >
}

export function FavouriteWorkoutCard({
  favourite,
  onStart,
  onRefetch,
  onDelete,
  workoutStatus,
  isLoading,
  folders = [],
}: FavouriteWorkoutCardProps) {
  const itemDomId = `favourite-workout-${favourite.id}`
  const [showAddExercise, setShowAddExercise] = useState(false)
  const [showEditMetadata, setShowEditMetadata] = useState(false)
  const [showMoveToFolder, setShowMoveToFolder] = useState(false)
  const [openValue, setOpenValue] = useState<string>('')

  const [isRenaming, setIsRenaming] = useState(false)
  const [draftTitle, setDraftTitle] = useState(favourite.title)
  const [titleOverride, setTitleOverride] = useState<string | null>(null)

  const { mutateAsync: updateFavourite, isPending: isUpdatingTitle } =
    useUpdateFavouriteWorkout()

  useEffect(() => {
    if (isRenaming) return
    setDraftTitle(favourite.title)
    setTitleOverride(null)
  }, [favourite.title, isRenaming])

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
  )

  // Get computed data
  const {
    totalSets,
    isEmpty,
    uniqueMuscleGroups,
    estimatedMinutes: estimatedTime,
    buttonProps,
  } = useFavouriteCardData({ favourite, workoutStatus, isStarting: isLoading })

  // Get mutation handlers
  const { handleAddSet, handleRemoveSet, handleRemoveExercise, handleDragEnd } =
    useFavouriteCardMutations({
      favouriteId: favourite.id,
      exercises: favourite.exercises,
    })

  const hasMuscleGroups = uniqueMuscleGroups.length > 0
  const hasExercises = favourite.exercises.length > 0
  const showBadges = hasMuscleGroups || hasExercises
  const displayTitle = titleOverride ?? favourite.title

  const stopAccordionToggle = (e: {
    preventDefault: () => void
    stopPropagation: () => void
  }) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleStartRename = (e: {
    preventDefault: () => void
    stopPropagation: () => void
  }) => {
    stopAccordionToggle(e)
    setIsRenaming(true)
    setDraftTitle(displayTitle)
  }

  const handleCancelRename = (e?: {
    preventDefault: () => void
    stopPropagation: () => void
  }) => {
    if (e) stopAccordionToggle(e)
    setIsRenaming(false)
    setDraftTitle(displayTitle)
  }

  const handleSaveRename = async (e?: {
    preventDefault: () => void
    stopPropagation: () => void
  }) => {
    if (e) stopAccordionToggle(e)
    const nextTitle = draftTitle.trim()
    if (!nextTitle) {
      handleCancelRename()
      return
    }

    if (nextTitle === displayTitle) {
      setIsRenaming(false)
      return
    }

    setTitleOverride(nextTitle)
    setIsRenaming(false)

    try {
      await updateFavourite({
        input: {
          id: favourite.id,
          title: nextTitle,
        },
      })
      onRefetch()
    } catch (error) {
      console.error('Failed to rename favourite workout:', error)
      setTitleOverride(null)
    }
  }

  return (
    <>
      <Accordion
        type="single"
        collapsible
        value={openValue}
        onValueChange={(value) => {
          setOpenValue(value)
          if (value === favourite.id) {
            void scrollToElement(itemDomId, {
              offset: 80,
              delay: 150,
              behavior: 'smooth',
            })
          }
        }}
      >
        <AccordionItem value={favourite.id} id={itemDomId} className="relative">
          {isRenaming && (
            <div
              className="absolute left-4 right-14 top-3 z-10"
              onPointerDown={stopAccordionToggle}
              onClick={stopAccordionToggle}
            >
              <div className="flex items-center gap-1 w-full min-w-0">
                <Input
                  id={`${itemDomId}-rename-title`}
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  onKeyDown={(e) => {
                    e.stopPropagation()
                    if (e.key === 'Enter') void handleSaveRename()
                    if (e.key === 'Escape') handleCancelRename()
                  }}
                  onKeyUp={(e) => e.stopPropagation()}
                  onBlur={() => void handleSaveRename()}
                  maxLength={100}
                  className="h-8"
                  aria-label="Custom day title"
                  disabled={isUpdatingTitle}
                />
                <Button
                  size="icon-sm"
                  variant="outline"
                  iconOnly={<Check />}
                  aria-label="Save title"
                  disabled={isUpdatingTitle}
                  onClick={() => void handleSaveRename()}
                />
                <Button
                  size="icon-sm"
                  variant="outline"
                  iconOnly={<X />}
                  aria-label="Cancel rename"
                  disabled={isUpdatingTitle}
                  onClick={handleCancelRename}
                />
              </div>
            </div>
          )}

          <AccordionTrigger
            variant="default"
            disabled={isRenaming}
            className={cn(isRenaming ? 'disabled:opacity-100' : undefined)}
          >
            <div className="flex-1 min-w-0">
              <div
                className={`flex items-center gap-2 ${isRenaming ? 'opacity-0' : ''}`}
              >
                <h3
                  className="text-base font-medium truncate cursor-text"
                  onPointerDown={stopAccordionToggle}
                  onClick={handleStartRename}
                  aria-label="Rename custom day"
                >
                  {displayTitle}
                </h3>
              </div>
              {showBadges && (
                <div className="flex items-center gap-1 mt-2 flex-wrap">
                  {hasExercises && (
                    <Badge variant="secondary" size="sm">
                      {favourite.exercises.length} exercises
                    </Badge>
                  )}
                  {hasMuscleGroups &&
                    uniqueMuscleGroups.slice(0, 2).map((muscleGroup) => (
                      <Badge
                        key={muscleGroup?.id}
                        variant="muscle"
                        size="sm"
                        className="capitalize"
                      >
                        {muscleGroup?.displayGroup}
                      </Badge>
                    ))}
                  {hasMuscleGroups && uniqueMuscleGroups.length > 2 && (
                    <Badge variant="muscle" size="sm">
                      +{uniqueMuscleGroups.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </AccordionTrigger>

          <AccordionContent className="p-0">
            <div className="p-3">
              <CardHeader className="space-y-2 p-0">
                <div className="flex justify-between items-start gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" iconStart={<Pen />}>
                        Edit
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowEditMetadata(true)
                        }}
                      >
                        <Pencil className="mr-2 size-4" />
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowMoveToFolder(true)
                        }}
                      >
                        <FolderInput className="mr-2 size-4" />
                        Move to Folder
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete()
                        }}
                      >
                        <Trash2 className="mr-2 size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {!isEmpty && (
                    <div className="w-full">
                      {buttonProps.disabled && buttonProps.subtext ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="w-full">
                              <Button
                                className="w-full"
                                size="sm"
                                variant={buttonProps.variant}
                                disabled={buttonProps.disabled}
                                loading={buttonProps.loading}
                                iconEnd={<ChevronRight />}
                              >
                                {buttonProps.text}
                              </Button>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>{buttonProps.subtext}</TooltipContent>
                        </Tooltip>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={onStart}
                          size="sm"
                          variant={buttonProps.variant}
                          disabled={buttonProps.disabled}
                          loading={buttonProps.loading}
                          iconEnd={<ChevronRight />}
                        >
                          {buttonProps.text}
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {favourite.description ? (
                  <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                    {favourite.description}
                  </p>
                ) : null}

                {((!isEmpty && totalSets > 0) || estimatedTime > 0) && (
                  <div className="flex gap-1 flex-wrap">
                    {totalSets > 0 && (
                      <Badge variant="secondary">{totalSets} sets</Badge>
                    )}
                    {estimatedTime > 0 && (
                      <Badge variant="secondary">
                        <Clock className="w-3 h-3 mr-1" />~{estimatedTime}min
                      </Badge>
                    )}
                  </div>
                )}
              </CardHeader>

              <CardContent className="pt-0 space-y-4 p-0 mt-2">
                {isEmpty ? (
                  <Button
                    variant="default"
                    size="lg"
                    iconStart={<PlusIcon />}
                    onClick={() => setShowAddExercise(true)}
                    className="w-full"
                  >
                    Add First Exercise
                  </Button>
                ) : (
                  <>
                    {/* Exercise Preview */}
                    <div className="space-y-1">
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={favourite.exercises.map((ex) => ex.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="text-sm flex flex-col gap-1">
                            {favourite.exercises.map((exercise) => (
                              <SortableFavouriteExerciseItem
                                key={exercise.id}
                                exercise={exercise}
                                onAddSet={handleAddSet}
                                onRemoveSet={handleRemoveSet}
                                onRemoveExercise={handleRemoveExercise}
                                classNameImage="size-20"
                              />
                            ))}
                            <Button
                              size="md"
                              variant="default"
                              iconStart={<PlusIcon />}
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowAddExercise(true)
                              }}
                              className="mt-4"
                            >
                              Add Exercise
                            </Button>
                          </div>
                        </SortableContext>
                      </DndContext>
                    </div>
                  </>
                )}
              </CardContent>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Add Exercise Drawer */}
      {showAddExercise && (
        <AddExerciseToFavouriteDrawer
          open={showAddExercise}
          onClose={() => setShowAddExercise(false)}
          favouriteId={favourite.id}
        />
      )}

      {/* Edit Metadata Drawer */}
      {showEditMetadata && (
        <EditFavouriteMetadataDrawer
          open={showEditMetadata}
          onClose={() => setShowEditMetadata(false)}
          favouriteId={favourite.id}
          currentTitle={favourite.title}
          currentDescription={favourite.description}
          onSuccess={onRefetch}
        />
      )}

      {/* Move to Folder Drawer */}
      {showMoveToFolder && (
        <MoveToFolderDrawer
          open={showMoveToFolder}
          onClose={() => setShowMoveToFolder(false)}
          favouriteId={favourite.id}
          currentFolderId={favourite.folderId}
          folders={folders}
          onSuccess={onRefetch}
        />
      )}
    </>
  )
}
