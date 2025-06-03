import { isNil } from 'lodash'
import { useCallback } from 'react'

import {
  TrainingPlanFormData,
  TrainingWeek,
} from '@/app/(protected)/trainer/trainings/creator/components/types'
import { createId } from '@/lib/create-id'

export const useWeekHandlers = (
  setWeeks: React.Dispatch<React.SetStateAction<TrainingPlanFormData['weeks']>>,
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  const updateWeek = useCallback(
    (weekIndex: number, newWeek: Partial<TrainingPlanFormData['weeks'][0]>) => {
      setWeeks((prev) => {
        const newWeeks = [...prev]
        newWeeks[weekIndex] = { ...newWeeks[weekIndex], ...newWeek }
        return newWeeks
      })
      setIsDirty(true)
    },
    [setWeeks, setIsDirty],
  )

  const removeWeek = useCallback(
    (weekIndex: number) => {
      if (isNil(weekIndex)) {
        console.error('[Remove week]: Invalid weekIndex', {
          weekIndex,
        })
        return
      }
      setWeeks((prev) => {
        const newWeeks = renumberWeeks(
          prev.filter((_, index) => index !== weekIndex),
        )
        return newWeeks
      })
      setIsDirty(true)
    },
    [setWeeks, setIsDirty],
  )

  const addWeek = useCallback(() => {
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
          isRestDay: [0, 6].includes(i),
          exercises: [],
        })),
      })
      return newWeeks
    })
    setIsDirty(true)
  }, [setWeeks, setIsDirty])

  const cloneWeek = useCallback(
    (weekIndex: number) => {
      setWeeks((prev) => {
        const newWeeks = [...prev]
        newWeeks.push({
          ...newWeeks[weekIndex],
          id: createId(),
          weekNumber: prev.length + 1,
          name: `Week ${prev.length + 1} (Copy of ${newWeeks[weekIndex].name})`,
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
      setIsDirty(true)
    },
    [setWeeks, setIsDirty],
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
