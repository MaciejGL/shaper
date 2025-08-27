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
import { WeekStartDay } from '@/lib/date-utils'

export function PreferencesSection() {
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
            { value: 'kg', label: 'Kilograms' },
            { value: 'lbs', label: 'Pounds' },
          ]}
          description="Choose your preferred unit for displaying weights throughout the entire app"
        />
      </div>

      {/* Height Unit */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <RulerIcon className="size-4 text-orange-500" />
          <Label htmlFor="height-unit" className="text-sm font-medium">
            Height Unit
          </Label>
        </div>
        <RadioButtons
          value={preferences.heightUnit}
          onValueChange={setHeightUnit}
          options={[
            { value: 'cm', label: 'Centimeters' },
            { value: 'ft', label: 'Feet & Inches' },
          ]}
          description="Choose your preferred unit for displaying heights throughout the entire app"
        />
      </div>

      {/* Week Start Day */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="size-4 text-green-500" />
          <Label htmlFor="week-start" className="text-sm font-medium">
            Week Starts On
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
          description="Choose which day of the week to start your calendar view"
        />
      </div>

      {/* Time Format */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <ClockIcon className="size-4 text-amber-500" />
          <Label htmlFor="time-format" className="text-sm font-medium">
            Time Format
          </Label>
        </div>
        <RadioButtons
          value={preferences.timeFormat}
          onValueChange={setTimeFormat}
          options={[
            { value: '24h', label: '24 Hour' },
            { value: '12h', label: '12 Hour' },
          ]}
          description="Choose your preferred time format for displaying times"
        />
      </div>

      {/* Training View */}
      {/* <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <DumbbellIcon className="size-4 text-purple-500" />
          <Label htmlFor="training-view" className="text-sm font-medium">
            Training View
          </Label>
        </div>
        <RadioButtons
          value={preferences.trainingView}
          onValueChange={setTrainingView}
          options={[
            {
              value: GQLTrainingView.Simple,
              label: 'Simple',
              description: 'Quick completion',
            },
            {
              value: GQLTrainingView.Advanced,
              label: 'Advanced',
              description: 'Detailed logging',
            },
          ]}
          description={`Simple: Mark exercises as complete without detailed logging.

          Advanced: Full workout tracking with sets, reps, and weights.`}
        />
      </div> */}

      {/* Theme */}
      <div className="space-y-3">
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
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'System' },
          ]}
          columns={3}
          description="Choose your preferred color theme for the application"
        />
      </div>
    </div>
  )
}
