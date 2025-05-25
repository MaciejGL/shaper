import { useState } from 'react'

import type { TrainingExercise, TrainingPlanFormData } from '../types'

type UseExercisesSetupProps = {
  weeks: TrainingPlanFormData['weeks']
  activeWeek: number
  activeDay: number
  setActiveDay: (day: number) => void
  updateWeeks: (weeks: TrainingPlanFormData['weeks']) => void
}

export function useExercisesSetup({
  weeks,
  activeWeek,
  activeDay,
  updateWeeks,
}: UseExercisesSetupProps) {
  const [exerciseFormOpen, setExerciseFormOpen] = useState(false)
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<
    number | null
  >(null)

  const getCurrentDay = () => {
    return weeks[activeWeek].days.find((day) => day.dayOfWeek === activeDay)
  }

  const handleSaveExercise = (exercise: TrainingExercise) => {
    const currentDay = getCurrentDay()
    if (!currentDay || currentDay.isRestDay) return

    const newWeeks = [...weeks]
    const dayIndex = newWeeks[activeWeek].days.findIndex(
      (day) => day.dayOfWeek === activeDay,
    )

    if (editingExerciseIndex !== null) {
      // Update existing exercise
      newWeeks[activeWeek].days[dayIndex].exercises[editingExerciseIndex] = {
        ...exercise,
        order:
          newWeeks[activeWeek].days[dayIndex].exercises[editingExerciseIndex]
            .order,
      }
    } else {
      // Add new exercise
      newWeeks[activeWeek].days[dayIndex].exercises.push({
        ...exercise,
        order: newWeeks[activeWeek].days[dayIndex].exercises.length,
      })
    }

    updateWeeks(newWeeks)
    handleCloseExerciseForm()
  }

  const handleRemoveExercise = (exerciseIndex: number) => {
    const newWeeks = [...weeks]
    const dayIndex = newWeeks[activeWeek].days.findIndex(
      (day) => day.dayOfWeek === activeDay,
    )

    // Remove exercise and reorder remaining ones
    newWeeks[activeWeek].days[dayIndex].exercises.splice(exerciseIndex, 1)
    newWeeks[activeWeek].days[dayIndex].exercises.forEach((ex, idx) => {
      ex.order = idx
    })

    updateWeeks(newWeeks)
  }

  const handleMoveExercise = (
    exerciseIndex: number,
    direction: 'up' | 'down',
  ) => {
    const newWeeks = [...weeks]
    const dayIndex = newWeeks[activeWeek].days.findIndex(
      (day) => day.dayOfWeek === activeDay,
    )
    const exercises = newWeeks[activeWeek].days[dayIndex].exercises

    // Check if move is possible
    if (
      (direction === 'up' && exerciseIndex === 0) ||
      (direction === 'down' && exerciseIndex === exercises.length - 1)
    ) {
      return
    }

    // Swap exercises and update order
    const newIndex = direction === 'up' ? exerciseIndex - 1 : exerciseIndex + 1
    const temp = exercises[exerciseIndex]
    exercises[exerciseIndex] = exercises[newIndex]
    exercises[newIndex] = temp
    exercises.forEach((ex, idx) => (ex.order = idx))

    updateWeeks(newWeeks)
  }

  const handleEditExercise = (index: number) => {
    setEditingExerciseIndex(index)
    setExerciseFormOpen(true)
  }

  const handleCloseExerciseForm = () => {
    setExerciseFormOpen(false)
    setEditingExerciseIndex(null)
  }

  return {
    // State
    exerciseFormOpen,
    editingExerciseIndex,
    currentDay: getCurrentDay(),

    // Actions
    setExerciseFormOpen,
    setEditingExerciseIndex,
    handleSaveExercise,
    handleRemoveExercise,
    handleMoveExercise,
    handleEditExercise,
    handleCloseExerciseForm,
  }
}
