import { isNil } from 'lodash'
import { useCallback } from 'react'

import {
  TrainingExercise,
  TrainingPlanFormData,
} from '@/app/(protected)/trainer/types'
import {
  useAddExerciseToDayMutation,
  useMoveExerciseMutation,
  useRemoveExerciseFromDayMutation,
  useUpdateTrainingExerciseMutation,
} from '@/generated/graphql-client'
import { useDebouncedInvalidation } from '@/hooks/use-debounced-invalidation'
import { useDebouncedMutationWrapper } from '@/hooks/use-debounced-mutation-wrapper'
import { createId } from '@/lib/create-id'

import { PartialTrainingPlanFormDataExercise } from './types'

export const useExerciseHandlers = ({
  setWeeks,
  setIsDirty,
  weeks,
}: {
  setWeeks: React.Dispatch<React.SetStateAction<TrainingPlanFormData['weeks']>>
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>
  weeks: TrainingPlanFormData['weeks']
}) => {
  const debouncedInvalidateQueries = useDebouncedInvalidation({
    queryKey: ['GetTemplateTrainingPlanById'],
    delay: 1000,
  })
  const { mutateAsync: updateExerciseMutation } =
    useUpdateTrainingExerciseMutation()

  // Wrap the exercise update mutation with debouncing for text inputs
  const debouncedUpdateExerciseMutation = useDebouncedMutationWrapper(
    updateExerciseMutation,
    {
      delay: 700, // 700ms delay for text input debouncing
      onSuccess: () => {
        setIsDirty(false)
        debouncedInvalidateQueries()
      },
      onError: (error) => {
        console.error('[Update exercise]: Failed to update exercise', {
          error,
        })
        // We'll handle rollback in the individual call
      },
    },
  )
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
      const currentExercise =
        weeks[weekIndex].days[dayIndex].exercises[exerciseIndex]
      const beforeWeeks = [...weeks]
      if (!currentExercise) {
        console.error('[Update exercise]: Exercise not found', {
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
      if (!exerciseData.order) {
        console.error('[Update exercise]: Order is required', {
          weekIndex,
          dayIndex,
          exerciseIndex,
        })
        return
      }
      // Update local state immediately for responsive UI
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

      // Use debounced mutation for API call
      debouncedUpdateExerciseMutation(
        {
          input: {
            id: currentExercise.id,
            order: exerciseData.order,
            name: exerciseData.name,
            instructions: exerciseData.instructions,
            sets: exerciseData.sets,
            baseId: exerciseData.baseId,
            videoUrl: exerciseData.videoUrl,
            additionalInstructions: exerciseData.additionalInstructions,
            restSeconds: exerciseData.restSeconds,
            tempo: exerciseData.tempo,
            type: exerciseData.type,
            warmupSets: exerciseData.warmupSets,
          },
        },
        {
          // Handle error and rollback optimistic update
          onError: () => {
            console.error('[Update exercise]: Failed to update exercise', {
              weekIndex,
              dayIndex,
              exerciseIndex,
            })
            setWeeks(beforeWeeks)
            setIsDirty(true)
          },
        },
      )
    },
    [setWeeks, setIsDirty, debouncedUpdateExerciseMutation, weeks],
  )

  const { mutateAsync: addExerciseToDayMutation } =
    useAddExerciseToDayMutation()

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
      const currentExercises = weeks[weekIndex].days[dayIndex].exercises
      if (!currentExercises) {
        console.error('[Add exercise]: No exercises found', {
          weekIndex,
          dayIndex,
        })
        return
      }
      const beforeWeeks = [...weeks]

      const newExercises = [...currentExercises]
      const order =
        typeof atIndex === 'number' ? atIndex + 1 : newExercises.length + 1

      const newExercise: TrainingExercise = {
        id: createId(),
        name: exercise.name || '',
        instructions: exercise.instructions,
        sets: exercise.sets || [],
        order: order,
        baseId: exercise.id,
        additionalInstructions: exercise.additionalInstructions,
        restSeconds: exercise.restSeconds,
        tempo: exercise.tempo,
        type: exercise.type,
        warmupSets: exercise.warmupSets,
        videoUrl: exercise.videoUrl,
      }

      if (
        typeof atIndex === 'number' &&
        atIndex >= 0 &&
        atIndex <= newExercises.length
      ) {
        newExercises.splice(atIndex, 0, newExercise)
      } else {
        newExercises.push(newExercise)
      }

      const newDays = [...weeks[weekIndex].days]
      newDays[dayIndex] = {
        ...newDays[dayIndex],
        exercises: newExercises,
      }
      const newWeeks = [...weeks]
      newWeeks[weekIndex] = { ...newWeeks[weekIndex], days: newDays }

      setWeeks(newWeeks)
      setIsDirty(true)
      addExerciseToDayMutation(
        {
          input: {
            dayId: weeks[weekIndex].days[dayIndex].id,
            name: newExercise.name,
            order: newExercise.order,
            restSeconds: newExercise.restSeconds,
            tempo: newExercise.tempo,
            additionalInstructions: newExercise.additionalInstructions,
            type: newExercise.type,
            warmupSets: newExercise.warmupSets,
            baseId: newExercise.baseId,
            instructions: newExercise.instructions,
          },
        },
        {
          onSuccess: () => {
            setIsDirty(false)
            debouncedInvalidateQueries()
          },
          onError: () => {
            console.error('[Add exercise]: Failed to add exercise', {
              weekIndex,
              dayIndex,
            })
            setWeeks(beforeWeeks)
            setIsDirty(true)
          },
        },
      )
    },
    [
      setWeeks,
      setIsDirty,
      addExerciseToDayMutation,
      weeks,
      debouncedInvalidateQueries,
    ],
  )

  const { mutateAsync: removeExerciseFromDayMutation } =
    useRemoveExerciseFromDayMutation()

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

      const beforeWeeks = [...weeks]
      const currentExercise =
        weeks[weekIndex].days[dayIndex].exercises[exerciseIndex]
      if (!currentExercise) {
        console.error('[Remove exercise]: Exercise not found', {
          weekIndex,
          dayIndex,
          exerciseIndex,
        })
        return
      }

      const deletedOrder = currentExercise.order
      const newExercises = [...weeks[weekIndex].days[dayIndex].exercises]
      newExercises.splice(exerciseIndex, 1)

      // Only decrement order of exercises that came after the deleted one
      const updatedExercises = newExercises.map((ex) => ({
        ...ex,
        order: ex.order > deletedOrder ? ex.order - 1 : ex.order,
      }))

      const newDays = [...weeks[weekIndex].days]
      newDays[dayIndex] = {
        ...newDays[dayIndex],
        exercises: updatedExercises,
      }
      const newWeeks = [...weeks]
      newWeeks[weekIndex] = { ...newWeeks[weekIndex], days: newDays }

      setWeeks(newWeeks)
      setIsDirty(true)
      removeExerciseFromDayMutation(
        {
          exerciseId: currentExercise.id,
        },
        {
          onSuccess: () => {
            setIsDirty(false)
            debouncedInvalidateQueries()
          },
          onError: () => {
            console.error('[Remove exercise]: Failed to remove exercise', {
              weekIndex,
              dayIndex,
            })
            setWeeks(beforeWeeks)
            setIsDirty(true)
          },
        },
      )
    },
    [
      setWeeks,
      setIsDirty,
      removeExerciseFromDayMutation,
      weeks,
      debouncedInvalidateQueries,
    ],
  )

  const { mutateAsync: moveExerciseMutation } = useMoveExerciseMutation()

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

      const beforeWeeks = [...weeks]
      const sourceDay = weeks[sourceWeekIndex].days[sourceDayIndex]
      const exerciseToMove = sourceDay.exercises[sourceExerciseIndex]

      if (!exerciseToMove) {
        console.error('[Move exercise]: Exercise not found')
        return
      }

      // Check if moving within the same day (reordering)
      const isSameDay =
        sourceWeekIndex === targetWeekIndex && sourceDayIndex === targetDayIndex

      if (isSameDay) {
        // Moving within same day - use efficient reordering
        const currentOrder = exerciseToMove.order
        const newOrder = targetExerciseIndex + 1

        if (currentOrder === newOrder) {
          return // No change needed
        }

        const newWeeks = [...weeks]
        const newDays = [...newWeeks[sourceWeekIndex].days]
        const newExercises = [...newDays[sourceDayIndex].exercises]

        // Apply efficient reordering logic - create new objects instead of mutating
        const reorderedExercises = newExercises.map((ex) => {
          if (ex.id === exerciseToMove.id) {
            // This is the exercise being moved
            return { ...ex, order: newOrder }
          } else if (currentOrder < newOrder) {
            // Moving down: decrement exercises between current and new position
            if (ex.order > currentOrder && ex.order <= newOrder) {
              return { ...ex, order: ex.order - 1 }
            }
          } else {
            // Moving up: increment exercises between new and current position
            if (ex.order >= newOrder && ex.order < currentOrder) {
              return { ...ex, order: ex.order + 1 }
            }
          }
          return ex
        })

        // Sort exercises by order to ensure correct visual positioning
        const sortedExercises = reorderedExercises.sort(
          (a, b) => a.order - b.order,
        )

        newDays[sourceDayIndex] = {
          ...newDays[sourceDayIndex],
          exercises: sortedExercises,
        }
        newWeeks[sourceWeekIndex] = {
          ...newWeeks[sourceWeekIndex],
          days: newDays,
        }

        setWeeks(newWeeks)
        setIsDirty(true)
        moveExerciseMutation(
          {
            input: {
              dayId: sourceDay.id,
              exerciseId: exerciseToMove.id,
              newOrder: newOrder,
            },
          },
          {
            onSuccess: () => {
              setIsDirty(false)
              debouncedInvalidateQueries()
            },
            onError: (error) => {
              console.error(
                '[Move exercise]: Failed to move exercise (same day)',
                error,
              )
              setWeeks(beforeWeeks)
              setIsDirty(true)
            },
          },
        )
      } else {
        // Moving between different days - use the enhanced backend mutation
        const targetDay = weeks[targetWeekIndex].days[targetDayIndex]
        const newOrder = targetExerciseIndex + 1

        setWeeks((prev) => {
          const newWeeks = [...prev]

          // Remove from source day
          const newSourceDays = [...newWeeks[sourceWeekIndex].days]
          const sourceExercisesWithoutMoved = sourceDay.exercises.filter(
            (_, idx) => idx !== sourceExerciseIndex,
          )
          // Only decrement order of exercises that came after the moved one
          const updatedSourceExercises = sourceExercisesWithoutMoved.map(
            (ex) => ({
              ...ex,
              order: ex.order > exerciseToMove.order ? ex.order - 1 : ex.order,
            }),
          )

          // Sort source day exercises by order after removal
          const sortedSourceExercises = updatedSourceExercises.sort(
            (a, b) => a.order - b.order,
          )

          newSourceDays[sourceDayIndex] = {
            ...sourceDay,
            exercises: sortedSourceExercises,
          }
          newWeeks[sourceWeekIndex] = {
            ...newWeeks[sourceWeekIndex],
            days: newSourceDays,
          }

          // Add to target day
          const newTargetDays = [...newWeeks[targetWeekIndex].days]
          const newTargetExercises = [...targetDay.exercises]

          // Create a new exercise object with updated order (avoid mutation)
          const movedExercise = { ...exerciseToMove, order: newOrder }

          // Increment order of exercises at and after the insertion point - create new objects
          const reorderedTargetExercises = newTargetExercises.map((ex) => {
            if (ex.order >= newOrder) {
              return { ...ex, order: ex.order + 1 }
            }
            return ex
          })

          // Add the moved exercise to the target day exercises
          reorderedTargetExercises.push(movedExercise)

          // Sort target day exercises by order to ensure correct visual positioning
          const sortedTargetExercises = reorderedTargetExercises.sort(
            (a, b) => a.order - b.order,
          )

          newTargetDays[targetDayIndex] = {
            ...targetDay,
            exercises: sortedTargetExercises,
          }
          newWeeks[targetWeekIndex] = {
            ...newWeeks[targetWeekIndex],
            days: newTargetDays,
          }

          return newWeeks
        })

        setIsDirty(true)
        moveExerciseMutation(
          {
            input: {
              dayId: sourceDay.id,
              exerciseId: exerciseToMove.id,
              newOrder: newOrder,
              targetDayId: targetDay.id, // This enables cross-day moves
            },
          },
          {
            onSuccess: () => {
              setIsDirty(false)
              debouncedInvalidateQueries()
            },
            onError: (error) => {
              console.error(
                '[Move exercise]: Failed to move exercise between days',
                error,
              )
              setWeeks(beforeWeeks)
              setIsDirty(true)
            },
          },
        )
      }
    },
    [
      setWeeks,
      setIsDirty,
      moveExerciseMutation,
      weeks,
      debouncedInvalidateQueries,
    ],
  )

  return {
    updateExercise,
    addExercise,
    removeExercise,
    moveExercise,
  }
}
