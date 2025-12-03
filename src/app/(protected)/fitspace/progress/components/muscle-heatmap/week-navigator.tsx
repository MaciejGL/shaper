'use client'

import { format, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface WeekNavigatorProps {
  weekStartDate: string | null
  weekEndDate: string | null
  weekOffset: number
  onPrevious: () => void
  onNext: () => void
}

export function WeekNavigator({
  weekStartDate,
  weekEndDate,
  weekOffset,
  onPrevious,
  onNext,
}: WeekNavigatorProps) {
  const formatWeekRange = () => {
    if (!weekStartDate || !weekEndDate) return 'This Week'
    
    const start = parseISO(weekStartDate)
    const end = parseISO(weekEndDate)
    
    if (weekOffset === 0) {
      return 'This Week'
    }
    
    // Format as "Dec 1-7" or "Nov 25 - Dec 1" if spans months
    const startMonth = format(start, 'MMM')
    const endMonth = format(end, 'MMM')
    
    if (startMonth === endMonth) {
      return `${format(start, 'MMM d')}-${format(end, 'd')}`
    }
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d')}`
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon-sm"
        iconOnly={<ChevronLeft className="size-4" />}
        onClick={onPrevious}
        aria-label="Previous week"
      />
      <span className="min-w-[100px] text-center text-sm font-medium">
        {formatWeekRange()}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        iconOnly={<ChevronRight className="size-4" />}
        onClick={onNext}
        disabled={weekOffset === 0}
        aria-label="Next week"
      />
    </div>
  )
}

