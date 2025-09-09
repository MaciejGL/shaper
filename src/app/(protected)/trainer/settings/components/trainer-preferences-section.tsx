'use client'

import {
  CalendarIcon,
  ClockIcon,
  RulerIcon,
  SunIcon,
  WeightIcon,
} from 'lucide-react'

import { RadioButtons } from '@/components/radio-buttons'
import { Label } from '@/components/ui/label'
import { useUserPreferences } from '@/context/user-preferences-context'
import {
  GQLHeightUnit,
  GQLTheme,
  GQLTimeFormat,
  GQLWeightUnit,
} from '@/generated/graphql-server'
import type { WeekStartDay } from '@/lib/date-utils'

/**
 * Trainer-specific preferences section
 * Similar to fitspace preferences but focused on trainer needs
 */
export function TrainerPreferencesSection() {
  const {
    preferences,
    setWeekStartsOn,
    setWeightUnit,
    setHeightUnit,
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

        <RadioButtons
          value={preferences.weightUnit}
          onValueChange={setWeightUnit}
          options={[
            { value: GQLWeightUnit.Kg, label: 'Kilograms' },
            { value: GQLWeightUnit.Lbs, label: 'Pounds' },
          ]}
          description="Choose your preferred unit for displaying weights in training plans"
        />
      </div>

      {/* Height Unit */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <RulerIcon className="size-4 text-green-500" />
          <Label htmlFor="height-unit" className="text-sm font-medium">
            Height Unit
          </Label>
        </div>
        <RadioButtons
          value={preferences.heightUnit}
          onValueChange={setHeightUnit}
          options={[
            { value: GQLHeightUnit.Cm, label: 'Centimeters' },
            { value: GQLHeightUnit.Ft, label: 'Feet & Inches' },
          ]}
          description="Choose your preferred unit for displaying heights"
        />
      </div>

      {/* Week Start Day */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="size-4 text-purple-500" />
          <Label htmlFor="week-start" className="text-sm font-medium">
            Week Start Day
          </Label>
        </div>
        <RadioButtons
          value={preferences.weekStartsOn.toString()}
          onValueChange={(value) =>
            setWeekStartsOn(parseInt(value) as WeekStartDay)
          }
          options={[
            { value: '1', label: 'Monday' },
            { value: '0', label: 'Sunday' },
          ]}
          description="Choose which day your calendar week starts on"
        />
      </div>

      {/* Time Format */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <ClockIcon className="size-4 text-orange-500" />
          <Label htmlFor="time-format" className="text-sm font-medium">
            Time Format
          </Label>
        </div>
        <RadioButtons
          value={preferences.timeFormat}
          onValueChange={setTimeFormat}
          options={[
            { value: GQLTimeFormat.H12, label: '12 Hour (AM/PM)' },
            { value: GQLTimeFormat.H24, label: '24 Hour' },
          ]}
          description="Choose how times are displayed throughout the app"
        />
      </div>

      {/* Theme - spans both columns */}
      <div className="space-y-3 md:col-span-2">
        <div className="flex items-center space-x-2">
          <SunIcon className="size-4 text-purple-500" />
          <Label htmlFor="theme" className="text-sm font-medium">
            Theme
          </Label>
        </div>
        <RadioButtons
          value={preferences.theme}
          onValueChange={setTheme}
          options={[
            { value: GQLTheme.Light, label: 'Light' },
            { value: GQLTheme.Dark, label: 'Dark' },
            { value: GQLTheme.System, label: 'System' },
          ]}
          columns={3}
          description="Choose your preferred color theme for the application"
        />
      </div>
    </div>
  )
}
