'use client'

import { Plus } from 'lucide-react'

import { RadioGroupTabs } from '@/components/radio-group'
import { Button } from '@/components/ui/button'
import { useTrainingPlan } from '@/context/training-plan-context/training-plan-context'
import { cn } from '@/lib/utils'

export function WeekTabs() {
  const {
    formData,
    activeWeek,
    setActiveWeek,
    addWeek,
    removeWeek,
    cloneWeek,
    isLoadingInitialData,
  } = useTrainingPlan()
  const weeks = formData?.weeks || []
  const handleWeekChange = (value: string) => {
    setActiveWeek(Number.parseInt(value))
  }

  const weekItems = weeks.map((week, index) => ({
    id: `week-${index}`,
    value: index.toString(),
    label: `Week ${week.weekNumber}`,
    onRemove: () => {
      setActiveWeek(activeWeek > 0 ? activeWeek - 1 : 0)
      removeWeek(index)
    },
    onCopy: () => cloneWeek(index),
  }))

  return (
    <div
      className={cn(
        'mb-4 bg-card dark:bg-card-on-card shadow-xs p-1 rounded-lg w-max min-w-full flex items-center gap-2 justify-start',
        isLoadingInitialData && 'masked-placeholder-text',
      )}
    >
      <RadioGroupTabs
        title="Select Week"
        hideTitle
        items={weekItems}
        onValueChange={handleWeekChange}
        value={activeWeek.toString()}
        classNameItem="px-2 py-0.5"
      />
      <Button
        variant="outline"
        onClick={() => {
          addWeek()
          setActiveWeek(weeks.length)
        }}
        iconOnly={<Plus />}
        disabled={Boolean(formData?.details.completedAt)}
      >
        Add week
      </Button>
    </div>
  )
}
