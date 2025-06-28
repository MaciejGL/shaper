import { isNil } from 'lodash'
import { useCallback } from 'react'

import {
  TrainingExercise,
  TrainingPlanFormData,
} from '@/app/(protected)/trainer/trainings/creator-old/components/types'
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
      const exerciseData: PartialTrainingPlanFormDataExercise = {
        name: newExercise.name,
        instructions: newExercise.instructions,
        sets: newExercise.sets,
        order: newExercise.order,
        baseId: newExercise.baseId,
        videoUrl: newExercise.videoUrl,
        type: newExercise.type,
        warmupSets: newExercise.warmupSets,
        tempo: newExercise.tempo,
        additionalInstructions: newExercise.additionalInstructions,
        restSeconds: newExercise.restSeconds,
      }
      setWeeks((prev) => {
        const newWeeks = [...prev]
        const newDays = [...newWeeks[weekIndex].days]
        newDays[dayIndex] = {
          ...newDays[dayIndex],
          exercises: newDays[dayIndex].exercises.map((exercise, idx) =>
            idx === exerciseIndex ? { ...exercise, ...exerciseData } : exercise,
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
      atIndex?: number,
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

        const currentExercises = newDays[dayIndex].exercises
        const newExercise: TrainingExercise = {
          ...exercise,
          id: createId(), // Ensure unique ID after spreading exercise
          name: exercise.name || '',
          instructions: exercise.instructions,
          sets: exercise.sets || [],
          order: currentExercises.length + 1, // Will be adjusted below if needed
          baseId: exercise.id, // Store original exercise ID as baseId
          additionalInstructions: exercise.additionalInstructions,
          restSeconds: exercise.restSeconds,
          tempo: exercise.tempo,
          type: exercise.type,
          warmupSets: exercise.warmupSets,
          videoUrl: exercise.videoUrl,
        }

        let newExercises: typeof currentExercises

        // If atIndex is provided and valid, insert at that position
        if (
          !isNil(atIndex) &&
          atIndex >= 0 &&
          atIndex <= currentExercises.length
        ) {
          newExercises = [
            ...currentExercises.slice(0, atIndex),
            newExercise,
            ...currentExercises.slice(atIndex),
          ]
          // Update order for all exercises after the insertion point
          newExercises = newExercises.map((ex, idx) => ({
            ...ex,
            order: idx + 1,
          }))
        } else {
          // Default behavior: add at the end
          newExercises = [...currentExercises, newExercise]
        }

        newDays[dayIndex] = {
          ...newDays[dayIndex],
          exercises: newExercises,
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

        // Remove exercise from source and update order
        const newSourceDays = [...newWeeks[sourceWeekIndex].days]
        const sourceExercisesWithoutMoved = sourceDay.exercises.filter(
          (_, idx) => idx !== sourceExerciseIndex,
        )
        newSourceDays[sourceDayIndex] = {
          ...sourceDay,
          exercises: sourceExercisesWithoutMoved.map((ex, idx) => ({
            ...ex,
            order: idx + 1, // Update order after removal
          })),
        }
        newWeeks[sourceWeekIndex] = {
          ...newWeeks[sourceWeekIndex],
          days: newSourceDays,
        }

        // Add exercise to target and update order
        const targetDay = newWeeks[targetWeekIndex].days[targetDayIndex]
        const newTargetDays = [...newWeeks[targetWeekIndex].days]

        const newTargetExercises = [...targetDay.exercises]
        newTargetExercises.splice(targetExerciseIndex, 0, exerciseToMove)

        newTargetDays[targetDayIndex] = {
          ...targetDay,
          exercises: newTargetExercises.map((ex, idx) => ({
            ...ex,
            order: idx + 1, // Update order after insertion
          })),
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
