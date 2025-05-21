'use client'

import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'
import { RadioGroupTabs } from '@/components/radio-group'
import type { GQLWorkoutType } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { TrainingPlanFormData } from '../types'

import { DayCard } from './day-card'

type DaysSetupProps = {
  weeks: TrainingPlanFormData['weeks']
  activeWeek: number
  setActiveWeek: (week: number) => void
  updateWeeks: (weeks: TrainingPlanFormData['weeks']) => void
}

export function DaysSetup({
  weeks,
  activeWeek,
  setActiveWeek,
  updateWeeks,
}: DaysSetupProps) {
  const handleWeekChange = (value: string) => {
    setActiveWeek(Number.parseInt(value))
  }

  const toggleRestDay = (dayIndex: number) => {
    const newWeeks = [...weeks]
    const day = newWeeks[activeWeek].days[dayIndex]
    day.isRestDay = !day.isRestDay

    if (day.isRestDay) {
      day.workoutType = undefined
    }

    updateWeeks(newWeeks)
  }

  const updateWorkoutType = (dayIndex: number, type: GQLWorkoutType) => {
    const newWeeks = [...weeks]
    newWeeks[activeWeek].days[dayIndex].workoutType = type
    updateWeeks(newWeeks)
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
          <DayCard
            key={day.dayOfWeek}
            day={day}
            dayIndex={dayIndex}
            toggleRestDay={toggleRestDay}
            updateWorkoutType={updateWorkoutType}
          />
        ))}
      </AnimatedPageTransition>
    </div>
  )
}
