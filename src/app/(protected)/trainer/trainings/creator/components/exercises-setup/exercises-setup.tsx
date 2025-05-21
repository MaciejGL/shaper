'use client'

import { Plus, PlusCircle } from 'lucide-react'
import React from 'react'

import { RadioGroupTabs } from '@/components/radio-group'
import { Button } from '@/components/ui/button'

import { TrainingPlanFormData } from '../types'
import { dayNames } from '../utils'

import { ExerciseCard } from './exercise-card'
import { ExerciseForm } from './exercise-form'
import { useExercisesSetup } from './use-exercise-setup'

type ExercisesSetupProps = {
  weeks: TrainingPlanFormData['weeks']
  activeWeek: number
  setActiveWeek: (week: number) => void
  activeDay: number
  setActiveDay: (day: number) => void
  updateWeeks: (weeks: TrainingPlanFormData['weeks']) => void
}

export function ExercisesSetup({
  weeks,
  activeWeek,
  setActiveWeek,
  activeDay,
  setActiveDay,
  updateWeeks,
}: ExercisesSetupProps) {
  const {
    exerciseFormOpen,
    editingExerciseIndex,
    currentDay,
    setExerciseFormOpen,
    handleSaveExercise,
    handleRemoveExercise,
    handleMoveExercise,
    handleEditExercise,
    handleCloseExerciseForm,
  } = useExercisesSetup({
    weeks,
    activeWeek,
    activeDay,
    setActiveDay,
    updateWeeks,
  })

  const days = weeks[activeWeek].days

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <RadioGroupTabs
          title="Select Week"
          items={weeks.map((week, index) => ({
            id: `week-${index}`,
            value: index.toString(),
            label: `Week ${index + 1}`,
          }))}
          onValueChange={(value) => setActiveWeek(Number.parseInt(value))}
          value={activeWeek.toString()}
        />

        <RadioGroupTabs
          title="Select Day"
          items={days.map((day) => ({
            id: `day-${day.dayOfWeek}`,
            value: day.dayOfWeek.toString(),
            label: dayNames[day.dayOfWeek],
            disabled: day.isRestDay,
          }))}
          onValueChange={(value) => setActiveDay(Number.parseInt(value))}
          value={activeDay.toString()}
        />
      </div>

      {currentDay && !currentDay.isRestDay ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">
              {dayNames[currentDay.dayOfWeek]} -{' '}
              {currentDay.workoutType || 'Workout'}
            </h3>
            <Button onClick={() => setExerciseFormOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Exercise
            </Button>
          </div>

          <ExerciseForm
            isOpen={exerciseFormOpen}
            onOpenChange={handleCloseExerciseForm}
            onSave={handleSaveExercise}
            editingExercise={
              editingExerciseIndex !== null
                ? currentDay.exercises[editingExerciseIndex]
                : undefined
            }
            editingIndex={editingExerciseIndex}
          />

          {currentDay.exercises.length > 0 ? (
            <div className="space-y-2">
              {currentDay.exercises.map((exercise, index) => (
                <ExerciseCard
                  key={exercise.order}
                  exercise={exercise}
                  index={index}
                  onEdit={handleEditExercise}
                  onRemove={handleRemoveExercise}
                  onMove={handleMoveExercise}
                />
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border rounded-lg">
              <div className="text-muted-foreground">
                No exercises added yet
              </div>
              <Button
                variant="outline"
                className="mt-4 mx-auto"
                onClick={() => setExerciseFormOpen(true)}
                iconStart={<Plus />}
              >
                Add Your First Exercise
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center p-8 border rounded-lg">
          <div className="text-muted-foreground">
            {currentDay?.isRestDay
              ? `${dayNames[currentDay.dayOfWeek]} is a rest day`
              : 'Please select a training day'}
          </div>
        </div>
      )}
    </div>
  )
}
