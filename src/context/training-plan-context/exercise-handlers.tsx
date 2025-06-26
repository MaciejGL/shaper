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
      console.log(
        'updateExercise',
        weekIndex,
        dayIndex,
        exerciseIndex,
        newExercise,
      )
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
              isPublic: exercise.isPublic || false,
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

  const moveExercise = useCallback(
    (
      sourceWeekIndex: number,
      sourceDayIndex: number,
      sourceExerciseIndex: number,
      targetWeekIndex: number,
      targetDayIndex: number,
      targetExerciseIndex: number,
    ) => {
      if (
        isNil(sourceWeekIndex) ||
        isNil(sourceDayIndex) ||
        isNil(sourceExerciseIndex) ||
        isNil(targetWeekIndex) ||
        isNil(targetDayIndex) ||
        isNil(targetExerciseIndex)
      ) {
        console.error('[Move exercise]: Invalid fields', {
          sourceWeekIndex,
          sourceDayIndex,
          sourceExerciseIndex,
          targetWeekIndex,
          targetDayIndex,
          targetExerciseIndex,
        })
        return
      }

      setWeeks((prev) => {
        const newWeeks = [...prev]

        const sourceDay = newWeeks[sourceWeekIndex].days[sourceDayIndex]
        const exerciseToMove = sourceDay.exercises[sourceExerciseIndex]

        if (!exerciseToMove) {
          console.error('[Move exercise]: Exercise not found')
          return prev
        }

        const newSourceDays = [...newWeeks[sourceWeekIndex].days]
        newSourceDays[sourceDayIndex] = {
          ...sourceDay,
          exercises: sourceDay.exercises.filter(
            (_, idx) => idx !== sourceExerciseIndex,
          ),
        }
        newWeeks[sourceWeekIndex] = {
          ...newWeeks[sourceWeekIndex],
          days: newSourceDays,
        }

        const targetDay = newWeeks[targetWeekIndex].days[targetDayIndex]
        const newTargetDays = [...newWeeks[targetWeekIndex].days]

        const newTargetExercises = [...targetDay.exercises]
        newTargetExercises.splice(targetExerciseIndex, 0, exerciseToMove)

        newTargetDays[targetDayIndex] = {
          ...targetDay,
          exercises: newTargetExercises,
        }
        newWeeks[targetWeekIndex] = {
          ...newWeeks[targetWeekIndex],
          days: newTargetDays,
        }

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
    moveExercise,
  }
}
