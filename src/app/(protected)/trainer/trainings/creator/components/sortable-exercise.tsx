'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AnimatePresence } from 'framer-motion'
import {
  FlameIcon,
  GaugeIcon,
  MoreHorizontal,
  Pencil,
  TimerIcon,
  Trash2,
} from 'lucide-react'
import { InfoIcon, Plus, X } from 'lucide-react'
import { useState } from 'react'

import { useIsFirstRender } from '@/components/animated-grid'
import { AnimateHeightItem } from '@/components/animations/animated-container'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { VideoPreview } from '@/components/video-preview'
import { useTrainingPlan } from '@/context/training-plan-context/training-plan-context'
import { GQLExerciseType } from '@/generated/graphql-client'
import { formatTempoInput, handleTempoKeyDown } from '@/lib/format-tempo'
import { cn } from '@/lib/utils'

import { EXERCISE_TYPES } from '../../creator-old/components/exercises-setup/exercise-card'
import { TrainingExercise } from '../../creator-old/components/types'

import { InsertionIndicatorBlank } from './insertion-indicators'

interface SortableExerciseProps {
  exerciseId: string
  dayOfWeek: number
}

export function SortableExercise({
  exerciseId,
  dayOfWeek,
}: SortableExerciseProps) {
  const { formData, activeWeek, removeExercise } = useTrainingPlan()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Get exercise data directly from context
  const currentDay = formData.weeks[activeWeek]?.days.find(
    (day) => day.dayOfWeek === dayOfWeek,
  )
  const exercise = currentDay?.exercises.find((ex) => ex.id === exerciseId)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: exerciseId, // Use exerciseId directly
    data: {
      type: 'day-exercise',
      exercise,
    },
  })

  if (!exercise) {
    console.error('[SortableExercise]: Exercise not found', exerciseId)
    return null
  }

  // Improved styling with better z-index handling
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 1,
  }

  const handleRemoveExercise = (
    e:
      | React.MouseEvent<HTMLDivElement, MouseEvent>
      | React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.stopPropagation()

    // Find the exercise in the current day and remove it
    const currentWeek = formData.weeks[activeWeek]
    const day = currentWeek.days.find((d) => d.dayOfWeek === dayOfWeek)

    if (day) {
      const exerciseIndex = day.exercises.findIndex(
        (ex) => ex.id === exercise.id,
      )
      if (exerciseIndex !== -1) {
        removeExercise(activeWeek, dayOfWeek, exerciseIndex)
      } else {
        console.error('[SortableExercise]: Exercise not found for removal')
      }
    } else {
      console.error('[SortableExercise]: Day not found for exercise removal')
    }
  }

  return (
    <div className="relative group">
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={cn(
          'cursor-grab active:cursor-grabbing p-0 transition-all duration-200 ease-out min-h-[120px]',
          isDragging && 'border-primary/50 !bg-muted/50',
        )}
        hoverable
      >
        {isDragging && <InsertionIndicatorBlank isActive={true} />}
        {!isDragging && (
          <CardContent
            className="grow p-3 flex flex-col gap-2 justify-between overflow-hidden cursor-pointer"
            onClick={() => setIsEditDialogOpen(true)}
          >
            {exercise.type && (
              <p className="text-xs  pr-6 text-muted-foreground">
                {EXERCISE_TYPES[exercise.type]}
              </p>
            )}
            <p className="text-sm font-medium pr-6 mb-4">{exercise.name}</p>

            <div className="flex items-center gap-2 flex-wrap">
              {exercise.warmupSets && (
                <Badge variant="outline">
                  <FlameIcon />
                  {exercise.warmupSets} warmups
                </Badge>
              )}
              {exercise.sets.length > 0 && (
                <Badge variant="outline">
                  <FlameIcon /> {exercise.sets.length} sets
                </Badge>
              )}
              {exercise.restSeconds && (
                <Badge variant="outline">
                  <TimerIcon /> {exercise.restSeconds} rest
                </Badge>
              )}
              {exercise.tempo && (
                <Badge variant="outline">
                  <GaugeIcon /> {exercise.tempo}
                </Badge>
              )}
            </div>
          </CardContent>
        )}
      </Card>
      {!isDragging && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="p-0 absolute top-1 right-1 z-10 transition-all duration-200 opacity-0 group-hover:opacity-100"
              iconOnly={<MoreHorizontal />}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
              <Pencil className="w-3 h-3" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => handleRemoveExercise(e)}
              className="cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent dialogTitle={exercise.name} className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{exercise.name}</DialogTitle>
          </DialogHeader>
          <ExerciseDialogContent
            exerciseId={exerciseId}
            dayOfWeek={dayOfWeek}
          />

          <DialogFooter className="flex flex-row justify-between gap-2">
            <Button variant="destructive" onClick={handleRemoveExercise}>
              <Trash2 className="w-3 h-3" />
              Remove
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setIsEditDialogOpen(false)}>Save</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Kanban-specific ExerciseSets component that works with specific dayOfWeek
type KanbanExerciseSetsProps = {
  exerciseId: string
  dayOfWeek: number
}

function KanbanExerciseSets({
  exerciseId,
  dayOfWeek,
}: KanbanExerciseSetsProps) {
  const isFirstRender = useIsFirstRender()
  const { addSet, removeSet, updateSet, activeWeek, formData } =
    useTrainingPlan()

  // Get exercise data directly from context
  const targetDayIndex = formData.weeks[activeWeek]?.days.findIndex(
    (day) => day.dayOfWeek === dayOfWeek,
  )
  const targetDay = formData.weeks[activeWeek]?.days[targetDayIndex]
  const exercise = targetDay?.exercises.find((ex) => ex.id === exerciseId)
  const exerciseIndex =
    targetDay?.exercises.findIndex((ex) => ex.id === exerciseId) ?? -1

  if (!exercise || exerciseIndex === -1) {
    console.error('[KanbanExerciseSets]: Exercise not found', exerciseId)
    return <div>Exercise sets not found</div>
  }

  const sets = exercise.sets ?? []
  const onAddSet = () => {
    addSet(activeWeek, targetDayIndex, exerciseIndex, {
      order: sets.length + 1,
    })
  }
  const onRemoveSet = (index: number) => {
    removeSet(activeWeek, targetDayIndex, exerciseIndex, index)
  }
  const onUpdateSet = (index: number, field: string, value?: number) => {
    updateSet(activeWeek, targetDayIndex, exerciseIndex, index, {
      [field]: value,
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <Label>Sets</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onAddSet()}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Set
        </Button>
      </div>

      <AnimatePresence mode="wait">
        <div className="space-y-2 bg-card px-6 py-2 rounded-md">
          {sets.map((set, index) => (
            <AnimateHeightItem
              id={`set-${set.order}`}
              key={set.order}
              className="flex items-center gap-2"
              isFirstRender={isFirstRender}
            >
              <div
                className={cn(
                  'font-medium w-8',
                  set.order === 1 && 'mt-[20px]',
                )}
              >
                {set.order}
              </div>
              <div className="flex items-center gap-4">
                <div>
                  {set.order === 1 && (
                    <Label
                      htmlFor={`reps-${set.order}`}
                      className="text-sm mb-1"
                    >
                      Reps
                      <Tooltip>
                        <TooltipTrigger>
                          <InfoIcon className="size-3" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Minimum reps are required. If You don't want to
                            specify range of reps You can leave Max Reps blank.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                  )}
                  <div className="flex items-center gap-1">
                    <Input
                      id={`min-reps-${set.order}`}
                      placeholder="Min*"
                      type="number"
                      min="1"
                      value={set.minReps || ''}
                      onChange={(e) =>
                        onUpdateSet(
                          index,
                          'minReps',
                          e.target.value === ''
                            ? undefined
                            : Number.parseInt(e.target.value),
                        )
                      }
                      className="max-w-20"
                    />
                    -
                    <Input
                      id={`max-reps-${set.order}`}
                      type="number"
                      placeholder="Max"
                      min="1"
                      error={
                        set.minReps && set.maxReps && set.minReps > set.maxReps
                          ? 'Min reps must be less than max reps'
                          : undefined
                      }
                      value={set.maxReps || ''}
                      onChange={(e) =>
                        onUpdateSet(
                          index,
                          'maxReps',
                          e.target.value === ''
                            ? undefined
                            : Number.parseInt(e.target.value),
                        )
                      }
                      className="max-w-20"
                    />
                  </div>
                </div>
                <div>
                  {set.order === 1 && (
                    <Label
                      htmlFor={`weight-${set.order}`}
                      className="text-sm mb-1"
                    >
                      Weight
                    </Label>
                  )}
                  <Input
                    id={`weight-${set.order}`}
                    type="number"
                    min="0"
                    step="2.5"
                    value={set.weight ?? ''}
                    onChange={(e) =>
                      onUpdateSet(
                        index,
                        'weight',
                        e.target.value === ''
                          ? undefined
                          : Number.parseFloat(e.target.value),
                      )
                    }
                    className="max-w-32"
                  />
                </div>
                <div>
                  {set.order === 1 && (
                    <Label
                      htmlFor={`rpe-${set.order}`}
                      className="text-sm mb-1"
                    >
                      RPE
                    </Label>
                  )}
                  <Input
                    id={`rpe-${set.order}`}
                    type="number"
                    min="1"
                    max="10"
                    step="1"
                    value={set.rpe ?? ''}
                    onChange={(e) =>
                      onUpdateSet(
                        index,
                        'rpe',
                        e.target.value === ''
                          ? undefined
                          : Number.parseFloat(e.target.value),
                      )
                    }
                    className="max-w-20"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-md"
                className="self-end"
                onClick={() => onRemoveSet(index)}
                disabled={sets.length <= 1}
                iconOnly={<X />}
              />
            </AnimateHeightItem>
          ))}
        </div>
      </AnimatePresence>
    </div>
  )
}

type ExerciseDialogContentProps = {
  exerciseId: string
  dayOfWeek: number
}

export function ExerciseDialogContent({
  exerciseId,
  dayOfWeek,
}: ExerciseDialogContentProps) {
  const { activeWeek, updateExercise, formData } = useTrainingPlan()

  // Get exercise data directly from context
  const currentDay = formData.weeks[activeWeek]?.days.find(
    (day) => day.dayOfWeek === dayOfWeek,
  )
  const exercise = currentDay?.exercises.find((ex) => ex.id === exerciseId)
  const exerciseIndex =
    currentDay?.exercises.findIndex((ex) => ex.id === exerciseId) ?? -1

  // Early return if exercise not found
  if (!exercise) {
    console.error('[ExerciseDialogContent]: Exercise not found', exerciseId)
    return <div>Exercise not found</div>
  }

  // Helper function to update exercise with proper error handling
  const handleUpdateExercise = (updates: Partial<TrainingExercise>) => {
    updateExercise(activeWeek, dayOfWeek, exerciseIndex, {
      ...exercise,
      ...updates,
    })
  }

  return (
    <div className="gap-2">
      <div className="space-y-8">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm items-end">
          <div className="flex flex-col gap-1">
            <Label htmlFor="exerciseType" className="text-sm">
              Exercise type
            </Label>
            <Select
              value={exercise.type ?? ''}
              onValueChange={(value) =>
                handleUpdateExercise({
                  type: value === 'none' ? null : (value as GQLExerciseType),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No variation</SelectItem>
                {Object.entries(EXERCISE_TYPES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {exercise.type !== GQLExerciseType.Cardio && (
            <Input
              id="restSeconds"
              label="Rest (s)"
              type="number"
              size="md"
              value={exercise.restSeconds ?? ''}
              min="0"
              step="15"
              onChange={(e) =>
                handleUpdateExercise({
                  restSeconds:
                    e.target.value === '' ? undefined : Number(e.target.value),
                })
              }
              className="min-w-28 max-w-min"
              iconStart={<TimerIcon />}
            />
          )}

          {exercise.type !== GQLExerciseType.Cardio && (
            <Input
              id="warmup"
              label="Warmup sets"
              size="md"
              type="number"
              min="0"
              step="1"
              value={exercise.warmupSets ?? ''}
              onChange={(e) => {
                handleUpdateExercise({
                  warmupSets:
                    e.target.value === '' ? undefined : Number(e.target.value),
                })
              }}
              iconStart={<GaugeIcon />}
              className="min-w-28 max-w-min"
            />
          )}

          {exercise.type !== GQLExerciseType.Cardio && (
            <Input
              id="tempo"
              label="Tempo"
              size="md"
              pattern="[0-9]*"
              placeholder="3-2-3"
              value={exercise.tempo ?? ''}
              onChange={(e) => {
                const formattedValue = formatTempoInput(e)
                handleUpdateExercise({
                  tempo: formattedValue,
                })
              }}
              onKeyDown={handleTempoKeyDown}
              iconStart={<GaugeIcon />}
              className="min-w-28 max-w-min"
            />
          )}

          <div className="flex gap-1">
            {exercise.videoUrl && (
              <VideoPreview url={exercise.videoUrl} variant="secondary" />
            )}
          </div>
        </div>
        <div className="w-full grid grid-cols-1 @4xl/section:grid-cols-[1fr_400px] gap-8">
          {exercise.type !== GQLExerciseType.Cardio && (
            <KanbanExerciseSets exerciseId={exerciseId} dayOfWeek={dayOfWeek} />
          )}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="instructions"
                className="flex flex-col items-start text-sm"
              >
                <p>Instructions (Visible in exercise menu)</p>
              </Label>
              <Textarea
                id="instructions"
                className="text-sm text-foreground bg-muted p-2 rounded-md h-full min-h-24 border-none"
                value={exercise.instructions ?? ''}
                onChange={(e) =>
                  handleUpdateExercise({
                    instructions: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="additionalInstructions"
                className="flex flex-col items-start text-sm"
              >
                <p>
                  Additional Instructions (Visible directly in the exercise
                  view)
                </p>
              </Label>
              <Textarea
                id="additionalInstructions"
                className="text-sm text-foreground bg-muted p-2 rounded-md h-full min-h-12 border-none"
                value={exercise.additionalInstructions ?? ''}
                onChange={(e) =>
                  handleUpdateExercise({
                    additionalInstructions: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
