'use client'

import { format } from 'date-fns'
import { ChevronDownIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useUserPreferences } from '@/context/user-preferences-context'
import { cn } from '@/lib/utils'

type DatePickerProps = {
  label?: string
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  className?: string
  dateFormat?: string
  buttonProps?: React.ComponentProps<typeof Button>
}

export function DatePicker({
  label,
  date,
  setDate,
  className,
  dateFormat = 'd. MMM yyyy',
  buttonProps,
}: DatePickerProps) {
  const { preferences } = useUserPreferences()
  const [open, setOpen] = React.useState(false)
  const { className: buttonClassName, ...rest } = buttonProps || {}

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {label && (
        <Label htmlFor="date" className="px-1">
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen} modal>
        <PopoverTrigger asChild>
          <Button
            variant="tertiary"
            id="date"
            className={cn(
              'w-full justify-between font-normal',
              buttonClassName,
            )}
            {...rest}
          >
            {date ? format(date, dateFormat) : 'Select date'}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverPortal>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              weekStartsOn={preferences.weekStartsOn}
              onSelect={(date) => {
                setDate(date)
                setOpen(false)
              }}
            />
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    </div>
  )
}
