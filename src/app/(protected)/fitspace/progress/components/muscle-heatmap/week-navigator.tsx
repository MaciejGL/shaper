'use client'

import { format, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { PremiumButtonWrapper } from '@/components/premium-button-wrapper'
import { Button } from '@/components/ui/button'

interface WeekNavigatorProps {
  weekStartDate: string | null
  weekEndDate: string | null
  weekOffset: number
  onPrevious: () => void
  onNext: () => void
  hasPremium?: boolean
}

export function WeekNavigator({
  weekStartDate,
  weekEndDate,
  weekOffset,
  onPrevious,
  onNext,
  hasPremium = true,
}: WeekNavigatorProps) {
  const formatWeekRange = () => {
    if (!weekStartDate || !weekEndDate) return 'This Week'

    const start = parseISO(weekStartDate)
    const end = parseISO(weekEndDate)

    // if (weekOffset === 0) {
    //   return 'This Week'
    // }

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
      <PremiumButtonWrapper
        hasPremium={hasPremium}
        tooltipText="View past weeks with Premium"
      >
        <Button
          variant="outline"
          size="icon-md"
          iconOnly={<ChevronLeft className="!size-5" />}
          onClick={hasPremium ? onPrevious : undefined}
          disabled={!hasPremium}
          aria-label="Previous week"
        />
      </PremiumButtonWrapper>
      <span className="min-w-[80px] text-center text-sm font-medium flex flex-col items-center justify-center">
        {formatWeekRange()}
      </span>
      <Button
        variant="outline"
        size="icon-md"
        iconOnly={<ChevronRight className="!size-5" />}
        onClick={onNext}
        disabled={weekOffset === 0}
        aria-label="Next week"
      />
    </div>
  )
}
