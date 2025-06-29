import { isNil } from 'lodash'
import { useCallback } from 'react'

import { TrainingPlanFormData } from '@/app/(protected)/trainer/trainings/creator-old/components/types'
import { useUpdateTrainingDayDataMutation } from '@/generated/graphql-client'
import { useDebouncedInvalidation } from '@/hooks/use-debounced-invalidation'

export const useDayHandlers = (
  weeks: TrainingPlanFormData['weeks'],
  setWeeks: React.Dispatch<React.SetStateAction<TrainingPlanFormData['weeks']>>,
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  const debouncedInvalidateQueries = useDebouncedInvalidation({
    queryKey: ['GetTemplateTrainingPlanById'],
    delay: 1000,
  })
  const { mutateAsync: updateTrainingDay } = useUpdateTrainingDayDataMutation()
  const updateDay = useCallback(
    async (
      weekIndex: number,
      dayIndex: number,
      newDay: Partial<TrainingPlanFormData['weeks'][0]['days'][0]>,
    ) => {
      if (isNil(weekIndex) || isNil(dayIndex)) {
        console.error('[Update day]: Invalid fields', {
          weekIndex,
          dayIndex,
        })
        return
      }
      const beforeWeeks = [...weeks]
      const currentWeek = weeks[weekIndex]
      if (!currentWeek?.id) {
        console.error('[Update day]: Invalid week', {
          weekIndex,
        })
        return
      }

      const currentDay = currentWeek.days[dayIndex]
      if (!currentDay?.id) {
        console.error('[Update day]: Invalid day', {
          weekIndex,
          dayIndex,
        })
        return
      }
      const updatedDay = {
        ...currentDay,
        ...newDay,
      }
      try {
        setWeeks((prev) => {
          const newWeeks = [...prev]
          newWeeks[weekIndex] = {
            ...newWeeks[weekIndex],
            days: newWeeks[weekIndex].days.map((day, idx) =>
              idx === dayIndex ? { ...day, ...newDay } : day,
            ),
          }
          return newWeeks
        })
        setIsDirty(true)
        await updateTrainingDay(
          {
            input: {
              dayId: currentDay.id,
              workoutType: updatedDay.workoutType,
              isRestDay: updatedDay.isRestDay,
            },
          },
          {
            onSuccess: () => {
              debouncedInvalidateQueries()
            },
            onError: () => {
              console.error('[Update day]: Failed to update day', {
                weekIndex,
                dayIndex,
              })
              setWeeks(beforeWeeks)
              setIsDirty(true)
            },
          },
        )
      } catch (error) {
        console.error('Day update failed:', error)
        setWeeks(beforeWeeks)
        setIsDirty(true)
      }
    },
    [
      setWeeks,
      setIsDirty,
      updateTrainingDay,
      weeks,
      debouncedInvalidateQueries,
    ],
  )

  return {
    updateDay,
  }
}
