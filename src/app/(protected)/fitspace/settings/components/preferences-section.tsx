'use client'

import {
  CalendarIcon,
  ClockIcon,
  DumbbellIcon,
  RulerIcon,
  SunIcon,
  WeightIcon,
} from 'lucide-react'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUserPreferences } from '@/context/user-preferences-context'
import { GQLTrainingView } from '@/generated/graphql-client'
import { WeekStartDay } from '@/lib/date-utils'

export function PreferencesSection() {
  const {
    preferences,
    setWeekStartsOn,
    setWeightUnit,
    setHeightUnit,
    setTheme,
    setTimeFormat,
    setTrainingView,
  } = useUserPreferences()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Weight Unit */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          <WeightIcon className="size-4 text-blue-500" />
          <Label htmlFor="weight-unit" className="text-sm font-medium">
            Weight Unit
          </Label>
        </div>
        <Select value={preferences.weightUnit} onValueChange={setWeightUnit}>
          <SelectTrigger className="rounded-lg border-muted-foreground/20">
            <SelectValue placeholder="Select weight unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="kg">Kilograms (kg)</SelectItem>
            <SelectItem value="lbs">Pounds (lbs)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Choose your preferred unit for displaying weights throughout the
          entire app
        </p>
      </div>

      {/* Height Unit */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full" />
          <RulerIcon className="size-4 text-orange-500" />
          <Label htmlFor="height-unit" className="text-sm font-medium">
            Height Unit
          </Label>
        </div>
        <Select value={preferences.heightUnit} onValueChange={setHeightUnit}>
          <SelectTrigger className="rounded-lg border-muted-foreground/20">
            <SelectValue placeholder="Select height unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cm">Centimeters (cm)</SelectItem>
            <SelectItem value="ft">Feet & Inches (ft/in)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Choose your preferred unit for displaying heights throughout the
          entire app
        </p>
      </div>

      {/* Week Start Day */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <CalendarIcon className="size-4 text-green-500" />
          <Label htmlFor="week-start" className="text-sm font-medium">
            Week Starts On
          </Label>
        </div>
        <Select
          value={preferences.weekStartsOn.toString()}
          onValueChange={(value) =>
            setWeekStartsOn(parseInt(value) as WeekStartDay)
          }
        >
          <SelectTrigger className="rounded-lg border-muted-foreground/20">
            <SelectValue placeholder="Select start day" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Monday</SelectItem>
            <SelectItem value="0">Sunday</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Choose which day of the week to start your calendar view
        </p>
      </div>

      {/* Theme */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full" />
          <SunIcon className="size-4 text-purple-500" />
          <Label htmlFor="theme" className="text-sm font-medium">
            Theme
          </Label>
        </div>
        <Select value={preferences.theme} onValueChange={setTheme}>
          <SelectTrigger className="rounded-lg border-muted-foreground/20">
            <SelectValue placeholder="Select theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Choose your preferred color theme for the application
        </p>
      </div>

      {/* Time Format */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-amber-500 rounded-full" />
          <ClockIcon className="size-4 text-amber-500" />
          <Label htmlFor="time-format" className="text-sm font-medium">
            Time Format
          </Label>
        </div>
        <Select value={preferences.timeFormat} onValueChange={setTimeFormat}>
          <SelectTrigger className="rounded-lg border-muted-foreground/20">
            <SelectValue placeholder="Select time format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12h">12 Hour (AM/PM)</SelectItem>
            <SelectItem value="24h">24 Hour</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Choose your preferred time format for displaying times
        </p>
      </div>

      {/* Training View */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full" />
          <DumbbellIcon className="size-4 text-purple-500" />
          <Label htmlFor="training-view" className="text-sm font-medium">
            Training View
          </Label>
        </div>
        <Select
          value={preferences.trainingView}
          onValueChange={setTrainingView}
        >
          <SelectTrigger className="rounded-lg border-muted-foreground/20">
            <SelectValue placeholder="Select training view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={GQLTrainingView.Simple}>
              Simple (Quick Completion)
            </SelectItem>
            <SelectItem value={GQLTrainingView.Advanced}>
              Advanced (Detailed Logging)
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Simple: Mark exercises as complete without detailed logging.
          <br />
          Advanced: Full workout tracking with sets, reps, and weights.
        </p>
      </div>
    </div>
  )
}
