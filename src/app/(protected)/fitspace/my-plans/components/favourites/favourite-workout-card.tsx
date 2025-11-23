'use client'

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ChevronRight,
  Clock,
  FolderInput,
  Grip,
  MinusIcon,
  MoreHorizontal,
  Pencil,
  PlusIcon,
  Trash2,
  X,
} from 'lucide-react'
import { useState } from 'react'

import { AnimateNumber } from '@/components/animate-number'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  GQLGetFavouriteWorkoutFoldersQuery,
  GQLGetFavouriteWorkoutsQuery,
} from '@/generated/graphql-client'
import { WorkoutStatusAnalysis } from '@/hooks/use-favourite-workouts'

import { AddExerciseToFavouriteDrawer } from './add-exercise-to-favourite-drawer'
import { EditFavouriteMetadataDrawer } from './edit-favourite-metadata-drawer'
import { EmptyFavouriteOptions } from './empty-favourite-options'
import { MoveToFolderDrawer } from './move-to-folder-drawer'
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
  const [showAddExercise, setShowAddExercise] = useState(false)
  const [showEditMetadata, setShowEditMetadata] = useState(false)
  const [showMoveToFolder, setShowMoveToFolder] = useState(false)

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

  return (
    <>
      <Accordion type="single" collapsible>
        <AccordionItem value={favourite.id}>
          <AccordionTrigger variant="default">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-medium truncate">
                  {favourite.title}
                </h3>
              </div>
              {showBadges && (
                <div className="flex items-center gap-1 mt-2">
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
                        {muscleGroup?.groupSlug}
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

          <AccordionContent>
            <div className="pt-4">
              <CardHeader className="space-y-2 pb-4">
                <div className="flex justify-end items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        iconOnly={<MoreHorizontal />}
                      />
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
                    <>
                      {buttonProps.disabled && buttonProps.subtext ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Button
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
                    </>
                  )}
                </div>

                <div className="flex justify-between">
                  {favourite.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {favourite.description}
                    </p>
                  )}

                  <div className="flex gap-1 flex-wrap ml-auto">
                    {totalSets > 0 && (
                      <Badge variant="secondary">{totalSets} sets</Badge>
                    )}
                    {estimatedTime > 0 && (
                      <Badge variant="secondary">
                        <Clock className="w-3 h-3 mr-1" />~{estimatedTime}min
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-4">
                {isEmpty ? (
                  <EmptyFavouriteOptions
                    onOpenAddExercise={() => setShowAddExercise(true)}
                  />
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
                            {favourite.exercises.map((exercise, index) => (
                              <SortableExerciseItem
                                key={exercise.id}
                                exercise={exercise}
                                index={index}
                                onAddSet={handleAddSet}
                                onRemoveSet={handleRemoveSet}
                                onRemoveExercise={handleRemoveExercise}
                              />
                            ))}
                            <Button
                              size="md"
                              variant="outline"
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

// Sortable Exercise Item Component
interface SortableExerciseItemProps {
  exercise: NonNullable<
    NonNullable<GQLGetFavouriteWorkoutsQuery>['getFavouriteWorkouts']
  >[number]['exercises'][number]
  index: number
  onAddSet: (id: string) => void
  onRemoveSet: (id: string) => void
  onRemoveExercise: (id: string) => void
}

function SortableExerciseItem({
  exercise,
  index,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
}: SortableExerciseItemProps) {
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
    <div
      ref={setNodeRef}
      style={style}
      className="grid grid-cols-[auto_1fr_auto] items-center gap-1 w-full"
    >
      <span className="text-sm text-muted-foreground w-4 shrink-0">
        {index + 1}.
      </span>
      <Card variant="tertiary" className="flex-1 p-2 gap-2">
        <CardHeader className="flex items-center justify-between p-0">
          <p className="justify-start whitespace-normal font-medium font-base">
            {exercise.name}
          </p>
          <Button
            size="icon-xs"
            variant="ghost"
            className="opacity-40 hover:opacity-100"
            iconOnly={<X />}
            onClick={(e) => {
              e.stopPropagation()
              onRemoveExercise(exercise.id)
            }}
          >
            Remove exercise
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex items-center gap-0.5 shrink-0">
            <div className="grid grid-cols-[1fr_auto] justify-between items-center gap-4 w-full">
              <p className="text-sm">Sets</p>
              <div className="grid grid-cols-3 items-center gap-0.5 bg-card rounded-xl p-0.5">
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
          </div>
        </CardContent>
      </Card>

      <button
        {...attributes}
        {...listeners}
        className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing shrink-0 touch-none"
      >
        <Grip className="size-4" />
      </button>
    </div>
  )
}
