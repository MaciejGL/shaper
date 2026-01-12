'use client'

import { addDays, format, startOfWeek } from 'date-fns'
import { ArrowRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { WeekPicker } from '@/components/week-picker'
import { useUserPreferences } from '@/context/user-preferences-context'

import { ShiftWeekSelector } from './shift-week-selector'
import type { ShiftScheduleDrawerProps } from './types'
import { useShiftSchedule } from './use-shift-schedule'
import { formatDateKey, formatWeekRange } from './utils'

export function ShiftScheduleDrawer({
  open,
  onOpenChange,
  plan,
}: ShiftScheduleDrawerProps) {
  const { preferences } = useUserPreferences()
  const { shiftSchedule, isShifting } = useShiftSchedule(plan)

  const timezone = preferences.timezone ?? 'UTC'

  // State
  const [selectedWeekId, setSelectedWeekId] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)

  // Find the first incomplete week as default
  const firstIncompleteWeek = useMemo(() => {
    for (const week of plan.weeks) {
      const workoutDays = week.days.filter((d) => !d.isRestDay)
      const completedCount = workoutDays.filter((d) => d.completedAt).length
      if (completedCount < workoutDays.length) {
        return week
      }
    }
    return plan.weeks[0] || null
  }, [plan.weeks])

  // Selected week data
  const selectedWeek = selectedWeekId
    ? plan.weeks.find((w) => w.id === selectedWeekId)
    : null

  // Calculate weeks to shift count
  const weeksToShiftCount = selectedWeek
    ? plan.weeks.filter((w) => w.weekNumber >= selectedWeek.weekNumber).length
    : 0

  // Calculate minimum start date to prevent overlap with non-shifted weeks
  const minStartDate = useMemo(() => {
    const today = startOfWeek(new Date(), {
      weekStartsOn: preferences.weekStartsOn,
    })

    if (!selectedWeek) return today

    // Find weeks that won't be shifted (weekNumber < selected)
    const nonShiftedWeeks = plan.weeks.filter(
      (w) => w.weekNumber < selectedWeek.weekNumber,
    )

    if (nonShiftedWeeks.length === 0) return today

    // Get the end date of the last non-shifted week (start + 7 days)
    const lastNonShiftedWeek = nonShiftedWeeks[nonShiftedWeeks.length - 1]
    if (!lastNonShiftedWeek.scheduledAt) return today

    const lastWeekEnd = addDays(new Date(lastNonShiftedWeek.scheduledAt), 7)
    const minDate = startOfWeek(lastWeekEnd, {
      weekStartsOn: preferences.weekStartsOn,
    })

    // Return the later of today or minDate
    return minDate > today ? minDate : today
  }, [selectedWeek, plan.weeks, preferences.weekStartsOn])

  // Formatted strings
  const selectedWeekLabel = selectedWeek
    ? `Week ${selectedWeek.weekNumber}`
    : 'Select week'

  const startDateString = startDate
    ? formatWeekRange(startDate, preferences.weekStartsOn)
    : 'Select start week'

  // Initialize on open
  useEffect(() => {
    if (open) {
      if (firstIncompleteWeek) {
        setSelectedWeekId(firstIncompleteWeek.id)
      }
    }
  }, [open, firstIncompleteWeek])

  // Set initial start date and auto-reset when minStartDate changes
  useEffect(() => {
    if (!startDate || startDate < minStartDate) {
      setStartDate(minStartDate)
    }
  }, [minStartDate, startDate])

  const handleShift = async () => {
    if (!selectedWeekId || !startDate) return

    try {
      await shiftSchedule({
        fromWeekId: selectedWeekId,
        startDateKey: formatDateKey(startDate, timezone),
        timezone,
      })
      onOpenChange(false)
    } catch {
      // Error handled in hook
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent dialogTitle="Catch up on training" className="h-auto">
        <DrawerHeader className="border-b pb-3">
          <DrawerTitle className="text-lg">Catch up on training</DrawerTitle>
          {/* Summary */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                From
              </p>
              <p className="text-sm font-semibold">{selectedWeekLabel}</p>
            </div>
            <ArrowRight className="size-4 text-muted-foreground mx-2" />
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Start on
              </p>
              <p className="text-sm font-semibold text-primary">
                {startDate ? format(startDate, 'MMM d') : 'Select'}
              </p>
            </div>
          </div>
        </DrawerHeader>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* Section 1: Week Selector - Compact */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider px-1">
              1. Resume from which week?
            </p>
            <ShiftWeekSelector
              plan={plan}
              selectedWeekId={selectedWeekId}
              onSelectWeek={setSelectedWeekId}
            />
          </div>

          {/* Section 2: Date Picker using WeekPicker */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider px-1">
              2. When to start?
            </p>
            <WeekPicker
              value={startDate}
              onChange={setStartDate}
              placeholder="Select start week"
              minDate={minStartDate}
            />
          </div>
        </div>

        <DrawerFooter className="border-t pt-3">
          {selectedWeek && weeksToShiftCount > 0 ? (
            <p className="text-sm text-center text-muted-foreground mb-2">
              Moving{' '}
              <span className="font-medium text-foreground">
                {weeksToShiftCount} week{weeksToShiftCount !== 1 ? 's' : ''}
              </span>{' '}
              to start {startDateString}
            </p>
          ) : (
            <p className="text-sm text-center text-muted-foreground mb-2">
              Select a week to shift
            </p>
          )}

          <Button
            onClick={handleShift}
            disabled={
              !selectedWeekId ||
              !startDate ||
              weeksToShiftCount === 0 ||
              isShifting
            }
            loading={isShifting}
            size="lg"
            className="w-full"
          >
            Shift Schedule
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
