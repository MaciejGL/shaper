'use client'

import { DragControls, Reorder, motion, useDragControls } from 'framer-motion'
import { GripIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { VideoPreview } from '@/components/video-preview'
import { GQLFitspaceGenerateAiWorkoutMutation } from '@/generated/graphql-client'
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
      className={`space-y-4 ${className}`}
    >
      {onReorderExercises ? (
        <Reorder.Group
          axis="y"
          values={exercises}
          onReorder={onReorderExercises}
          className="space-y-3"
        >
          {exercises.map((workoutExercise, index) => (
            <DraggableExerciseItem
              key={workoutExercise.exercise.id}
              workoutExercise={workoutExercise}
              index={index}
            />
          ))}
        </Reorder.Group>
      ) : (
        <div className="space-y-3">
          {exercises.map((workoutExercise, index) => (
            <motion.div
              key={workoutExercise.exercise.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <ExerciseCard workoutExercise={workoutExercise} index={index} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

interface DraggableExerciseItemProps {
  workoutExercise: GQLFitspaceGenerateAiWorkoutMutation['generateAiWorkout']['exercises'][number]
  index: number
}

function DraggableExerciseItem({
  workoutExercise,
  index,
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
        index={index}
        isDraggable
        dragControls={dragControls}
      />
    </Reorder.Item>
  )
}

interface ExerciseCardProps {
  workoutExercise: GQLFitspaceGenerateAiWorkoutMutation['generateAiWorkout']['exercises'][number]
  index: number
  isDraggable?: boolean
  dragControls?: DragControls
}

function ExerciseCard({
  workoutExercise,
  index,
  isDraggable = false,
  dragControls,
}: ExerciseCardProps) {
  const { exercise, sets } = workoutExercise

  return (
    <Card
      className={`shadow-sm hover:shadow-md transition-all duration-200 py-0 ${isDraggable ? 'hover:shadow-lg' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Exercise Number */}
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground text-sm font-medium">
            {index + 1}
          </div>

          {/* Exercise Content */}
          <div className="flex-1 space-y-3">
            {/* Exercise Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="font-semibold text-lg">{exercise.name}</h4>
                {/* <p className="text-sm text-muted-foreground">
                  {exercise.description}
                </p> */}
              </div>
              {exercise.videoUrl && <VideoPreview url={exercise.videoUrl} />}
            </div>

            {/* Sets and Reps */}
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium">
                {sets.length} sets × {sets[0]?.reps || 0} reps
              </span>
              {sets[0]?.rpe && (
                <span className="text-muted-foreground">RPE {sets[0].rpe}</span>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {exercise.equipment && (
                <Badge variant="equipment" className="capitalize">
                  {translateEquipment(exercise.equipment)}
                </Badge>
              )}
              {exercise.muscleGroups.map((group, idx) => (
                <Badge
                  key={`${group.groupSlug}-${idx}`}
                  variant="muscle"
                  className="capitalize"
                >
                  {group.alias}
                </Badge>
              ))}
            </div>

            {/* AI Explanation */}
          </div>

          {/* Drag handle for draggable items */}
          {isDraggable && dragControls && (
            <div
              className="flex items-center text-muted-foreground cursor-grab active:cursor-grabbing touch-none select-none p-2 -m-2 hover:bg-muted/50 rounded transition-colors"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <GripIcon className="w-4 h-4" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
