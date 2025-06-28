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
import { useTrainingPlan } from '@/context/training-plan-context/training-plan-context'
import { GQLTrainerExercisesQuery } from '@/generated/graphql-client'

import type { TrainingExercise } from '../types'

// import { ExerciseSets } from './exercise-sets'
import { ExerciseSearch } from './exercises-search'

const initialExercise: TrainingExercise = {
  id: '',
  name: '',
  sets: [{ id: '', order: 1, reps: 10, weight: null }],
  restSeconds: 60,
  tempo: '',
  instructions: '',
  order: 1,
  isPublic: false,
}

type ExerciseFormProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editingExercise?: TrainingExercise
  editingExerciseIndex?: number | null
  trainerExercises?: GQLTrainerExercisesQuery
}

export function ExerciseForm({
  isOpen,
  onOpenChange,
  editingExerciseIndex,
  trainerExercises,
}: ExerciseFormProps) {
  const { activeWeek, activeDay, addExercise, formData, updateExercise } =
    useTrainingPlan()
  const currentDay = formData.weeks[activeWeek].days[activeDay]
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null)
  const [exercise, setExercise] = useState<TrainingExercise>(initialExercise)

  useEffect(() => {
    if (editingExerciseIndex !== null && editingExerciseIndex !== undefined) {
      const currentExercise = currentDay.exercises[editingExerciseIndex]
      setExercise(currentExercise)
    } else {
      setExercise(initialExercise)
    }
  }, [editingExerciseIndex, currentDay])

  useEffect(() => {
    if (selectedExercise) {
      const exercise = [
        ...(trainerExercises?.userExercises || []),
        ...(trainerExercises?.publicExercises || []),
      ].find((ex) => ex.id === selectedExercise)

      if (exercise) {
        setExercise((prev) => ({
          ...prev,
          name: exercise.name,
          id: exercise.id,
          instructions: exercise.description,
          videoUrl: exercise.videoUrl,
          baseId: exercise.id,
          order: currentDay.exercises.length + 1,
        }))
      }
    }
  }, [selectedExercise, trainerExercises, currentDay])

  const handleSave = () => {
    if (editingExerciseIndex !== null && editingExerciseIndex !== undefined) {
      updateExercise(activeWeek, activeDay, editingExerciseIndex, exercise)
    } else {
      addExercise(activeWeek, activeDay, exercise)
    }
    setExercise(initialExercise)
    setSelectedExercise(null)
    setSearchTerm('')
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent dialogTitle="Add Exercise" className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {editingExerciseIndex !== null ? 'Edit Exercise' : 'Add Exercise'}
          </DialogTitle>
          <DialogDescription>
            {editingExerciseIndex !== null
              ? 'Edit the exercise details and sets.'
              : 'Search for an existing exercise or create a custom one.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {editingExerciseIndex === null && (
            <ExerciseSearch
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedExercise={selectedExercise}
              onExerciseSelect={setSelectedExercise}
              trainerExercises={trainerExercises}
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
            {editingExerciseIndex !== null ? 'Update Exercise' : 'Add Exercise'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
