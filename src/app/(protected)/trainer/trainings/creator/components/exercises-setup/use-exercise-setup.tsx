import { useMemo, useState } from 'react'

import { useTrainingPlan } from '@/context/training-plan-context/training-plan-context'
import { useTrainerExercisesQuery } from '@/generated/graphql-client'

export function useExercisesSetup() {
  const { formData, activeWeek, activeDay } = useTrainingPlan()
  const weeks = formData.weeks
  const [exerciseFormOpen, setExerciseFormOpen] = useState(false)
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<
    number | null
  >(null)
  const { data: trainerExercises, isLoading: trainerExercisesLoading } =
    useTrainerExercisesQuery()

  const currentDay = useMemo(() => {
    return weeks[activeWeek].days.find((day) => day.dayOfWeek === activeDay)
  }, [weeks, activeWeek, activeDay])

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
    currentDay,
    trainerExercises,
    trainerExercisesLoading,

    // Actions
    setExerciseFormOpen,
    setEditingExerciseIndex,

    handleEditExercise,
    handleCloseExerciseForm,
  }
}
