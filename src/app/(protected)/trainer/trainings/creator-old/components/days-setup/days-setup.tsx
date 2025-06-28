'use client'

import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'
import { RadioGroupTabs } from '@/components/radio-group'
import { useTrainingPlan } from '@/context/training-plan-context/training-plan-context'
import { cn } from '@/lib/utils'

import { DayCard } from './day-card'

export function DaysSetup() {
  const { formData, activeWeek, setActiveWeek } = useTrainingPlan()
  const weeks = formData.weeks
  const handleWeekChange = (value: string) => {
    setActiveWeek(Number.parseInt(value))
  }

  return (
    <div className="@container/section space-y-6">
      <RadioGroupTabs
        title="Select Week"
        items={weeks.map((week, index) => ({
          id: `week-${index}`,
          value: index.toString(),
          label: `Week ${week.weekNumber}`,
        }))}
        onValueChange={handleWeekChange}
        value={activeWeek.toString()}
      />
      <AnimatedPageTransition
        id={`days-${activeWeek}`}
        className={cn(
          'grid grid-cols-1 gap-4 auto-rows-fr',
          '@2xl/section:grid-cols-2 @2xl/section:gap-6 @5xl/section:grid-cols-3',
        )}
      >
        {weeks[activeWeek].days.map((day, dayIndex) => (
          <DayCard key={day.id} day={day} dayIndex={dayIndex} />
        ))}
      </AnimatedPageTransition>
    </div>
  )
}
