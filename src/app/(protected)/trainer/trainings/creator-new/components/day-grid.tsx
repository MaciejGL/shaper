import { useTrainingPlan } from '@/context/training-plan-context/training-plan-context'

import { DroppableDay } from './droppable-day'

export function DayGrid() {
  const { formData, activeWeek, trainingId } = useTrainingPlan()

  if (!trainingId || activeWeek == null || !formData?.weeks[activeWeek])
    return null

  return (
    <div className="flex gap-4 w-max grow">
      {formData.weeks[activeWeek].days
        .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
        .map((day) => (
          <DroppableDay key={day.id} day={day} trainingPlanId={trainingId} />
        ))}
    </div>
  )
}
