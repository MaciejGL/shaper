'use client'

import { Plus } from 'lucide-react'

import { RadioGroupTabs } from '@/components/radio-group'
import { Button } from '@/components/ui/button'
import { useTrainingPlan } from '@/context/training-plan-context/training-plan-context'

export function WeekTabs() {
  const {
    formData,
    activeWeek,
    setActiveWeek,
    addWeek,
    removeWeek,
    cloneWeek,
  } = useTrainingPlan()
  const weeks = formData.weeks
  const handleWeekChange = (value: string) => {
    setActiveWeek(Number.parseInt(value))
  }
  return (
    <div className="mb-6 bg-muted p-2 rounded-lg w-max min-w-full flex items-center gap-2 justify-start">
      <RadioGroupTabs
        title="Select Week"
        hideTitle
        items={weeks.map((week, index) => ({
          id: `week-${index}`,
          value: index.toString(),
          label: `Week ${week.weekNumber}`,
          onRemove: () => removeWeek(index),
          onCopy: () => cloneWeek(index),
        }))}
        onValueChange={handleWeekChange}
        value={activeWeek.toString()}
      />
      <Button variant="outline" onClick={addWeek} iconOnly={<Plus />}>
        Add week
      </Button>
    </div>
  )
}
