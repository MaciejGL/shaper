'use client'

import { CalendarClock, ChevronDownIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { useUserPreferences } from '@/context/user-preferences-context'
import { GQLTrainingView } from '@/generated/graphql-client'

import { ShiftScheduleDrawer } from './shift-schedule-drawer/shift-schedule-drawer'
import type { NavigationPlan } from './workout-day'

interface WorkoutOptionsDropdownProps {
  plan?: NavigationPlan | null
  trainingId?: string
  isQuickWorkout?: boolean
}

export function WorkoutOptionsDropdown({
  plan,
  trainingId,
  isQuickWorkout = false,
}: WorkoutOptionsDropdownProps) {
  const { preferences, setTrainingView, setShowImages } = useUserPreferences()
  const [shiftDrawerOpen, setShiftDrawerOpen] = useState(false)

  const isAdvanced = preferences.trainingView === GQLTrainingView.Advanced
  const showImages = preferences.showImages ?? true

  const toggleLoggingMode = () => {
    setTrainingView(
      isAdvanced ? GQLTrainingView.Simple : GQLTrainingView.Advanced,
    )
  }

  const toggleShowImages = () => {
    setShowImages(!showImages)
  }

  // Only show shift option for trainer-assigned plans (not quick workouts)
  const canShiftSchedule = plan && trainingId && !isQuickWorkout

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="tertiary"
            size="md"
            iconEnd={<ChevronDownIcon className="size-4" />}
          >
            Settings
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              toggleLoggingMode()
            }}
            className="flex cursor-pointer items-center justify-between"
          >
            <span className="w-full">Logging Mode</span>
            <Switch checked={isAdvanced} />
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              toggleShowImages()
            }}
            className="flex cursor-pointer items-center justify-between"
          >
            <span className="w-full">Show Images</span>
            <Switch checked={showImages} />
          </DropdownMenuItem>
          {canShiftSchedule && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setShiftDrawerOpen(true)}
                className="flex cursor-pointer items-center gap-2"
              >
                <CalendarClock className="size-4" />
                <span>Shift schedule</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {canShiftSchedule && shiftDrawerOpen && (
        <ShiftScheduleDrawer
          open={shiftDrawerOpen}
          onOpenChange={setShiftDrawerOpen}
          plan={plan}
        />
      )}
    </>
  )
}
