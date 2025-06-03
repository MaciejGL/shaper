import { isNil } from 'lodash'
import { useCallback } from 'react'

import { TrainingPlanFormData } from '@/app/(protected)/trainer/trainings/creator/components/types'
import { createId } from '@/lib/create-id'

import { PartialTrainingPlanFormDataSet } from './types'

export const useSetHandlers = (
  setWeeks: React.Dispatch<React.SetStateAction<TrainingPlanFormData['weeks']>>,
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  const updateSet = useCallback(
    (
      weekIndex: number,
      dayIndex: number,
      exerciseIndex: number,
      setIndex: number,
      newSet: Partial<
        TrainingPlanFormData['weeks'][0]['days'][0]['exercises'][0]['sets'][0]
      >,
    ) => {
      if (
        isNil(weekIndex) ||
        isNil(dayIndex) ||
        isNil(exerciseIndex) ||
        isNil(setIndex)
      ) {
        console.error('[Update set]: Invalid fields', {
          weekIndex,
          dayIndex,
          exerciseIndex,
          setIndex,
        })
        return
      }
      setWeeks((prev) => {
        const newWeeks = [...prev]
        const newDays = [...newWeeks[weekIndex].days]
        const newExercises = [...newDays[dayIndex].exercises]
        newExercises[exerciseIndex] = {
          ...newExercises[exerciseIndex],
          sets: newExercises[exerciseIndex].sets.map((set, idx) =>
            idx === setIndex ? { ...set, ...newSet } : set,
          ),
        }
        newDays[dayIndex] = { ...newDays[dayIndex], exercises: newExercises }
        newWeeks[weekIndex] = { ...newWeeks[weekIndex], days: newDays }
        return newWeeks
      })
      setIsDirty(true)
    },
    [setWeeks, setIsDirty],
  )

  const addSet = useCallback(
    (
      weekIndex: number,
      dayIndex: number,
      exerciseIndex: number,
      set: PartialTrainingPlanFormDataSet,
    ) => {
      if (isNil(weekIndex) || isNil(dayIndex) || isNil(exerciseIndex)) {
        console.error('[Add set]: Invalid fields', {
          weekIndex,
          dayIndex,
          exerciseIndex,
        })
        return
      }
      setWeeks((prev) => {
        const previousSet =
          prev[weekIndex].days[dayIndex].exercises[exerciseIndex].sets.at(-1)
        const newWeeks = [...prev]
        const newDays = [...newWeeks[weekIndex].days]
        const newExercises = [...newDays[dayIndex].exercises]
        newExercises[exerciseIndex] = {
          ...newExercises[exerciseIndex],
          sets: [
            ...newExercises[exerciseIndex].sets,
            {
              id: createId(),
              reps: previousSet?.reps ?? null,
              weight: previousSet?.weight ?? null,
              rpe: previousSet?.rpe ?? null,
              minReps: previousSet?.minReps ?? null,
              maxReps: previousSet?.maxReps ?? null,
              order: newExercises[exerciseIndex].sets.length,
              ...set,
            },
          ],
        }
        newDays[dayIndex] = { ...newDays[dayIndex], exercises: newExercises }
        newWeeks[weekIndex] = { ...newWeeks[weekIndex], days: newDays }
        return newWeeks
      })
      setIsDirty(true)
    },
    [setWeeks, setIsDirty],
  )

  const removeSet = useCallback(
    (
      weekIndex: number,
      dayIndex: number,
      exerciseIndex: number,
      setIndex: number,
    ) => {
      if (
        isNil(weekIndex) ||
        isNil(dayIndex) ||
        isNil(exerciseIndex) ||
        isNil(setIndex)
      ) {
        console.error('[Remove set]: Invalid fields', {
          weekIndex,
          dayIndex,
          exerciseIndex,
          setIndex,
        })
        return
      }
      setWeeks((prev) => {
        const newWeeks = [...prev]
        const newDays = [...newWeeks[weekIndex].days]
        const newExercises = [...newDays[dayIndex].exercises]
        newExercises[exerciseIndex] = {
          ...newExercises[exerciseIndex],
          sets: newExercises[exerciseIndex].sets.filter(
            (_, idx) => idx !== setIndex,
          ),
        }
        newDays[dayIndex] = { ...newDays[dayIndex], exercises: newExercises }
        newWeeks[weekIndex] = { ...newWeeks[weekIndex], days: newDays }
        return newWeeks
      })
      setIsDirty(true)
    },
    [setWeeks, setIsDirty],
  )

  return {
    updateSet,
    addSet,
    removeSet,
  }
}
