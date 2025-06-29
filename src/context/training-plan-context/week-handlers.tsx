import { isNil } from 'lodash'
import { useCallback } from 'react'
import { toast } from 'sonner'

import {
  TrainingPlanFormData,
  TrainingWeek,
} from '@/app/(protected)/trainer/types'
import {
  useAddTrainingWeekMutation,
  useDuplicateTrainingWeekMutation,
  useRemoveTrainingWeekMutation,
  useUpdateTrainingWeekDetailsMutation,
} from '@/generated/graphql-client'
import { useDebouncedInvalidation } from '@/hooks/use-debounced-invalidation'
import { createId } from '@/lib/create-id'

export const useWeekHandlers = ({
  trainingId,
  weeks,
  setWeeks,
  setIsDirty,
  setActiveWeek,
}: {
  trainingId?: string
  weeks?: TrainingPlanFormData['weeks']
  setWeeks: React.Dispatch<React.SetStateAction<TrainingPlanFormData['weeks']>>
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>
  setActiveWeek: React.Dispatch<React.SetStateAction<number>>
}) => {
  const debouncedInvalidateQueries = useDebouncedInvalidation({
    queryKey: ['GetTemplateTrainingPlanById'],
    delay: 1000,
  })

  const { mutateAsync: updateTrainingWeek } =
    useUpdateTrainingWeekDetailsMutation()

  const updateWeek = useCallback(
    (weekIndex: number, newWeek: Partial<TrainingPlanFormData['weeks'][0]>) => {
      if (!weeks) {
        console.error('[Update week]: Weeks are not loaded')
        return
      }

      const currentWeek = weeks[weekIndex]

      if (!currentWeek?.id) {
        console.error('[Update week]: Invalid week', {
          weekIndex,
        })
        return
      }

      const updatedWeek = {
        ...currentWeek,
        ...newWeek,
      }

      updateTrainingWeek(
        {
          input: {
            id: updatedWeek.id,
            weekNumber: updatedWeek.weekNumber,
            name: updatedWeek.name,
            description: updatedWeek.description,
          },
        },
        {
          onSuccess: () => {
            setIsDirty(true)
            debouncedInvalidateQueries()
          },
          onError: () => {
            toast.error('Failed to update week details')
            setWeeks((prev) => {
              const newWeeks = [...prev]
              newWeeks[weekIndex] = currentWeek
              return newWeeks
            })
            setIsDirty(true)
          },
        },
      )
      setWeeks((prev) => {
        const newWeeks = [...prev]
        newWeeks[weekIndex] = updatedWeek
        return newWeeks
      })
      setIsDirty(true)
    },
    [
      setWeeks,
      setIsDirty,
      updateTrainingWeek,
      weeks,
      debouncedInvalidateQueries,
    ],
  )
  const { mutateAsync: removeWeekMutation } = useRemoveTrainingWeekMutation()
  const removeWeek = useCallback(
    (weekIndex: number) => {
      if (isNil(weekIndex)) {
        console.error('[Remove week]: Invalid weekIndex', {
          weekIndex,
        })
        return
      }
      if (!weeks) {
        console.error('[Remove week]: Weeks are not loaded')
        return
      }

      const before = weeks[weekIndex]

      setWeeks((prev) => {
        const newWeeks = renumberWeeks(
          prev.filter((_, index) => index !== weekIndex),
        )

        setActiveWeek((currentActiveWeek) => {
          if (currentActiveWeek === weekIndex) {
            return weekIndex > 0 ? weekIndex - 1 : 0
          } else if (weekIndex < currentActiveWeek) {
            return currentActiveWeek - 1
          } else {
            return currentActiveWeek
          }
        })

        return newWeeks
      })
      removeWeekMutation(
        { weekId: before.id },
        {
          onSuccess: () => {
            setIsDirty(true)
            debouncedInvalidateQueries()
          },
          onError: () => {
            toast.error('Failed to remove week')
            setWeeks((prev) => {
              const newWeeks = [...prev]
              newWeeks[weekIndex] = before
              return newWeeks
            })
            setIsDirty(true)
          },
        },
      )
      setIsDirty(true)
    },
    [
      setWeeks,
      setIsDirty,
      setActiveWeek,
      removeWeekMutation,
      weeks,
      debouncedInvalidateQueries,
    ],
  )

  const { mutateAsync: addWeekMutation } = useAddTrainingWeekMutation()
  const addWeek = useCallback(() => {
    if (!trainingId) {
      console.error('[Add week]: Training ID is required')
      return
    }
    if (!weeks) {
      console.error('[Add week]: Weeks are not loaded')
      return
    }

    const before = [...weeks]

    setWeeks((prev) => {
      const newWeeks = [...prev]
      newWeeks.push({
        id: '',
        weekNumber: prev.length + 1,
        name: `Week ${prev.length + 1}`,
        description: '',
        days: Array.from({ length: 7 }, (_, i) => ({
          id: createId(),
          dayOfWeek: i,
          isRestDay: false,
          exercises: [],
        })),
      })
      return newWeeks
    })
    addWeekMutation(
      {
        input: {
          trainingPlanId: trainingId,
          weekNumber: before.length + 1,
        },
      },
      {
        onSuccess: () => {
          setIsDirty(true)
          debouncedInvalidateQueries()
        },
        onError: () => {
          toast.error('Failed to add week')
          setWeeks(before)
          setIsDirty(true)
        },
      },
    )
    setIsDirty(true)
  }, [
    setWeeks,
    setIsDirty,
    trainingId,
    debouncedInvalidateQueries,
    addWeekMutation,
    weeks,
  ])

  const { mutateAsync: duplicateWeek } = useDuplicateTrainingWeekMutation()
  const cloneWeek = useCallback(
    (weekIndex: number) => {
      if (!trainingId) {
        console.error('[Clone week]: Training ID is required')
        return
      }

      if (!weeks) {
        console.error('[Clone week]: Weeks are not loaded')
        return
      }

      const before = [...weeks]

      setWeeks((prev) => {
        const newWeeks = [...prev]
        newWeeks.push({
          ...newWeeks[weekIndex],
          id: createId(),
          weekNumber: prev.length + 1,
          name: `Week ${prev.length + 1}`,
          days: newWeeks[weekIndex].days.map((day) => ({
            ...day,
            id: createId(),
            exercises: day.exercises.map((exercise) => ({
              ...exercise,
              id: createId(),
              sets: exercise.sets.map((set) => ({
                ...set,
                id: createId(),
              })),
            })),
          })),
        })
        return newWeeks
      })
      duplicateWeek(
        {
          input: {
            weekId: before[weekIndex].id,
            trainingPlanId: trainingId,
          },
        },
        {
          onSuccess: () => {
            setIsDirty(true)
            debouncedInvalidateQueries()
          },
          onError: () => {
            toast.error('Failed to duplicate week')
            setWeeks(before)
            setIsDirty(true)
          },
        },
      )
      setIsDirty(true)
    },
    [
      setWeeks,
      setIsDirty,
      duplicateWeek,
      debouncedInvalidateQueries,
      trainingId,
      weeks,
    ],
  )

  return {
    updateWeek,
    removeWeek,
    addWeek,
    cloneWeek,
  }
}

export const renumberWeeks = (weeks: TrainingWeek[]): TrainingWeek[] =>
  weeks.map((week, index) => ({
    ...week,
    weekNumber: index + 1,
    name:
      !week.name || week.name === `Week ${week.weekNumber}`
        ? `Week ${index + 1}`
        : week.name,
  }))
