import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { toast } from 'sonner'

import {
  GQLAddExerciseToDayInput,
  GQLAddSetToExerciseInput,
  GQLAddTrainingWeekInput,
  GQLGetTemplateTrainingPlanByIdQuery,
  GQLMoveExerciseInput,
  GQLUpdateExerciseSetInput,
  GQLUpdateTrainingDayDataInput,
  GQLUpdateTrainingExerciseInput,
  GQLUpdateTrainingPlanDetailsInput,
  GQLUpdateTrainingWeekDetailsInput,
  useAddExerciseToDayMutation,
  useAddSetToExerciseMutation,
  useAddTrainingWeekMutation,
  useDuplicateTrainingWeekMutation,
  useGetTemplateTrainingPlanByIdQuery,
  useMoveExerciseMutation,
  useRemoveExerciseFromDayMutation,
  useRemoveSetFromExerciseMutation,
  useRemoveTrainingWeekMutation,
  useUpdateExerciseSetMutation,
  useUpdateTrainingDayDataMutation,
  useUpdateTrainingExerciseMutation,
  useUpdateTrainingPlanDetailsMutation,
  useUpdateTrainingWeekDetailsMutation,
} from '@/generated/graphql-client'
import { useDebouncedInvalidation } from '@/hooks/use-debounced-invalidation'
import {
  generateTempId,
  useOptimisticMutation,
} from '@/lib/optimistic-mutations'

/**
 * Unified training plan mutations using optimistic updates with React Query cache
 * Eliminates manual state management in training plan context
 */
export function useTrainingPlanMutations(trainingId?: string) {
  const queryClient = useQueryClient()
  const trainingPlanQueryKey = useGetTemplateTrainingPlanByIdQuery.getKey({
    id: trainingId!,
  })

  const debouncedInvalidateQueries = useDebouncedInvalidation({
    queryKeys: ['GetTemplateTrainingPlanById'],
    delay: 1000,
  })

  // Create optimistic updaters for training plan operations
  const optimisticUpdaters = {
    updateDetails: (
      oldData: GQLGetTemplateTrainingPlanByIdQuery,
      variables: { input: GQLUpdateTrainingPlanDetailsInput },
    ) => {
      if (!oldData?.getTrainingPlanById) return oldData

      return {
        ...oldData,
        getTrainingPlanById: {
          ...oldData.getTrainingPlanById,
          title: variables.input.title ?? oldData.getTrainingPlanById.title,
          description:
            variables.input.description ??
            oldData.getTrainingPlanById.description,
          isPublic:
            variables.input.isPublic ?? oldData.getTrainingPlanById.isPublic,
          isDraft:
            variables.input.isDraft ?? oldData.getTrainingPlanById.isDraft,
          difficulty:
            variables.input.difficulty ??
            oldData.getTrainingPlanById.difficulty,
        },
      }
    },

    updateDay: (
      oldData: GQLGetTemplateTrainingPlanByIdQuery,
      variables: { input: GQLUpdateTrainingDayDataInput },
    ) => {
      if (!oldData?.getTrainingPlanById?.weeks) return oldData

      const dayId = variables.input.dayId
      const newWeeks = [...oldData.getTrainingPlanById.weeks]

      // Find and update the day
      for (const week of newWeeks) {
        for (const day of week.days) {
          if (day.id === dayId) {
            // Use spread operator instead of Object.assign for better type safety
            const updatedDay = {
              ...day,
              isRestDay: variables.input.isRestDay ?? day.isRestDay,
              workoutType: variables.input.workoutType ?? day.workoutType,
            }
            // Replace the day in the array
            const dayIndex = week.days.findIndex((d) => d.id === dayId)
            if (dayIndex !== -1) {
              week.days[dayIndex] = updatedDay
            }
            break
          }
        }
      }

      return {
        ...oldData,
        getTrainingPlanById: {
          ...oldData.getTrainingPlanById,
          weeks: newWeeks,
        },
      }
    },

    updateExercise: (
      oldData: GQLGetTemplateTrainingPlanByIdQuery,
      variables: { input: GQLUpdateTrainingExerciseInput },
    ) => {
      if (!oldData?.getTrainingPlanById?.weeks) return oldData

      // Find exercise by ID from variables.input
      const exerciseId = variables.input.id
      const newWeeks = [...oldData.getTrainingPlanById.weeks]

      // Find and update the exercise
      for (let weekIndex = 0; weekIndex < newWeeks.length; weekIndex++) {
        for (
          let dayIndex = 0;
          dayIndex < newWeeks[weekIndex].days.length;
          dayIndex++
        ) {
          const exerciseIndex = newWeeks[weekIndex].days[
            dayIndex
          ].exercises.findIndex((ex) => ex.id === exerciseId)
          if (exerciseIndex !== -1) {
            const currentExercise =
              newWeeks[weekIndex].days[dayIndex].exercises[exerciseIndex]
            newWeeks[weekIndex].days[dayIndex].exercises[exerciseIndex] = {
              ...currentExercise,
              ...variables.input,
              // Exclude sets property to avoid type conflicts
              sets: currentExercise.sets,
              // Ensure required fields are not null
              name: variables.input.name ?? '',
              order: variables.input.order ?? currentExercise.order,
            }
            break
          }
        }
      }

      return {
        ...oldData,
        getTrainingPlanById: {
          ...oldData.getTrainingPlanById,
          weeks: newWeeks,
        },
      }
    },

    addExercise: (
      oldData: GQLGetTemplateTrainingPlanByIdQuery,
      variables: { input: GQLAddExerciseToDayInput },
      tempId?: string,
    ) => {
      if (!oldData?.getTrainingPlanById?.weeks) return oldData

      // Find the day by dayId from variables.input
      const dayId = variables.input.dayId
      const newWeeks = [...oldData.getTrainingPlanById.weeks]

      // Find week and day by dayId
      let targetDay:
        | null
        | GQLGetTemplateTrainingPlanByIdQuery['getTrainingPlanById']['weeks'][number]['days'][number] =
        null

      for (const week of newWeeks) {
        for (const day of week.days) {
          if (day.id === dayId) {
            targetDay = day
            break
          }
        }
        if (targetDay) break
      }

      if (!targetDay) return oldData

      const currentExercises = [...targetDay.exercises]
      const order = variables.input.order || currentExercises.length + 1

      const newExercise = {
        id: tempId || generateTempId('exercise'),
        name: variables.input.name || '',
        instructions: variables.input.instructions || '',
        baseId: variables.input.baseId,
        additionalInstructions: variables.input.additionalInstructions || '',
        restSeconds: variables.input.restSeconds,
        tempo: variables.input.tempo || '',
        type: variables.input.type,
        warmupSets: variables.input.warmupSets,
        sets: [],
        order,
      }
      // Insert at the correct position based on order
      const insertIndex = Math.min(order - 1, currentExercises.length) // order is 1-based, array is 0-based

      // Update order of exercises that come after the insertion point
      const updatedExercises = currentExercises.map((ex) => ({
        ...ex,
        order: ex.order >= order ? ex.order + 1 : ex.order,
      }))

      // Insert the new exercise at the correct position
      updatedExercises.splice(insertIndex, 0, newExercise)

      targetDay.exercises = updatedExercises
      return {
        ...oldData,
        getTrainingPlanById: {
          ...oldData.getTrainingPlanById,
          weeks: newWeeks,
        },
      }
    },

    removeExercise: (
      oldData: GQLGetTemplateTrainingPlanByIdQuery,
      variables: { exerciseId: string },
    ) => {
      if (!oldData?.getTrainingPlanById?.weeks) return oldData

      // Find exercise by exerciseId from variables
      const exerciseId = variables.exerciseId
      const newWeeks = [...oldData.getTrainingPlanById.weeks]

      // Find and remove the exercise
      for (const week of newWeeks) {
        for (const day of week.days) {
          const exerciseIndex = day.exercises.findIndex(
            (ex) => ex.id === exerciseId,
          )
          if (exerciseIndex !== -1) {
            const deletedOrder = day.exercises[exerciseIndex].order
            day.exercises.splice(exerciseIndex, 1)

            // Adjust order of remaining exercises
            day.exercises = day.exercises.map((ex) => ({
              ...ex,
              order: ex.order > deletedOrder ? ex.order - 1 : ex.order,
            }))
            break
          }
        }
      }

      return {
        ...oldData,
        getTrainingPlanById: {
          ...oldData.getTrainingPlanById,
          weeks: newWeeks,
        },
      }
    },

    addSet: (
      oldData: GQLGetTemplateTrainingPlanByIdQuery,
      variables: { input: GQLAddSetToExerciseInput },
      tempId?: string,
    ) => {
      if (!oldData?.getTrainingPlanById?.weeks) return oldData

      // Find exercise by exerciseId from variables.input
      const exerciseId = variables.input.exerciseId
      const newWeeks = [...oldData.getTrainingPlanById.weeks]

      // Find and update the exercise
      for (const week of newWeeks) {
        for (const day of week.days) {
          const exercise = day.exercises.find((ex) => ex.id === exerciseId)
          if (exercise) {
            const currentSets = [...(exercise.sets || [])]
            const previousSet = currentSets.at(-1)
            const newOrder = currentSets.length + 1

            const newSet = {
              id: tempId || generateTempId('set'),
              order: newOrder,
              reps: previousSet?.reps ?? undefined,
              weight: previousSet?.weight ?? undefined,
              rpe: previousSet?.rpe ?? undefined,
              minReps:
                variables.input.minReps ?? previousSet?.minReps ?? undefined,
              maxReps:
                variables.input.maxReps ?? previousSet?.maxReps ?? undefined,
            }

            currentSets.push(newSet)
            exercise.sets = currentSets
            break
          }
        }
      }

      return {
        ...oldData,
        getTrainingPlanById: {
          ...oldData.getTrainingPlanById,
          weeks: newWeeks,
        },
      }
    },

    updateSet: (
      oldData: GQLGetTemplateTrainingPlanByIdQuery,
      variables: { input: GQLUpdateExerciseSetInput },
    ) => {
      if (!oldData?.getTrainingPlanById?.weeks) return oldData

      // Find set by setId from variables.input
      const setId = variables.input.id
      const newWeeks = [...oldData.getTrainingPlanById.weeks]

      // Find and update the set
      for (const week of newWeeks) {
        for (const day of week.days) {
          for (const exercise of day.exercises) {
            const setIndex = exercise.sets?.findIndex((set) => set.id === setId)
            if (setIndex !== undefined && setIndex !== -1) {
              exercise.sets[setIndex] = {
                ...exercise.sets[setIndex],
                ...variables.input,
              }
              return {
                ...oldData,
                getTrainingPlanById: {
                  ...oldData.getTrainingPlanById,
                  weeks: newWeeks,
                },
              }
            }
          }
        }
      }

      return oldData
    },

    removeSet: (
      oldData: GQLGetTemplateTrainingPlanByIdQuery,
      variables: { setId: string },
    ) => {
      if (!oldData?.getTrainingPlanById?.weeks) return oldData

      // Find set by setId from variables
      const setId = variables.setId
      const newWeeks = [...oldData.getTrainingPlanById.weeks]

      // Find and remove the set
      for (const week of newWeeks) {
        for (const day of week.days) {
          for (const exercise of day.exercises) {
            const setIndex = exercise.sets?.findIndex((set) => set.id === setId)
            if (setIndex !== undefined && setIndex !== -1) {
              exercise.sets.splice(setIndex, 1)

              // Re-order remaining sets
              exercise.sets = exercise.sets.map((set, idx) => ({
                ...set,
                order: idx + 1,
              }))

              return {
                ...oldData,
                getTrainingPlanById: {
                  ...oldData.getTrainingPlanById,
                  weeks: newWeeks,
                },
              }
            }
          }
        }
      }

      return oldData
    },

    moveExercise: (
      oldData: GQLGetTemplateTrainingPlanByIdQuery,
      variables: { input: GQLMoveExerciseInput },
    ) => {
      if (!oldData?.getTrainingPlanById?.weeks) return oldData

      const { exerciseId, dayId, newOrder, targetDayId } = variables.input
      const newWeeks = oldData.getTrainingPlanById.weeks.map((week) => ({
        ...week,
        days: week.days.map((day) => ({
          ...day,
          exercises: [...day.exercises],
        })),
      }))

      // Find source exercise and day
      let sourceExercise:
        | null
        | GQLGetTemplateTrainingPlanByIdQuery['getTrainingPlanById']['weeks'][number]['days'][number]['exercises'][number] =
        null
      let sourceDayIndex = -1
      let sourceWeekIndex = -1
      let sourceExerciseIndex = -1

      for (let weekIdx = 0; weekIdx < newWeeks.length; weekIdx++) {
        for (let dayIdx = 0; dayIdx < newWeeks[weekIdx].days.length; dayIdx++) {
          const day = newWeeks[weekIdx].days[dayIdx]
          if (day.id === dayId) {
            const exerciseIdx = day.exercises.findIndex(
              (ex) => ex.id === exerciseId,
            )
            if (exerciseIdx !== -1) {
              sourceExercise = { ...day.exercises[exerciseIdx] }
              sourceDayIndex = dayIdx
              sourceWeekIndex = weekIdx
              sourceExerciseIndex = exerciseIdx
              break
            }
          }
        }
        if (sourceExercise) break
      }

      if (!sourceExercise) return oldData

      // Remove from source day
      newWeeks[sourceWeekIndex].days[sourceDayIndex].exercises.splice(
        sourceExerciseIndex,
        1,
      )

      // Find target day
      let targetDay:
        | null
        | GQLGetTemplateTrainingPlanByIdQuery['getTrainingPlanById']['weeks'][number]['days'][number] =
        null

      for (const week of newWeeks) {
        for (const day of week.days) {
          if (day.id === (targetDayId || dayId)) {
            targetDay = day
            break
          }
        }
        if (targetDay) break
      }

      if (!targetDay) return oldData

      // Add to target day at specified order
      const insertIndex = Math.min(newOrder - 1, targetDay.exercises.length)
      targetDay.exercises.splice(insertIndex, 0, {
        ...sourceExercise,
        order: newOrder,
      })

      // Reorder ALL exercises in target day to ensure correct order
      targetDay.exercises = targetDay.exercises.map((exercise, index) => ({
        ...exercise,
        order: index + 1,
      }))

      // Reorder exercises in source day (if different from target)
      if (sourceWeekIndex !== -1 && sourceDayIndex !== -1) {
        const sourceDay = newWeeks[sourceWeekIndex].days[sourceDayIndex]
        if (sourceDay.id !== targetDay.id) {
          sourceDay.exercises = sourceDay.exercises.map((exercise, index) => ({
            ...exercise,
            order: index + 1,
          }))
        }
      }

      return {
        ...oldData,
        getTrainingPlanById: {
          ...oldData.getTrainingPlanById,
          weeks: newWeeks,
        },
      }
    },
  }

  // Mutation wrappers with optimistic updates
  const updateDetailsMutation = useUpdateTrainingPlanDetailsMutation()
  const addExerciseMutation = useAddExerciseToDayMutation()
  const updateExerciseMutation = useUpdateTrainingExerciseMutation()
  const removeExerciseMutation = useRemoveExerciseFromDayMutation()
  const addSetMutation = useAddSetToExerciseMutation()
  const updateSetMutation = useUpdateExerciseSetMutation()
  const removeSetMutation = useRemoveSetFromExerciseMutation()
  const updateDayMutation = useUpdateTrainingDayDataMutation()
  const moveExerciseMutation = useMoveExerciseMutation()

  const updateDetailsOptimistic = useOptimisticMutation({
    queryKey: trainingPlanQueryKey,
    mutationFn: updateDetailsMutation.mutateAsync,
    updateFn: optimisticUpdaters.updateDetails,
  })

  const updateExerciseOptimistic = useOptimisticMutation({
    queryKey: trainingPlanQueryKey,
    mutationFn: updateExerciseMutation.mutateAsync,
    updateFn: optimisticUpdaters.updateExercise,
  })

  const addExerciseOptimistic = useOptimisticMutation({
    queryKey: trainingPlanQueryKey,
    mutationFn: addExerciseMutation.mutateAsync,
    updateFn: optimisticUpdaters.addExercise,
  })

  const removeExerciseOptimistic = useOptimisticMutation({
    queryKey: trainingPlanQueryKey,
    mutationFn: removeExerciseMutation.mutateAsync,
    updateFn: optimisticUpdaters.removeExercise,
  })

  const addSetOptimistic = useOptimisticMutation({
    queryKey: trainingPlanQueryKey,
    mutationFn: addSetMutation.mutateAsync,
    updateFn: optimisticUpdaters.addSet,
  })

  const updateSetOptimistic = useOptimisticMutation({
    queryKey: trainingPlanQueryKey,
    mutationFn: updateSetMutation.mutateAsync,
    updateFn: optimisticUpdaters.updateSet,
  })

  const removeSetOptimistic = useOptimisticMutation({
    queryKey: trainingPlanQueryKey,
    mutationFn: removeSetMutation.mutateAsync,
    updateFn: optimisticUpdaters.removeSet,
  })

  const updateDayOptimistic = useOptimisticMutation({
    queryKey: trainingPlanQueryKey,
    mutationFn: updateDayMutation.mutateAsync,
    updateFn: optimisticUpdaters.updateDay,
  })

  const moveExerciseOptimistic = useOptimisticMutation({
    queryKey: trainingPlanQueryKey,
    mutationFn: moveExerciseMutation.mutateAsync,
    updateFn: optimisticUpdaters.moveExercise,
  })

  // Simple wrapper functions that match the old context-based API
  const updateDetails = (
    detailsData: Partial<Omit<GQLUpdateTrainingPlanDetailsInput, 'id'>>,
  ) => {
    if (!trainingId) return Promise.reject('No training ID')

    debouncedInvalidateQueries()

    return updateDetailsOptimistic.optimisticMutate({
      input: {
        id: trainingId,
        ...detailsData,
      },
    })
  }

  const updateExercise = (
    weekIndex: number,
    dayIndex: number,
    exerciseIndex: number,
    exerciseData: Partial<Omit<GQLUpdateTrainingExerciseInput, 'id'>>,
  ) => {
    const data =
      queryClient.getQueryData<GQLGetTemplateTrainingPlanByIdQuery>(
        trainingPlanQueryKey,
      )
    const exercise =
      data?.getTrainingPlanById?.weeks?.[weekIndex]?.days?.[dayIndex]
        ?.exercises?.[exerciseIndex]

    if (!exercise) return Promise.reject('Exercise not found')

    debouncedInvalidateQueries()

    return updateExerciseOptimistic.optimisticMutate({
      input: {
        id: exercise.id,
        order: exercise.order, // Ensure order is always provided
        ...exerciseData,
      },
    })
  }

  const addExercise = (
    weekIndex: number,
    dayIndex: number,
    exercise: Omit<GQLAddExerciseToDayInput, 'dayId' | 'order'>,
    atIndex?: number,
  ) => {
    const data =
      queryClient.getQueryData<GQLGetTemplateTrainingPlanByIdQuery>(
        trainingPlanQueryKey,
      )
    const day = data?.getTrainingPlanById?.weeks?.[weekIndex]?.days?.[dayIndex]

    if (!day) return Promise.reject('Day not found')

    debouncedInvalidateQueries()

    const currentExercises = day.exercises || []
    const order =
      atIndex !== undefined ? atIndex + 1 : currentExercises.length + 1

    return addExerciseOptimistic.optimisticMutate({
      input: {
        dayId: day.id,
        order,
        ...exercise,
      },
    })
  }

  const removeExercise = (
    weekIndex: number,
    dayIndex: number,
    exerciseIndex: number,
  ) => {
    const data =
      queryClient.getQueryData<GQLGetTemplateTrainingPlanByIdQuery>(
        trainingPlanQueryKey,
      )
    const exercise =
      data?.getTrainingPlanById?.weeks?.[weekIndex]?.days?.[dayIndex]
        ?.exercises?.[exerciseIndex]

    if (!exercise) return Promise.reject('Exercise not found')

    debouncedInvalidateQueries()

    return removeExerciseOptimistic.optimisticMutate({
      exerciseId: exercise.id,
    })
  }

  const addSet = (
    weekIndex: number,
    dayIndex: number,
    exerciseIndex: number,
    setData: Omit<GQLAddSetToExerciseInput, 'exerciseId' | 'order'>,
  ) => {
    const data =
      queryClient.getQueryData<GQLGetTemplateTrainingPlanByIdQuery>(
        trainingPlanQueryKey,
      )
    const exercise =
      data?.getTrainingPlanById?.weeks?.[weekIndex]?.days?.[dayIndex]
        ?.exercises?.[exerciseIndex]

    if (!exercise) return Promise.reject('Exercise not found')

    debouncedInvalidateQueries()

    const currentSets = exercise.sets || []
    const order = currentSets.length + 1

    return addSetOptimistic.optimisticMutate({
      input: {
        exerciseId: exercise.id,
        order,
        ...setData,
      },
    })
  }

  const updateSet = (
    weekIndex: number,
    dayIndex: number,
    exerciseIndex: number,
    setIndex: number,
    setData: Partial<Omit<GQLUpdateExerciseSetInput, 'id'>>,
  ) => {
    const data =
      queryClient.getQueryData<GQLGetTemplateTrainingPlanByIdQuery>(
        trainingPlanQueryKey,
      )
    const set =
      data?.getTrainingPlanById?.weeks?.[weekIndex]?.days?.[dayIndex]
        ?.exercises?.[exerciseIndex]?.sets?.[setIndex]

    if (!set) return Promise.reject('Set not found')

    debouncedInvalidateQueries()

    return updateSetOptimistic.optimisticMutate({
      input: {
        id: set.id,
        order: set.order, // Ensure order is always provided
        ...setData,
      },
    })
  }

  const removeSet = (
    weekIndex: number,
    dayIndex: number,
    exerciseIndex: number,
    setIndex: number,
  ) => {
    const data =
      queryClient.getQueryData<GQLGetTemplateTrainingPlanByIdQuery>(
        trainingPlanQueryKey,
      )
    const set =
      data?.getTrainingPlanById?.weeks?.[weekIndex]?.days?.[dayIndex]
        ?.exercises?.[exerciseIndex]?.sets?.[setIndex]

    if (!set) return Promise.reject('Set not found')

    debouncedInvalidateQueries()

    return removeSetOptimistic.optimisticMutate({
      setId: set.id,
    })
  }

  const updateDay = (
    weekIndex: number,
    dayIndex: number,
    dayData: Partial<Omit<GQLUpdateTrainingDayDataInput, 'dayId'>>,
  ) => {
    const data =
      queryClient.getQueryData<GQLGetTemplateTrainingPlanByIdQuery>(
        trainingPlanQueryKey,
      )
    const day = data?.getTrainingPlanById?.weeks?.[weekIndex]?.days?.[dayIndex]

    if (!day) return Promise.reject('Day not found')

    debouncedInvalidateQueries()

    return updateDayOptimistic.optimisticMutate({
      input: {
        dayId: day.id,
        ...dayData,
      },
    })
  }

  const moveExercise = (
    weekIndex: number,
    dayIndex: number,
    exerciseIndex: number,
    newOrder: number,
    targetDayId?: string,
  ) => {
    const data =
      queryClient.getQueryData<GQLGetTemplateTrainingPlanByIdQuery>(
        trainingPlanQueryKey,
      )
    const day = data?.getTrainingPlanById?.weeks?.[weekIndex]?.days?.[dayIndex]
    const exercise = day?.exercises?.[exerciseIndex]

    if (!exercise || !day) return Promise.reject('Exercise or day not found')

    debouncedInvalidateQueries()

    return moveExerciseOptimistic.optimisticMutate({
      input: {
        exerciseId: exercise.id,
        dayId: day.id,
        newOrder,
        targetDayId,
      },
    })
  }

  // Week mutations
  const addWeekMutation = useAddTrainingWeekMutation()
  const removeWeekMutation = useRemoveTrainingWeekMutation()
  const cloneWeekMutation = useDuplicateTrainingWeekMutation()
  const updateWeekMutation = useUpdateTrainingWeekDetailsMutation()

  // Week operation optimistic mutation hooks
  const optimisticAddWeek = useOptimisticMutation({
    queryKey: ['GetTemplateTrainingPlanById', { id: trainingId }],
    mutationFn: addWeekMutation.mutateAsync,
    updateFn: (
      oldData: GQLGetTemplateTrainingPlanByIdQuery,
      variables: { input: GQLAddTrainingWeekInput },
    ) => {
      if (!oldData.getTrainingPlanById) return oldData

      const newWeek = {
        id: generateTempId(),
        weekNumber: variables.input.weekNumber,
        name: `Week ${variables.input.weekNumber}`,
        description: '',
        days: Array.from({ length: 7 }, (_, i) => ({
          id: generateTempId(),
          dayOfWeek: i,
          isRestDay: false,
          workoutType: null,
          exercises: [],
        })),
      }

      return {
        ...oldData,
        getTrainingPlanById: {
          ...oldData.getTrainingPlanById,
          weeks: [...oldData.getTrainingPlanById.weeks, newWeek],
        },
      }
    },
  })

  const optimisticRemoveWeek = useOptimisticMutation({
    queryKey: ['GetTemplateTrainingPlanById', { id: trainingId }],
    mutationFn: removeWeekMutation.mutateAsync,
    updateFn: (
      oldData: GQLGetTemplateTrainingPlanByIdQuery,
      variables: { weekId: string },
    ) => {
      if (!oldData.getTrainingPlanById) return oldData

      const weekToRemove = oldData.getTrainingPlanById.weeks.find(
        (w) => w.id === variables.weekId,
      )
      if (!weekToRemove) return oldData

      // Remove the week and renumber remaining weeks
      const filteredWeeks = oldData.getTrainingPlanById.weeks.filter(
        (w) => w.id !== variables.weekId,
      )
      const renumberedWeeks = filteredWeeks.map((week, index) => ({
        ...week,
        weekNumber: index + 1,
        name:
          !week.name || week.name === `Week ${week.weekNumber}`
            ? `Week ${index + 1}`
            : week.name,
      }))

      return {
        ...oldData,
        getTrainingPlanById: {
          ...oldData.getTrainingPlanById,
          weeks: renumberedWeeks,
        },
      }
    },
  })

  const optimisticUpdateWeek = useOptimisticMutation({
    queryKey: ['GetTemplateTrainingPlanById', { id: trainingId }],
    mutationFn: updateWeekMutation.mutateAsync,
    updateFn: (
      oldData: GQLGetTemplateTrainingPlanByIdQuery,
      variables: { input: GQLUpdateTrainingWeekDetailsInput },
    ) => {
      if (!oldData.getTrainingPlanById) return oldData

      const weekToUpdate = oldData.getTrainingPlanById.weeks.find(
        (w) => w.id === variables.input.id,
      )
      if (!weekToUpdate) return oldData

      const updatedWeeks = oldData.getTrainingPlanById.weeks.map((week) =>
        week.id === variables.input.id
          ? {
              ...week,
              weekNumber: variables.input.weekNumber ?? week.weekNumber,
              name: variables.input.name ?? week.name,
              description: variables.input.description ?? week.description,
            }
          : week,
      )

      return {
        ...oldData,
        getTrainingPlanById: {
          ...oldData.getTrainingPlanById,
          weeks: updatedWeeks,
        },
      }
    },
  })

  // Week operations
  const addWeek = useCallback(() => {
    if (!trainingId) {
      console.error('[Add week]: Training ID is required')
      return
    }

    const currentData =
      queryClient.getQueryData<GQLGetTemplateTrainingPlanByIdQuery>([
        'GetTemplateTrainingPlanById',
        { id: trainingId },
      ])
    if (!currentData?.getTrainingPlanById) {
      console.error('[Add week]: No training plan data available')
      return
    }

    const weekNumber = currentData.getTrainingPlanById.weeks.length + 1

    // Call debounce BEFORE mutation like other operations
    debouncedInvalidateQueries()

    optimisticAddWeek
      .optimisticMutate({ input: { trainingPlanId: trainingId, weekNumber } })
      .catch(() => {
        toast.error('Failed to add week')
      })
  }, [trainingId, optimisticAddWeek, debouncedInvalidateQueries, queryClient])

  const removeWeek = useCallback(
    (weekIndex: number) => {
      if (!trainingId) {
        console.error('[Remove week]: Training ID is required')
        return
      }

      const currentData =
        queryClient.getQueryData<GQLGetTemplateTrainingPlanByIdQuery>([
          'GetTemplateTrainingPlanById',
          { id: trainingId },
        ])
      if (!currentData?.getTrainingPlanById) {
        console.error('[Remove week]: No training plan data available')
        return
      }

      const weekToRemove = currentData.getTrainingPlanById.weeks[weekIndex]
      if (!weekToRemove) {
        console.error('[Remove week]: Week not found', { weekIndex })
        return
      }

      // Call debounce BEFORE mutation like other operations
      debouncedInvalidateQueries()

      optimisticRemoveWeek.optimisticMutate({ weekId: weekToRemove.id })
    },
    [trainingId, optimisticRemoveWeek, debouncedInvalidateQueries, queryClient],
  )

  const cloneWeek = useCallback(
    (weekIndex: number) => {
      if (!trainingId) {
        console.error('[Clone week]: Training ID is required')
        return
      }

      const currentData =
        queryClient.getQueryData<GQLGetTemplateTrainingPlanByIdQuery>([
          'GetTemplateTrainingPlanById',
          { id: trainingId },
        ])
      if (!currentData?.getTrainingPlanById) {
        console.error('[Clone week]: No training plan data available')
        return
      }

      const weekToClone = currentData.getTrainingPlanById.weeks[weekIndex]
      if (!weekToClone) {
        console.error('[Clone week]: Week not found', { weekIndex })
        return
      }

      // For clone operations, use regular mutation + refetch instead of optimistic updates
      // This is because cloning creates many nested entities with new IDs which is complex to handle optimistically
      cloneWeekMutation
        .mutateAsync({
          input: { weekId: weekToClone.id, trainingPlanId: trainingId },
        })
        .then(() => {
          // Immediately refetch to get the real cloned data with proper IDs
          queryClient.invalidateQueries({
            queryKey: ['GetTemplateTrainingPlanById', { id: trainingId }],
          })
        })
        .catch(() => {
          toast.error('Failed to duplicate week')
        })
    },
    [trainingId, cloneWeekMutation, queryClient],
  )

  const updateWeek = useCallback(
    (
      weekIndex: number,
      weekData: Partial<{
        weekNumber: number
        name: string
        description: string
      }>,
    ) => {
      if (!trainingId) {
        console.error('[Update week]: Training ID is required')
        return
      }

      const currentData =
        queryClient.getQueryData<GQLGetTemplateTrainingPlanByIdQuery>([
          'GetTemplateTrainingPlanById',
          { id: trainingId },
        ])
      if (!currentData?.getTrainingPlanById) {
        console.error('[Update week]: No training plan data available')
        return
      }

      const weekToUpdate = currentData.getTrainingPlanById.weeks[weekIndex]
      if (!weekToUpdate) {
        console.error('[Update week]: Week not found', { weekIndex })
        return
      }

      // Call debounce BEFORE mutation like other operations
      debouncedInvalidateQueries()

      optimisticUpdateWeek
        .optimisticMutate({
          input: {
            id: weekToUpdate.id,
            weekNumber: weekData.weekNumber ?? weekToUpdate.weekNumber,
            name: weekData.name ?? weekToUpdate.name,
            description: weekData.description ?? weekToUpdate.description,
          },
        })
        .catch(() => {
          toast.error('Failed to update week details')
        })
    },
    [trainingId, optimisticUpdateWeek, debouncedInvalidateQueries, queryClient],
  )

  return {
    updateDetails,
    updateExercise,
    addExercise,
    removeExercise,
    addSet,
    updateSet,
    removeSet,
    updateDay,
    moveExercise,
    addWeek,
    removeWeek,
    cloneWeek,
    updateWeek,
  }
}
