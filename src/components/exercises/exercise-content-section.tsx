'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { Exercise, ExerciseUpdateHandler } from './types'

interface ExerciseContentSectionProps {
  exercise: Exercise
  currentExercise: Exercise
  onUpdate: ExerciseUpdateHandler
}

export function ExerciseContentSection({
  exercise,
  currentExercise,
  onUpdate,
}: ExerciseContentSectionProps) {
  // Ensure exactly 2 instructions
  const instructions = currentExercise.instructions || ['', '']
  const limitedInstructions = instructions.slice(0, 2)
  while (limitedInstructions.length < 2) {
    limitedInstructions.push('')
  }

  const updateInstruction = (index: 0 | 1, value: string) => {
    const newInstructions = [...limitedInstructions]
    newInstructions[index] = value
    onUpdate(
      exercise.id,
      'instructions',
      newInstructions.filter((inst) => inst.trim() !== ''),
    )
  }

  return (
    <div className="space-y-4">
      {/* Exercise Name */}
      <div>
        <Input
          label="Exercise name"
          id={`exercise-name-${exercise.id}`}
          value={currentExercise.name}
          onChange={(e) => onUpdate(exercise.id, 'name', e.target.value)}
          placeholder="Exercise name"
        />
      </div>

      {/* Exercise Description */}
      <div className="space-y-2">
        <Textarea
          label="Exercise description"
          id={`exercise-description-${exercise.id}`}
          value={currentExercise.description || ''}
          onChange={(e) =>
            onUpdate(exercise.id, 'description', e.target.value || null)
          }
          variant="ghost"
          className="min-h-[80px] text-sm resize-none"
          placeholder="Describe what this exercise does..."
        />
      </div>

      {/* Instructions */}
      <div className="space-y-3">
        {[0, 1].map((index) => (
          <Textarea
            key={index}
            label={`Exercise instruction ${index + 1}`}
            id={`exercise-instruction-${exercise.id}-${index}`}
            value={limitedInstructions[index] || ''}
            onChange={(e) => updateInstruction(index as 0 | 1, e.target.value)}
            variant="ghost"
            className="min-h-[60px] text-sm resize-none"
            placeholder={index === 0 ? 'Starting position...' : 'Execution...'}
          />
        ))}
      </div>
    </div>
  )
}
