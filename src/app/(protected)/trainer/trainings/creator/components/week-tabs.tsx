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
    canEdit,
  } = useTrainingPlan()
  const weeks = formData?.weeks || []
  const handleWeekChange = (value: string) => {
    setActiveWeek(Number.parseInt(value))
  }

  const weekItems = weeks.map((week, index) => ({
    id: `week-${index}`,
    value: index.toString(),
    label: `Week ${week.weekNumber}`,
    onRemove: canEdit
      ? () => {
          setActiveWeek(activeWeek > 0 ? activeWeek - 1 : 0)
          removeWeek(index)
        }
      : undefined,
    onCopy: canEdit ? () => cloneWeek(index) : undefined,
  }))

  return (
    <div
      className={cn(
        'mb-6 bg-card dark:bg-card-on-card shadow-xs p-2 rounded-lg w-max min-w-full flex items-center gap-2 justify-start',
        isLoadingInitialData && 'masked-placeholder-text',
      )}
    >
      <RadioGroupTabs
        title="Select Week"
        hideTitle
        items={weekItems}
        onValueChange={handleWeekChange}
        value={activeWeek.toString()}
      />
      <Button
        variant="outline"
        onClick={() => {
          addWeek()
          setActiveWeek(weeks.length)
        }}
        iconOnly={<Plus />}
        disabled={Boolean(formData?.details.completedAt) || !canEdit}
      >
        Add week
      </Button>
    </div>
  )
}
