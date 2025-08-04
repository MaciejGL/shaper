'use client'

import { addWeeks, format, startOfWeek } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { useUserPreferences } from '@/context/user-preferences-context'
import { cn } from '@/lib/utils'

import { Drawer, DrawerContent, DrawerTrigger } from './ui/drawer'

interface WeekPickerProps {
  value?: Date
  onChange: (date: Date) => void
  className?: string
  placeholder?: string
}

export function MealDayPickerDrawer({
  value,
  onChange,
  className,
  placeholder = 'Select week',
}: WeekPickerProps) {
  const { preferences } = useUserPreferences()
  const [isOpen, setIsOpen] = useState(false)

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onChange(date)
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

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} modal>
      <DrawerTrigger asChild>
        <Button
          variant="secondary"
          className={cn(
            'justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className,
          )}
          iconStart={<CalendarIcon />}
        >
          {value ? (
            <div className="flex items-center gap-2">
              <span>{formatWeekRange(value)}</span>
            </div>
          ) : (
            placeholder
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent dialogTitle="Select week">
        <div className="mx-auto">
          <Calendar
            mode="single"
            showWeekNumber
            weekStartsOn={preferences.weekStartsOn}
            selected={value}
            onSelect={handleDateSelect}
            initialFocus
            className="bg-transparent"
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
