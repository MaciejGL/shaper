'use client'

import { UnderlineTabList } from '@/components/ui/tabs'

interface DaySelectorProps {
  days: {
    id: string
    dayNumber: number
    name: string
  }[]
  activeDay: string
  onDayChange: (dayId: string) => void
}

export function DaySelector({
  days,
  activeDay,
  onDayChange,
}: DaySelectorProps) {
  if (days.length === 0) return null

  const options = days.map((day) => ({
    label: day.name,
    value: day.dayNumber.toString(),
  }))

  return (
    <div className="overflow-x-auto hide-scrollbar -mx-4 max-w-screen">
      <UnderlineTabList
        options={options}
        active={activeDay}
        onClick={onDayChange}
      />
    </div>
  )
}
