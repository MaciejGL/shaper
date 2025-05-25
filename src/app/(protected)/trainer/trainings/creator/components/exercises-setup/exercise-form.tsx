import React, { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import type { TrainingExercise } from '../types'

import { ExerciseSets } from './exercise-sets'
import { ExerciseSearch } from './exercises-search'

const initialExercise: TrainingExercise = {
  id: '',
  name: '',
  sets: [
    { id: '', order: 1, reps: 10, weight: 0 },
    { id: '', order: 2, reps: 10, weight: 0 },
    { id: '', order: 3, reps: 10, weight: 0 },
  ],
  restSeconds: 60,
  tempo: '',
  instructions: '',
  order: 0,
}

type ExerciseFormProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSave: (exercise: TrainingExercise) => void
  editingExercise?: TrainingExercise
  editingIndex?: number | null
}

export function ExerciseForm({
  isOpen,
  onOpenChange,
  onSave,
  editingExercise,
  editingIndex,
}: ExerciseFormProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null)
  const [exercise, setExercise] = useState<TrainingExercise>(initialExercise)

  useEffect(() => {
    if (editingExercise) {
      setExercise(editingExercise)
    } else {
      setExercise(initialExercise)
    }
  }, [editingExercise])

  const handleSave = () => {
    onSave(exercise)
    setExercise(initialExercise)
    setSelectedExercise(null)
    setSearchTerm('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent dialogTitle="Add Exercise" className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {editingIndex !== null ? 'Edit Exercise' : 'Add Exercise'}
          </DialogTitle>
          <DialogDescription>
            {editingIndex !== null
              ? 'Edit the exercise details and sets.'
              : 'Search for an existing exercise or create a custom one.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {editingIndex === null && (
            <ExerciseSearch
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedExercise={selectedExercise}
              onExerciseSelect={setSelectedExercise}
            />
          )}

          <div className="space-y-2">
            <Label htmlFor="exercise-name">Exercise Name</Label>
            <Input
              id="exercise-name"
              value={exercise.name}
              onChange={(e) =>
                setExercise({ ...exercise, name: e.target.value })
              }
              placeholder="e.g., Single-Arm Dumbbell Row"
            />
          </div>

          <ExerciseSets
            sets={exercise.sets}
            onAddSet={() =>
              setExercise({
                ...exercise,
                sets: [
                  ...exercise.sets,
                  {
                    id: '',
                    order: exercise.sets.length + 1,
                    reps: exercise.sets[0]?.reps || 10,
                    weight: exercise.sets[0]?.weight || 0,
                  },
                ],
              })
            }
            onRemoveSet={(index) => {
              if (exercise.sets.length <= 1) return
              const newSets = exercise.sets.filter((_, i) => i !== index)
              newSets.forEach((set, i) => (set.order = i + 1))
              setExercise({ ...exercise, sets: newSets })
            }}
            onUpdateSet={(index, field, value) => {
              const newSets = [...exercise.sets]
              newSets[index] = { ...newSets[index], [field]: value }
              setExercise({ ...exercise, sets: newSets })
            }}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rest">Rest (seconds)</Label>
              <Input
                id="rest"
                type="number"
                min="0"
                step="5"
                value={exercise.restSeconds || 0}
                onChange={(e) =>
                  setExercise({
                    ...exercise,
                    restSeconds: Number.parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tempo">Tempo (optional)</Label>
              <Input
                id="tempo"
                placeholder="e.g., 3-1-3"
                value={exercise.tempo ?? undefined}
                onChange={(e) =>
                  setExercise({ ...exercise, tempo: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions (optional)</Label>
            <Textarea
              id="instructions"
              placeholder="Add any specific instructions for this exercise"
              value={exercise.instructions ?? undefined}
              onChange={(e) =>
                setExercise({ ...exercise, instructions: e.target.value })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={
              (selectedExercise === null && exercise.name === '') ||
              exercise.sets.length === 0
            }
          >
            {editingIndex !== null ? 'Update Exercise' : 'Add Exercise'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
