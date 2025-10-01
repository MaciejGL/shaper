'use client'

import { ArrowRight, Camera, CheckCircle, Scale } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { CheckinCompletionData } from './types'
import { useCheckinScheduleOperations } from './use-checkin-schedule'

interface CheckinCompletionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isOverdue?: boolean
}

type CompletionStep = 'measurements' | 'photos' | 'complete'

export function CheckinCompletionModal({
  open,
  onOpenChange,
  isOverdue = false,
}: CheckinCompletionModalProps) {
  const { completeCheckin, isCompleting } = useCheckinScheduleOperations()

  const [step, setStep] = useState<CompletionStep>('measurements')
  const [completionData, setCompletionData] = useState<CheckinCompletionData>(
    {},
  )

  const handleMeasurementChange = (field: string, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value)
    setCompletionData((prev) => ({
      ...prev,
      measurementData: {
        ...prev.measurementData,
        [field]: numValue,
      },
    }))
  }

  const handleProgressLogChange = (field: string, value: string | boolean) => {
    setCompletionData((prev) => ({
      ...prev,
      progressLogData: {
        ...prev.progressLogData,
        [field]: value,
      },
    }))
  }

  const handleNext = () => {
    if (step === 'measurements') {
      setStep('photos')
    } else if (step === 'photos') {
      setStep('complete')
    }
  }

  const handleBack = () => {
    if (step === 'photos') {
      setStep('measurements')
    } else if (step === 'complete') {
      setStep('photos')
    }
  }

  const handleComplete = () => {
    // Filter out empty data
    const measurementData = completionData.measurementData
    const progressLogData = completionData.progressLogData

    const hasAnyMeasurement =
      measurementData &&
      Object.values(measurementData).some((v) => v !== undefined && v !== '')
    const hasAnyProgressLog =
      progressLogData &&
      Object.values(progressLogData).some((v) => v !== undefined && v !== '')

    completeCheckin({
      input: {
        measurementData: hasAnyMeasurement ? measurementData : undefined,
        progressLogData: hasAnyProgressLog ? progressLogData : undefined,
      },
    })

    // Reset state
    setStep('measurements')
    setCompletionData({})
    onOpenChange(false)
  }

  const handleClose = () => {
    setStep('measurements')
    setCompletionData({})
    onOpenChange(false)
  }

  const renderMeasurementsStep = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-primary">
        <Scale className="size-5" />
        <h3 className="font-medium">Step 1: Log Measurements</h3>
      </div>

      <p className="text-sm text-muted-foreground">
        Record your body measurements. You can skip any measurements you don't
        want to track.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            placeholder="70.0"
            value={completionData.measurementData?.weight || ''}
            onChange={(e) => handleMeasurementChange('weight', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bodyFat">Body Fat (%)</Label>
          <Input
            id="bodyFat"
            type="number"
            step="0.1"
            placeholder="15.0"
            value={completionData.measurementData?.bodyFat || ''}
            onChange={(e) => handleMeasurementChange('bodyFat', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="chest">Chest (cm)</Label>
          <Input
            id="chest"
            type="number"
            step="0.1"
            placeholder="100.0"
            value={completionData.measurementData?.chest || ''}
            onChange={(e) => handleMeasurementChange('chest', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="waist">Waist (cm)</Label>
          <Input
            id="waist"
            type="number"
            step="0.1"
            placeholder="80.0"
            value={completionData.measurementData?.waist || ''}
            onChange={(e) => handleMeasurementChange('waist', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any notes about your measurements..."
          value={completionData.measurementData?.notes || ''}
          onChange={(e) => handleMeasurementChange('notes', e.target.value)}
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext}>
          Next: Photos
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  )

  const renderPhotosStep = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-primary">
        <Camera className="size-5" />
        <h3 className="font-medium">Step 2: Take Progress Photos</h3>
      </div>

      <p className="text-sm text-muted-foreground">
        Take progress photos to track visual changes. You can add photos later
        from the snapshots section.
      </p>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="photo-notes">Photo Notes (optional)</Label>
          <Textarea
            id="photo-notes"
            placeholder="Notes about your photos or how you're feeling..."
            value={completionData.progressLogData?.notes || ''}
            onChange={(e) => handleProgressLogChange('notes', e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="share-trainer"
            checked={completionData.progressLogData?.shareWithTrainer || false}
            onCheckedChange={(checked) =>
              handleProgressLogChange('shareWithTrainer', checked)
            }
          />
          <Label htmlFor="share-trainer" className="text-sm">
            Share with my trainer
          </Label>
        </div>

        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-sm font-medium">📸 Photo Tips:</p>
          <ul className="text-xs text-muted-foreground mt-1 space-y-1">
            <li>• Take photos in good lighting</li>
            <li>• Use the same poses and angles each time</li>
            <li>• Wear similar clothing for consistency</li>
          </ul>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button onClick={handleNext}>
          Complete Check-in
          <CheckCircle className="size-4" />
        </Button>
      </div>
    </div>
  )

  const renderCompleteStep = () => (
    <div className="space-y-4 text-center">
      <div className="flex items-center justify-center">
        <CheckCircle className="size-12 text-green-600" />
      </div>

      <div>
        <h3 className="font-medium text-lg">Ready to Complete Check-in!</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {isOverdue
            ? 'Great job catching up on your check-in!'
            : "You're right on schedule!"}
        </p>
      </div>

      <div className="rounded-lg bg-muted/50 p-3 text-left">
        <p className="text-sm font-medium">What you've logged:</p>
        <ul className="text-xs text-muted-foreground mt-1 space-y-1">
          {completionData.measurementData?.weight && (
            <li>• Weight: {completionData.measurementData.weight}kg</li>
          )}
          {completionData.measurementData?.chest && (
            <li>• Chest: {completionData.measurementData.chest}cm</li>
          )}
          {completionData.measurementData?.waist && (
            <li>• Waist: {completionData.measurementData.waist}cm</li>
          )}
          {completionData.progressLogData?.notes && (
            <li>• Progress notes added</li>
          )}
          {!completionData.measurementData?.weight &&
            !completionData.progressLogData?.notes && (
              <li className="text-muted-foreground">
                • Check-in completion logged
              </li>
            )}
        </ul>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button
          onClick={handleComplete}
          loading={isCompleting}
          disabled={isCompleting}
        >
          Complete Check-in 🎉
        </Button>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" dialogTitle="Complete Check-in">
        <DialogHeader>
          <DialogTitle>
            {isOverdue
              ? '⏰ Complete Overdue Check-in'
              : '📊 Progress Check-in'}
          </DialogTitle>
          <DialogDescription>
            {isOverdue
              ? "Your scheduled check-in is overdue. Let's get you caught up!"
              : 'Time to log your progress! This helps track your fitness journey.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'measurements' && renderMeasurementsStep()}
        {step === 'photos' && renderPhotosStep()}
        {step === 'complete' && renderCompleteStep()}
      </DialogContent>
    </Dialog>
  )
}
