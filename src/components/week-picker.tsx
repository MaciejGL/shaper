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
  const [isOpen, setIsOpen] = useState(false)

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Get the start of the week (Monday)
      const weekStart = startOfWeek(date, { weekStartsOn: 1 })
      onChange(weekStart)
      setIsOpen(false)
    }
  }

  const formatWeekRange = (date: Date) => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 })
    const weekEnd = addWeeks(weekStart, 1)
    weekEnd.setDate(weekEnd.getDate() - 1) // Get Sunday

    return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
  }

  const isCurrentWeek =
    value && isSameWeek(value, new Date(), { weekStartsOn: 1 })

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
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
          ISOWeek
          weekStartsOn={1}
          selected={value}
          onSelect={handleDateSelect}
          initialFocus
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
