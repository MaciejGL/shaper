'use client'

import { DragControls, Reorder, motion, useDragControls } from 'framer-motion'
import { Grip } from 'lucide-react'
import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { VideoPreview } from '@/components/video-preview'
import { GQLFitspaceGenerateAiWorkoutMutation } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'
import { translateEquipment } from '@/utils/translate-equipment'

interface AiExerciseListProps {
  exercises: GQLFitspaceGenerateAiWorkoutMutation['generateAiWorkout']['exercises']
  className?: string
  onReorderExercises?: (
    exercises: GQLFitspaceGenerateAiWorkoutMutation['generateAiWorkout']['exercises'],
  ) => void
}

export function AiExerciseList({
  exercises,
  className,
  onReorderExercises,
}: AiExerciseListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={cn('space-y-4', className)}
    >
      {onReorderExercises ? (
        <Reorder.Group
          axis="y"
          values={exercises}
          onReorder={onReorderExercises}
          className="space-y-3 touch-manipulation"
        >
          {exercises.map((workoutExercise) => (
            <DraggableExerciseItem
              key={workoutExercise.exercise.id}
              workoutExercise={workoutExercise}
            />
          ))}
        </Reorder.Group>
      ) : (
        <div className="space-y-0">
          {exercises.map((workoutExercise, index) => (
            <motion.div
              key={workoutExercise.exercise.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <ExerciseCard workoutExercise={workoutExercise} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

interface DraggableExerciseItemProps {
  workoutExercise: GQLFitspaceGenerateAiWorkoutMutation['generateAiWorkout']['exercises'][number]
}

function DraggableExerciseItem({
  workoutExercise,
}: DraggableExerciseItemProps) {
  const dragControls = useDragControls()

  return (
    <Reorder.Item
      value={workoutExercise}
      dragControls={dragControls}
      dragElastic={0.1}
      dragListener={false}
    >
      <ExerciseCard
        workoutExercise={workoutExercise}
        isDraggable
        dragControls={dragControls}
      />
    </Reorder.Item>
  )
}

interface ExerciseCardProps {
  workoutExercise: GQLFitspaceGenerateAiWorkoutMutation['generateAiWorkout']['exercises'][number]
  isDraggable?: boolean
  dragControls?: DragControls
}

function ExerciseCard({
  workoutExercise,
  isDraggable = false,
  dragControls,
}: ExerciseCardProps) {
  const { exercise, sets } = workoutExercise
  const firstImage = exercise.images?.at(0)

  console.log(sets)
  // Handle drag start with proper event prevention
  const handleDragStart = (e: React.PointerEvent) => {
    e.preventDefault() // Prevent default browser behavior
    if (dragControls) {
      dragControls.start(e)
    }
  }

  return (
    <div className="flex gap-2 items-center">
      {isDraggable && dragControls && (
        <div
          className="flex-shrink-0 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-manipulation select-none"
          onPointerDown={handleDragStart}
          style={{
            touchAction: 'none', // Completely disable touch actions on drag handle
            userSelect: 'none', // Prevent text selection
          }}
        >
          <Grip className="h-4 w-4" />
        </div>
      )}
      <Card
        className={cn(
          'group/exercise-card p-0 border-b border-t-0 overflow-hidden flex-1 rounded-none pr-2',
          isDraggable && 'rounded-md border',
          'bg-card hover:border-primary/20 transition-all duration-200',
          isDraggable && 'hover:shadow-lg',
        )}
      >
        <CardContent className="p-0 flex items-center gap-3">
          {exercise.images.length > 0 && (
            <div className="h-auto w-20 self-stretch relative">
              {firstImage?.thumbnail || firstImage?.medium ? (
                <Image
                  src={
                    firstImage.thumbnail ||
                    firstImage.medium ||
                    '/placeholder.svg'
                  }
                  alt={exercise.name}
                  width={100}
                  height={100}
                  className="object-cover size-full"
                />
              ) : (
                <Image
                  src={'/empty-rack.png'}
                  alt={exercise.name}
                  width={100}
                  height={100}
                  className="object-cover h-full"
                />
              )}
            </div>
          )}

          <div
            className={cn('flex-1 py-2', exercise.images.length === 0 && 'p-3')}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="font-medium text-md leading-tight text-left">
                  {exercise.name}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>
                    {sets.length} sets x{' '}
                    {sets[0]?.minReps && sets[0]?.maxReps
                      ? `${sets[0].minReps}-${sets[0].maxReps}`
                      : sets[0]?.reps || 0}{' '}
                    reps
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {exercise.videoUrl && <VideoPreview url={exercise.videoUrl} />}
              </div>
            </div>
            <div className="flex flex-wrap gap-0.5 mt-1">
              {exercise.equipment && (
                <Badge variant="equipment" size="2xs">
                  {translateEquipment(exercise.equipment)}
                </Badge>
              )}

              {/* Primary muscle groups - limit to 3 and show +count if more */}
              {exercise.muscleGroups.slice(0, 2).map((group) => (
                <Badge key={group.id} variant="muscle" size="2xs">
                  {group.alias}
                </Badge>
              ))}
              {exercise.muscleGroups.length > 2 && (
                <Badge variant="muscle" size="2xs">
                  +{exercise.muscleGroups.length - 2}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
