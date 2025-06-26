import { isNil } from 'lodash'
import { useCallback } from 'react'

import { TrainingPlanFormData } from '@/app/(protected)/trainer/trainings/creator/components/types'
import { createId } from '@/lib/create-id'

import { PartialTrainingPlanFormDataExercise } from './types'

export const useExerciseHandlers = (
  setWeeks: React.Dispatch<React.SetStateAction<TrainingPlanFormData['weeks']>>,
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  const updateExercise = useCallback(
    (
      weekIndex: number,
      dayIndex: number,
      exerciseIndex: number,
      newExercise: PartialTrainingPlanFormDataExercise,
    ) => {
      if (isNil(weekIndex) || isNil(dayIndex) || isNil(exerciseIndex)) {
        console.error('[Update exercise]: Invalid fields', {
          weekIndex,
          dayIndex,
          exerciseIndex,
        })
        return
      }
      setWeeks((prev) => {
        const newWeeks = [...prev]
        const newDays = [...newWeeks[weekIndex].days]
        newDays[dayIndex] = {
          ...newDays[dayIndex],
          exercises: newDays[dayIndex].exercises.map((exercise, idx) =>
            idx === exerciseIndex ? { ...exercise, ...newExercise } : exercise,
          ),
        }
        newWeeks[weekIndex] = { ...newWeeks[weekIndex], days: newDays }
        return newWeeks
      })
      setIsDirty(true)
    },
    [setWeeks, setIsDirty],
  )

  const addExercise = useCallback(
    (
      weekIndex: number,
      dayIndex: number,
      exercise: PartialTrainingPlanFormDataExercise,
    ) => {
      if (isNil(weekIndex) || isNil(dayIndex)) {
        console.error('[Add exercise]: Invalid fields', {
          weekIndex,
          dayIndex,
        })
        return
      }
      setWeeks((prev) => {
        const newWeeks = [...prev]
        const newDays = [...newWeeks[weekIndex].days]

        newDays[dayIndex] = {
          ...newDays[dayIndex],
          exercises: [
            ...newDays[dayIndex].exercises,
            {
              ...exercise,
              id: createId(), // Ensure unique ID after spreading exercise
              name: exercise.name || '',
              instructions: exercise.instructions || '',
              sets: exercise.sets || [],
              order: newDays[dayIndex].exercises.length || 1,
              baseId: exercise.id, // Store original exercise ID as baseId
            },
          ],
        }
        newWeeks[weekIndex] = { ...newWeeks[weekIndex], days: newDays }
        return newWeeks
      })
      setIsDirty(true)
    },
    [setWeeks, setIsDirty],
  )

  const removeExercise = useCallback(
    (weekIndex: number, dayIndex: number, exerciseIndex: number) => {
      console.log('removeExercise', weekIndex, dayIndex, exerciseIndex)
      if (isNil(weekIndex) || isNil(dayIndex) || isNil(exerciseIndex)) {
        console.error('[Remove exercise]: Invalid fields', {
          weekIndex,
          dayIndex,
          exerciseIndex,
        })
        return
      }

      setWeeks((prev) => {
        const newWeeks = [...prev]
        const newDays = [...newWeeks[weekIndex].days]
        newDays[dayIndex] = {
          ...newDays[dayIndex],
          exercises: newDays[dayIndex].exercises.filter(
            (_, idx) => idx !== exerciseIndex,
          ),
        }
        newWeeks[weekIndex] = { ...newWeeks[weekIndex], days: newDays }
        return newWeeks
      })
      setIsDirty(true)
    },
    [setWeeks, setIsDirty],
  )

  return {
    updateExercise,
    addExercise,
    removeExercise,
  }
}
