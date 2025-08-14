'use client'

import { Plus, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

import { Exercise, ExerciseUpdateHandler } from './types'

interface ExerciseTipsSectionProps {
  exercise: Exercise
  currentExercise: Exercise
  onUpdate: ExerciseUpdateHandler
}

export function ExerciseTipsSection({
  exercise,
  currentExercise,
  onUpdate,
}: ExerciseTipsSectionProps) {
  const updateTip = (index: number, value: string) => {
    const currentTips = [...(currentExercise.tips || [])]
    if (value.trim() === '') {
      currentTips.splice(index, 1)
    } else {
      currentTips[index] = value
    }
    onUpdate(exercise.id, 'tips', currentTips)
  }

  const addTip = () => {
    const currentTips = [...(currentExercise.tips || []), '']
    onUpdate(exercise.id, 'tips', currentTips)
  }

  const removeTip = (index: number) => {
    const currentTips = [...(currentExercise.tips || [])]
    currentTips.splice(index, 1)
    onUpdate(exercise.id, 'tips', currentTips)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {(currentExercise.tips || []).map((tip, index) => (
          <div key={index} className="space-y-2 relative group">
            <Button
              variant="ghost"
              size="icon-xs"
              className="absolute -top-1.5 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeTip(index)}
              iconStart={<X />}
            />

            <Textarea
              id={`exercise-tip-${exercise.id}-${index}`}
              value={tip}
              variant="ghost"
              label={`Tip ${index + 1}`}
              onChange={(e) => updateTip(index, e.target.value)}
              className="min-h-[50px] text-sm resize-none"
              placeholder="Helpful advice for better form..."
            />
          </div>
        ))}

        <Button
          variant="tertiary"
          size="sm"
          onClick={addTip}
          className="w-full"
          iconStart={<Plus />}
        >
          Add tip
        </Button>
      </div>
    </div>
  )
}
