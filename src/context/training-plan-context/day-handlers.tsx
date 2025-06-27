import { isNil } from 'lodash'
import { useCallback } from 'react'

import { TrainingPlanFormData } from '@/app/(protected)/trainer/trainings/creator/components/types'

export const useDayHandlers = (
  setWeeks: React.Dispatch<React.SetStateAction<TrainingPlanFormData['weeks']>>,
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  const updateDay = useCallback(
    (
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
    },
    [setWeeks, setIsDirty],
  )

  return {
    updateDay,
  }
}
