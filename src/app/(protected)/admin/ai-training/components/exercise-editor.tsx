import { Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { TrainingExercise } from '@/lib/ai-training/types'

interface ExerciseEditorProps {
  exercises: TrainingExercise[]
  onChange: (exercises: TrainingExercise[]) => void
}

export function ExerciseEditor({ exercises, onChange }: ExerciseEditorProps) {
  const updateExercise = (
    index: number,
    updates: Partial<TrainingExercise>,
  ) => {
    const updated = [...exercises]
    updated[index] = { ...updated[index], ...updates }
    onChange(updated)
  }

  const removeExercise = (index: number) => {
    onChange(exercises.filter((_, i) => i !== index))
  }

  const moveExercise = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= exercises.length) return

    const updated = [...exercises]
    ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      {exercises.map((exercise, index) => (
        <div
          key={`${exercise.id}-${index}`}
          className="space-y-3 rounded-lg border p-4"
        >
          <div className="flex-center justify-between">
            <span className="font-semibold">Exercise {index + 1}</span>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => moveExercise(index, 'up')}
                disabled={index === 0}
              >
                ↑
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => moveExercise(index, 'down')}
                disabled={index === exercises.length - 1}
              >
                ↓
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => removeExercise(index)}
                iconOnly={<Trash2 />}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Sets</Label>
              <Input
                id={`sets-${index}`}
                type="number"
                value={exercise.sets}
                onChange={(e) =>
                  updateExercise(index, { sets: parseInt(e.target.value) })
                }
                min={1}
                max={10}
              />
            </div>

            <div>
              <Label>Min Reps</Label>
              <Input
                id={`min-reps-${index}`}
                type="number"
                value={exercise.minReps}
                onChange={(e) =>
                  updateExercise(index, { minReps: parseInt(e.target.value) })
                }
                min={1}
                max={50}
              />
            </div>

            <div>
              <Label>Max Reps</Label>
              <Input
                id={`max-reps-${index}`}
                type="number"
                value={exercise.maxReps}
                onChange={(e) =>
                  updateExercise(index, { maxReps: parseInt(e.target.value) })
                }
                min={1}
                max={50}
              />
            </div>
          </div>

          <div>
            <Label>Explanation</Label>
            <Textarea
              id={`explanation-${index}`}
              value={exercise.explanation}
              onChange={(e) =>
                updateExercise(index, { explanation: e.target.value })
              }
              rows={2}
              placeholder="Brief rationale for this exercise selection..."
            />
          </div>
        </div>
      ))}
    </div>
  )
}
