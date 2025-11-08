'use client'

import { Calendar } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  GQLCheckinFrequency,
  GQLCheckinSchedule,
} from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import {
  CheckinScheduleFormData,
  DAY_OF_WEEK_LABELS,
  FREQUENCY_LABELS,
} from './types'
import { useCheckinScheduleOperations } from './use-checkin-schedule'

interface CheckinScheduleFormProps {
  formData: CheckinScheduleFormData
  onFormDataChange: (data: CheckinScheduleFormData) => void
  showPreview?: boolean
  className?: string
}

export function CheckinScheduleForm({
  formData,
  onFormDataChange,
  showPreview = true,
  className = '',
}: CheckinScheduleFormProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Frequency Selection */}
      <div className="space-y-2">
        <Label htmlFor="frequency">How often?</Label>
        <Select
          value={formData.frequency}
          onValueChange={(value) =>
            onFormDataChange({
              ...formData,
              frequency: value as GQLCheckinFrequency,
            })
          }
        >
          <SelectTrigger variant="default" className="w-full">
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Day Selection */}
      {formData.frequency !== GQLCheckinFrequency.Monthly ? (
        <div className="space-y-2">
          <Label htmlFor="dayOfWeek">Which day?</Label>
          <Select
            value={formData.dayOfWeek?.toString()}
            onValueChange={(value) =>
              onFormDataChange({
                ...formData,
                dayOfWeek: parseInt(value),
              })
            }
          >
            <SelectTrigger variant="default" className="w-full">
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              {DAY_OF_WEEK_LABELS.map((day, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="dayOfMonth">Which day of the month?</Label>
          <Select
            value={formData.dayOfMonth?.toString()}
            onValueChange={(value) =>
              onFormDataChange({
                ...formData,
                dayOfMonth: parseInt(value),
              })
            }
          >
            <SelectTrigger variant="tertiary" className="w-full">
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                <SelectItem key={day} value={day.toString()}>
                  {day}
                  {day === 1
                    ? 'st'
                    : day === 2
                      ? 'nd'
                      : day === 3
                        ? 'rd'
                        : 'th'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Preview */}
      {showPreview && (
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-sm font-medium">Schedule Preview:</p>
          <p className="text-sm text-muted-foreground">
            {FREQUENCY_LABELS[formData.frequency]}
            {formData.frequency !== GQLCheckinFrequency.Monthly &&
              formData.dayOfWeek !== undefined && (
                <> on {DAY_OF_WEEK_LABELS[formData.dayOfWeek]}</>
              )}
            {formData.frequency === GQLCheckinFrequency.Monthly &&
              formData.dayOfMonth && (
                <>
                  {' '}
                  on the {formData.dayOfMonth}
                  {formData.dayOfMonth === 1
                    ? 'st'
                    : formData.dayOfMonth === 2
                      ? 'nd'
                      : formData.dayOfMonth === 3
                        ? 'rd'
                        : 'th'}
                </>
              )}
          </p>
        </div>
      )}
    </div>
  )
}

interface ScheduleSetupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingSchedule?: GQLCheckinSchedule | null
}

export function ScheduleSetupModal({
  open,
  onOpenChange,
  existingSchedule,
}: ScheduleSetupModalProps) {
  const { createSchedule, updateSchedule, isCreating, isUpdating } =
    useCheckinScheduleOperations()

  const [formData, setFormData] = useState<CheckinScheduleFormData>(() => ({
    frequency: existingSchedule?.frequency || GQLCheckinFrequency.Weekly,
    dayOfWeek: existingSchedule?.dayOfWeek || 0, // Sunday
    dayOfMonth: existingSchedule?.dayOfMonth || 1,
  }))

  const isEditing = !!existingSchedule
  const isLoading = isCreating || isUpdating

  const handleSubmit = () => {
    if (isEditing) {
      updateSchedule({
        input: {
          frequency: formData.frequency,
          dayOfWeek:
            formData.frequency !== GQLCheckinFrequency.Monthly
              ? formData.dayOfWeek
              : undefined,
          dayOfMonth:
            formData.frequency === GQLCheckinFrequency.Monthly
              ? formData.dayOfMonth
              : undefined,
          isActive: true,
        },
      })
    } else {
      createSchedule({
        input: {
          frequency: formData.frequency,
          dayOfWeek:
            formData.frequency !== GQLCheckinFrequency.Monthly
              ? formData.dayOfWeek
              : undefined,
          dayOfMonth:
            formData.frequency === GQLCheckinFrequency.Monthly
              ? formData.dayOfMonth
              : undefined,
        },
      })
    }
    onOpenChange(false)
  }

  const isFormValid = () => {
    if (formData.frequency === GQLCheckinFrequency.Monthly) {
      return (
        formData.dayOfMonth !== undefined &&
        formData.dayOfMonth >= 1 &&
        formData.dayOfMonth <= 31
      )
    }
    return (
      formData.dayOfWeek !== undefined &&
      formData.dayOfWeek >= 0 &&
      formData.dayOfWeek <= 6
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent dialogTitle="Schedule Check-ins">
        <div className="overflow-y-auto compact-scrollbar min-h-full flex flex-col">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Calendar className="size-5" />
              {isEditing ? 'Update Check-in Schedule' : 'Schedule Check-ins'}
            </DrawerTitle>
            <DrawerDescription>
              Set up regular reminders to track your progress with measurements
              and photos.
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4">
            <CheckinScheduleForm
              formData={formData}
              onFormDataChange={setFormData}
              showPreview={true}
            />
          </div>

          <DrawerFooter className="py-4 mb-4">
            <Button variant="tertiary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid() || isLoading}
              loading={isLoading}
              iconStart={<Calendar />}
            >
              {isEditing ? 'Update Schedule' : 'Create Schedule'}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
