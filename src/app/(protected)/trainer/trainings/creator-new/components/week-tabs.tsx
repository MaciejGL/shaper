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

  const weekItems = weeks.map((week, index) => ({
    id: `week-${index}`,
    value: index.toString(),
    label: `Week ${week.weekNumber}`,
    onRemove: () => removeWeek(index),
    onCopy: () => cloneWeek(index),
  }))

  return (
    <div className="mb-6 bg-card dark:bg-card-on-card shadow-xs p-2 rounded-lg w-max min-w-full flex items-center gap-2 justify-start">
      <RadioGroupTabs
        title="Select Week"
        hideTitle
        items={weekItems}
        onValueChange={handleWeekChange}
        value={activeWeek.toString()}
      />
      <Button variant="outline" onClick={addWeek} iconOnly={<Plus />}>
        Add week
      </Button>
    </div>
  )
}
