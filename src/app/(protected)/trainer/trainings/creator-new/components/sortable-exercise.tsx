'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTrainingPlan } from '@/context/training-plan-context/training-plan-context'
import { cn } from '@/lib/utils'

import { TrainingExercise } from '../../creator/components/types'

interface SortableExerciseProps {
  exercise: TrainingExercise
  dayOfWeek: number
}

export function SortableExercise({
  exercise,
  dayOfWeek,
}: SortableExerciseProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: exercise.id,
    data: {
      type: 'day-exercise',
      exercise,
    },
  })

  const { formData, activeWeek, removeExercise } = useTrainingPlan()

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 1,
  }

  const handleRemoveExercise = (e: React.MouseEvent<HTMLButtonElement>) => {
    const exercises = formData.weeks[activeWeek].days[dayOfWeek].exercises
    const exerciseIndex = exercises.findIndex((ex) => ex.id === exercise.id)
    e.stopPropagation()
    removeExercise(activeWeek, dayOfWeek, exerciseIndex)
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
          isDragging &&
            'shadow-2xl shadow-black/30 bg-card/95 backdrop-blur-sm scale-[1.05] rotate-2 border-primary/50',
        )}
      >
        <CardContent className="p-3 flex items-center justify-between">
          <p className="text-sm font-medium pr-6">{exercise.name}</p>
        </CardContent>
      </Card>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRemoveExercise}
        className={cn(
          'p-0 absolute top-1 right-1 z-10 transition-all duration-200 opacity-0 group-hover:opacity-100',
          isDragging && 'opacity-0',
        )}
        iconOnly={<X className="w-3 h-3" />}
      />
    </div>
  )
}
