'use client'

import { CalendarIcon, ClockIcon, SunIcon, WeightIcon } from 'lucide-react'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUserPreferences } from '@/context/user-preferences-context'

export function PreferencesSection() {
  const {
    preferences,
    setWeekStartsOn,
    setWeightUnit,
    setTheme,
    setTimeFormat,
  } = useUserPreferences()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Weight Unit */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <WeightIcon className="size-4 text-blue-500" />
          <Label htmlFor="weight-unit" className="text-sm font-medium">
            Weight Unit
          </Label>
        </div>
        <Select value={preferences.weightUnit} onValueChange={setWeightUnit}>
          <SelectTrigger variant="ghost">
            <SelectValue placeholder="Select weight unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="kg">Kilograms (kg)</SelectItem>
            <SelectItem value="lbs">Pounds (lbs)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Choose your preferred unit for displaying weights
        </p>
      </div>

      {/* Week Start Day */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="size-4 text-green-500" />
          <Label htmlFor="week-start" className="text-sm font-medium">
            Week Starts On
          </Label>
        </div>
        <Select
          value={preferences.weekStartsOn.toString()}
          onValueChange={(value) => setWeekStartsOn(parseInt(value) as 0 | 1)}
        >
          <SelectTrigger variant="ghost">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Monday</SelectItem>
            <SelectItem value="0">Sunday</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Choose which day starts your week in calendars and planning
        </p>
      </div>

      {/* Time Format */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <ClockIcon className="size-4 text-purple-500" />
          <Label htmlFor="time-format" className="text-sm font-medium">
            Time Format
          </Label>
        </div>
        <Select value={preferences.timeFormat} onValueChange={setTimeFormat}>
          <SelectTrigger variant="ghost">
            <SelectValue placeholder="Select time format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">24 Hour (14:30)</SelectItem>
            <SelectItem value="12h">12 Hour (2:30 PM)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Choose your preferred time display format
        </p>
      </div>

      {/* Theme */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <SunIcon className="size-4 text-amber-500" />
          <Label htmlFor="theme" className="text-sm font-medium">
            Theme
          </Label>
        </div>
        <Select value={preferences.theme} onValueChange={setTheme}>
          <SelectTrigger variant="ghost">
            <SelectValue placeholder="Select theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Choose your preferred app theme
        </p>
      </div>
    </div>
  )
}
