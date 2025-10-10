import { GripVertical, Replace, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { WorkoutOutput } from '@/lib/ai-training/types'

import { ExerciseSearchCombobox } from './exercise-search-combobox'

interface WorkoutEditorProps {
  workout: WorkoutOutput
  onChange: (workout: WorkoutOutput) => void
}

export function WorkoutEditor({ workout, onChange }: WorkoutEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null)

  const updateExercise = (
    index: number,
    updates: Partial<(typeof workout.exercises)[0]>,
  ) => {
    const updated = [...workout.exercises]
    updated[index] = { ...updated[index], ...updates }
    onChange({ ...workout, exercises: updated })
  }

  const removeExercise = (index: number) => {
    onChange({
      ...workout,
      exercises: workout.exercises.filter((_, i) => i !== index),
    })
  }

  const moveExercise = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= workout.exercises.length) return
    const updated = [...workout.exercises]
    const [moved] = updated.splice(fromIndex, 1)
    updated.splice(toIndex, 0, moved)
    onChange({ ...workout, exercises: updated })
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== index) {
      moveExercise(draggedIndex, index)
      setDraggedIndex(index)
    }
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const replaceExercise = (
    index: number,
    newExercise: {
      id: string
      name: string
      equipment: string | null
      muscleGroups: string[]
    },
  ) => {
    const updated = [...workout.exercises]
    updated[index] = {
      ...updated[index],
      id: newExercise.id,
      name: newExercise.name,
      equipment: newExercise.equipment || undefined,
      muscleGroups: newExercise.muscleGroups,
    }
    onChange({ ...workout, exercises: updated })
    setReplacingIndex(null)
  }

  return (
    <div className="space-y-6">
      {/* Summary & Reasoning */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="summary">Summary</Label>
          <Textarea
            id="summary"
            value={workout.summary}
            onChange={(e) => onChange({ ...workout, summary: e.target.value })}
            rows={2}
            placeholder="Brief workout overview..."
          />
        </div>
        <div>
          <Label htmlFor="reasoning">Reasoning</Label>
          <Textarea
            id="reasoning"
            value={workout.reasoning}
            onChange={(e) =>
              onChange({ ...workout, reasoning: e.target.value })
            }
            rows={3}
            placeholder="Professional explanation of exercise selection..."
          />
        </div>
      </div>

      {/* Exercises List */}
      <div>
        <Label className="mb-3 block">
          Exercises ({workout.exercises.length})
        </Label>
        <div className="space-y-3">
          {workout.exercises.map((exercise, index) => (
            <div
              key={`${exercise.id}-${index}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`rounded-lg border bg-card p-4 transition-all ${
                draggedIndex === index
                  ? 'opacity-50'
                  : 'hover:border-primary/50'
              }`}
            >
              <div className="flex gap-3">
                {/* Drag Handle */}
                <button
                  type="button"
                  className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                  aria-label="Drag to reorder"
                >
                  <GripVertical className="size-5" />
                </button>

                {/* Exercise Content */}
                <div className="flex-1 space-y-3">
                  {/* Header: Name + Actions */}
                  <div className="flex-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">
                        {index + 1}. {exercise.name}
                      </p>
                      {exercise.equipment && (
                        <p className="text-sm text-muted-foreground">
                          {exercise.equipment}
                        </p>
                      )}
                      {exercise.muscleGroups &&
                        exercise.muscleGroups.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {exercise.muscleGroups.map((muscle) => (
                              <span
                                key={muscle}
                                className="rounded bg-muted px-2 py-0.5 text-xs"
                              >
                                {muscle}
                              </span>
                            ))}
                          </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setReplacingIndex(
                            replacingIndex === index ? null : index,
                          )
                        }
                        iconOnly={<Replace />}
                        title="Replace exercise"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeExercise(index)}
                        iconOnly={<Trash2 />}
                        title="Delete exercise"
                      />
                    </div>
                  </div>

                  {/* Exercise Search - Show when replacing */}
                  {replacingIndex === index && (
                    <div className="rounded-md border border-primary/50 bg-accent/30 p-3">
                      <Label className="text-xs mb-2 block">
                        Search for replacement exercise
                      </Label>
                      <ExerciseSearchCombobox
                        onExerciseSelected={(newExercise) =>
                          replaceExercise(index, newExercise)
                        }
                        placeholder="Type to search exercises..."
                      />
                      <p className="mt-2 text-xs text-muted-foreground">
                        Search by name, equipment, or muscle group
                      </p>
                    </div>
                  )}

                  {/* Sets, Reps, RPE */}
                  <div className="grid gap-2 sm:grid-cols-4">
                    <div>
                      <Label className="text-xs">Sets</Label>
                      <Input
                        id={`sets-${index}`}
                        type="number"
                        value={exercise.sets}
                        onChange={(e) =>
                          updateExercise(index, {
                            sets: parseInt(e.target.value) || 1,
                          })
                        }
                        min={1}
                        max={10}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Min Reps</Label>
                      <Input
                        id={`minReps-${index}`}
                        type="number"
                        value={exercise.minReps}
                        onChange={(e) =>
                          updateExercise(index, {
                            minReps: parseInt(e.target.value) || 1,
                          })
                        }
                        min={1}
                        max={50}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Max Reps</Label>
                      <Input
                        id={`maxReps-${index}`}
                        type="number"
                        value={exercise.maxReps}
                        onChange={(e) =>
                          updateExercise(index, {
                            maxReps: parseInt(e.target.value) || 1,
                          })
                        }
                        min={1}
                        max={50}
                        className="h-8"
                      />
                    </div>
                  </div>

                  {/* Explanation */}
                  <div>
                    <Label className="text-xs">Explanation</Label>
                    <Textarea
                      id={`explanation-${index}`}
                      value={exercise.explanation}
                      onChange={(e) =>
                        updateExercise(index, { explanation: e.target.value })
                      }
                      rows={2}
                      placeholder="Why this exercise was selected..."
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
