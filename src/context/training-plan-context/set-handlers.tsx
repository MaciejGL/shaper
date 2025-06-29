import { isNil } from 'lodash'
import { useCallback } from 'react'

import { TrainingPlanFormData } from '@/app/(protected)/trainer/trainings/creator-old/components/types'
import {
  useAddSetToExerciseMutation,
  useRemoveSetFromExerciseMutation,
  useUpdateExerciseSetMutation,
} from '@/generated/graphql-client'
import { useDebouncedInvalidation } from '@/hooks/use-debounced-invalidation'
import { createId } from '@/lib/create-id'

import { PartialTrainingPlanFormDataSet } from './types'

export const useSetHandlers = (
  setWeeks: React.Dispatch<React.SetStateAction<TrainingPlanFormData['weeks']>>,
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>,
  weeks: TrainingPlanFormData['weeks'],
) => {
  const { mutateAsync: updateExerciseSetMutation } =
    useUpdateExerciseSetMutation()
  const { mutateAsync: addSetToExerciseMutation } =
    useAddSetToExerciseMutation()
  const { mutateAsync: removeSetFromExerciseMutation } =
    useRemoveSetFromExerciseMutation()

  // Use the reusable debounced invalidation hook
  const debouncedInvalidateQueries = useDebouncedInvalidation({
    queryKey: ['GetTemplateTrainingPlanById'],
    delay: 1000,
  })

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

      const beforeWeeks = [...weeks]
      const currentSet =
        weeks[weekIndex].days[dayIndex].exercises[exerciseIndex].sets[setIndex]

      if (!currentSet) {
        console.error('[Update set]: Set not found', {
          weekIndex,
          dayIndex,
          exerciseIndex,
          setIndex,
        })
        return
      }

      // Update local state optimistically
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

      // Call backend mutation
      updateExerciseSetMutation(
        {
          input: {
            id: currentSet.id,
            order: newSet.order ?? currentSet.order,
            reps: newSet.reps ?? currentSet.reps,
            minReps: newSet.minReps ?? currentSet.minReps,
            maxReps: newSet.maxReps ?? currentSet.maxReps,
            weight: newSet.weight ?? currentSet.weight,
            rpe: newSet.rpe ?? currentSet.rpe,
          },
        },
        {
          onSuccess: () => {
            setIsDirty(false)
            debouncedInvalidateQueries()
          },
          onError: (error) => {
            console.error('[Update set]: Failed to update set', error)
            setWeeks(beforeWeeks)
            setIsDirty(true)
          },
        },
      )
    },
    [
      setWeeks,
      setIsDirty,
      updateExerciseSetMutation,
      weeks,
      debouncedInvalidateQueries,
    ],
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

      const beforeWeeks = [...weeks]
      const currentExercise =
        weeks[weekIndex].days[dayIndex].exercises[exerciseIndex]

      if (!currentExercise) {
        console.error('[Add set]: Exercise not found', {
          weekIndex,
          dayIndex,
          exerciseIndex,
        })
        return
      }

      const previousSet = currentExercise.sets?.at(-1)
      const newOrder = (currentExercise.sets?.length ?? 0) + 1

      const newSetData = {
        id: createId(),
        reps: previousSet?.reps ?? null,
        weight: previousSet?.weight ?? null,
        rpe: previousSet?.rpe ?? null,
        minReps: previousSet?.minReps ?? null,
        maxReps: previousSet?.maxReps ?? null,
        order: newOrder,
        ...set,
      }

      // Update local state optimistically
      setWeeks((prev) => {
        const newWeeks = [...prev]
        const newDays = [...newWeeks[weekIndex].days]
        const newExercises = [...newDays[dayIndex].exercises]
        newExercises[exerciseIndex] = {
          ...newExercises[exerciseIndex],
          sets: [...(newExercises[exerciseIndex]?.sets ?? []), newSetData],
        }
        newDays[dayIndex] = { ...newDays[dayIndex], exercises: newExercises }
        newWeeks[weekIndex] = { ...newWeeks[weekIndex], days: newDays }
        return newWeeks
      })
      setIsDirty(true)

      // Call backend mutation
      addSetToExerciseMutation(
        {
          input: {
            exerciseId: currentExercise.id,
            order: newOrder,
            reps: newSetData.reps,
            minReps: newSetData.minReps,
            maxReps: newSetData.maxReps,
            weight: newSetData.weight,
            rpe: newSetData.rpe,
          },
        },
        {
          onSuccess: (result) => {
            // Update the local state with the real ID from backend
            const newSetId = result.addSetToExercise
            setWeeks((prev) => {
              const newWeeks = [...prev]
              const newDays = [...newWeeks[weekIndex].days]
              const newExercises = [...newDays[dayIndex].exercises]
              const sets = [...newExercises[exerciseIndex].sets]
              const lastSetIndex = sets.length - 1
              sets[lastSetIndex] = { ...sets[lastSetIndex], id: newSetId }
              newExercises[exerciseIndex] = {
                ...newExercises[exerciseIndex],
                sets,
              }
              newDays[dayIndex] = {
                ...newDays[dayIndex],
                exercises: newExercises,
              }
              newWeeks[weekIndex] = { ...newWeeks[weekIndex], days: newDays }
              return newWeeks
            })
            setIsDirty(false)
            debouncedInvalidateQueries()
          },
          onError: (error) => {
            console.error('[Add set]: Failed to add set', error)
            setWeeks(beforeWeeks)
            setIsDirty(true)
          },
        },
      )
    },
    [
      setWeeks,
      setIsDirty,
      addSetToExerciseMutation,
      weeks,
      debouncedInvalidateQueries,
    ],
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

      const beforeWeeks = [...weeks]
      const currentSet =
        weeks[weekIndex].days[dayIndex].exercises[exerciseIndex].sets[setIndex]

      if (!currentSet) {
        console.error('[Remove set]: Set not found', {
          weekIndex,
          dayIndex,
          exerciseIndex,
          setIndex,
        })
        return
      }

      // Update local state optimistically
      setWeeks((prev) => {
        const newWeeks = [...prev]
        const newDays = [...newWeeks[weekIndex].days]
        const newExercises = [...newDays[dayIndex].exercises]
        newExercises[exerciseIndex] = {
          ...newExercises[exerciseIndex],
          sets: newExercises[exerciseIndex].sets
            .filter((_, idx) => idx !== setIndex)
            .map((set, idx) => ({
              ...set,
              order: idx + 1,
            })),
        }
        newDays[dayIndex] = { ...newDays[dayIndex], exercises: newExercises }
        newWeeks[weekIndex] = { ...newWeeks[weekIndex], days: newDays }
        return newWeeks
      })
      setIsDirty(true)

      // Call backend mutation
      removeSetFromExerciseMutation(
        {
          setId: currentSet.id,
        },
        {
          onSuccess: () => {
            setIsDirty(false)
            debouncedInvalidateQueries()
          },
          onError: (error) => {
            console.error('[Remove set]: Failed to remove set', error)
            setWeeks(beforeWeeks)
            setIsDirty(true)
          },
        },
      )
    },
    [
      setWeeks,
      setIsDirty,
      removeSetFromExerciseMutation,
      weeks,
      debouncedInvalidateQueries,
    ],
  )

  return {
    updateSet,
    addSet,
    removeSet,
  }
}
