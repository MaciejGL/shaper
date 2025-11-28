'use client'

import { useEffect, useState } from 'react'

import { DatePicker } from '@/components/date-picker'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type LogType =
  | 'WORKOUT_LOGS'
  | 'BODY_MEASUREMENTS'
  | 'PROGRESS_PHOTOS'
  | 'PERSONAL_RECORDS'
type TimeframeType = 'RELATIVE' | 'DATE_RANGE'
type RelativePeriod = '7d' | '1m' | '3m' | '1y' | 'all'

interface ResetLogsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (params: {
    logTypes: LogType[]
    timeframeType: TimeframeType
    relativePeriod?: string
    fromDate?: string
    toDate?: string
  }) => Promise<void>
  isLoading?: boolean
}

const LOG_TYPE_OPTIONS: {
  value: LogType
  label: string
  description: string
}[] = [
  {
    value: 'WORKOUT_LOGS',
    label: 'Workout Logs',
    description: 'Exercise logs, set completion data, and session events',
  },
  {
    value: 'BODY_MEASUREMENTS',
    label: 'Body Measurements',
    description: 'Weight, height, and body measurements',
  },
  {
    value: 'PROGRESS_PHOTOS',
    label: 'Progress Photos',
    description: 'All progress photos will be permanently deleted',
  },
  {
    value: 'PERSONAL_RECORDS',
    label: 'Personal Records',
    description: 'Your exercise PRs and achievements',
  },
]

const RELATIVE_PERIOD_OPTIONS: { value: RelativePeriod; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '1m', label: 'Last month' },
  { value: '3m', label: 'Last 3 months' },
  { value: '1y', label: 'Last year' },
  { value: 'all', label: 'All time' },
]

export function ResetLogsModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: ResetLogsModalProps) {
  const [selectedLogTypes, setSelectedLogTypes] = useState<LogType[]>([])
  const [timeframeType, setTimeframeType] = useState<TimeframeType>('RELATIVE')
  const [relativePeriod, setRelativePeriod] = useState<RelativePeriod>('all')
  const [fromDate, setFromDate] = useState<Date | undefined>()
  const [toDate, setToDate] = useState<Date | undefined>()
  const [confirmationText, setConfirmationText] = useState('')

  const isValid =
    selectedLogTypes.length > 0 && confirmationText.toLowerCase() === 'reset'

  useEffect(() => {
    if (!open) {
      setSelectedLogTypes([])
      setTimeframeType('RELATIVE')
      setRelativePeriod('all')
      setFromDate(undefined)
      setToDate(undefined)
      setConfirmationText('')
    }
  }, [open])

  const handleLogTypeToggle = (logType: LogType) => {
    setSelectedLogTypes((prev) =>
      prev.includes(logType)
        ? prev.filter((t) => t !== logType)
        : [...prev, logType],
    )
  }

  const handleConfirm = async () => {
    if (!isValid) return

    await onConfirm({
      logTypes: selectedLogTypes,
      timeframeType,
      relativePeriod: timeframeType === 'RELATIVE' ? relativePeriod : undefined,
      fromDate:
        timeframeType === 'DATE_RANGE' && fromDate
          ? fromDate.toISOString()
          : undefined,
      toDate:
        timeframeType === 'DATE_RANGE' && toDate
          ? toDate.toISOString()
          : undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dialogTitle="Reset Account Logs"
        fullScreen
        className="sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle>Reset Account Logs</DialogTitle>
          <DialogDescription>
            Select which data to delete and the timeframe. This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <Label className="text-base font-medium">
              Select data to reset
            </Label>
            <div className="space-y-3">
              {LOG_TYPE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <Checkbox
                    checked={selectedLogTypes.includes(option.value)}
                    onCheckedChange={() => handleLogTypeToggle(option.value)}
                    className="mt-0.5"
                  />
                  <div className="space-y-1">
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {option.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-medium">Timeframe</Label>
            <RadioGroup
              value={timeframeType}
              onValueChange={(value) =>
                setTimeframeType(value as TimeframeType)
              }
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="RELATIVE" id="relative" />
                <Label htmlFor="relative" className="cursor-pointer">
                  Preset period
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="DATE_RANGE" id="date_range" />
                <Label htmlFor="date_range" className="cursor-pointer">
                  Custom date range
                </Label>
              </div>
            </RadioGroup>

            {timeframeType === 'RELATIVE' ? (
              <Select
                value={relativePeriod}
                onValueChange={(v) => setRelativePeriod(v as RelativePeriod)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIVE_PERIOD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <DatePicker
                  label="From"
                  date={fromDate}
                  setDate={setFromDate}
                  disabled={{ after: toDate || new Date() }}
                />
                <DatePicker
                  label="To"
                  date={toDate}
                  setDate={setToDate}
                  disabled={{ before: fromDate, after: new Date() }}
                />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive font-medium">
                This action cannot be undone. To confirm, type "reset" below:
              </p>
            </div>
            <Input
              id="reset-confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder='Type "reset" to confirm'
              className={
                confirmationText.toLowerCase() === 'reset'
                  ? 'border-green-500'
                  : ''
              }
              autoComplete="off"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="tertiary"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isValid || isLoading}
            loading={isLoading}
          >
            Reset Selected Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
