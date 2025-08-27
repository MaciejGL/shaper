'use client'

import { addWeeks, format, isSameWeek, startOfWeek } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useUserPreferences } from '@/context/user-preferences-context'
import { cn } from '@/lib/utils'

interface WeekPickerProps {
  value?: Date
  onChange: (date: Date) => void
  className?: string
  placeholder?: string
}

export function WeekPicker({
  value,
  onChange,
  className,
  placeholder = 'Select week',
}: WeekPickerProps) {
  const { preferences } = useUserPreferences()
  const [isOpen, setIsOpen] = useState(false)

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Get the start of the week based on user preference
      const weekStart = startOfWeek(date, {
        weekStartsOn: preferences.weekStartsOn,
      })
      onChange(weekStart)
      setIsOpen(false)
    }
  }

  const formatWeekRange = (date: Date) => {
    const weekStart = startOfWeek(date, {
      weekStartsOn: preferences.weekStartsOn,
    })
    const weekEnd = addWeeks(weekStart, 1)
    weekEnd.setDate(weekEnd.getDate() - 1) // Get last day of week

    return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
  }

  const isCurrentWeek =
    value &&
    isSameWeek(value, new Date(), { weekStartsOn: preferences.weekStartsOn })

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal>
      <PopoverTrigger asChild>
        <Button
          variant="tertiary"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className,
          )}
          iconStart={<CalendarIcon />}
        >
          {value ? (
            <div className="flex items-center gap-2">
              <span>{formatWeekRange(value)}</span>
              {isCurrentWeek && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                  Current Week
                </span>
              )}
            </div>
          ) : (
            placeholder
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          showWeekNumber
          weekStartsOn={preferences.weekStartsOn}
          selected={value}
          onSelect={handleDateSelect}
          initialFocus
          className="mx-auto"
        />
        <div className="p-3 border-t">
          <div className="text-xs text-muted-foreground">
            Select any date within the week you want to start training
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
