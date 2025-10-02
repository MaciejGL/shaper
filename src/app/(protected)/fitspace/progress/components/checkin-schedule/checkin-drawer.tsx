'use client'

import { omit } from 'lodash'
import { ArrowLeft, ArrowRight, Camera, CheckCircle, Scale } from 'lucide-react'
import { useCallback, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import {
  GQLAddBodyMeasurementInput,
  GQLCreateBodyProgressLogInput,
} from '@/generated/graphql-client'

import { MeasurementForm } from '../measurement-form'
import { ProgressPhotoForm } from '../progress-photo-form'

import { useCheckinScheduleOperations } from './use-checkin-schedule'

interface CheckinDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type CheckinStep = 'measurements' | 'photos'

export function CheckinDrawer({ open, onOpenChange }: CheckinDrawerProps) {
  const [currentStep, setCurrentStep] = useState<CheckinStep>('measurements')
  const [measurementData, setMeasurementData] =
    useState<GQLAddBodyMeasurementInput | null>(null)
  const [photoData, setPhotoData] =
    useState<GQLCreateBodyProgressLogInput | null>(null)

  const { completeCheckin, isCompleting } = useCheckinScheduleOperations()

  const handleMeasurementDataChange = useCallback(
    (data: GQLAddBodyMeasurementInput) => {
      setMeasurementData(data)
    },
    [],
  )

  const handlePhotoDataChange = useCallback(
    (data: GQLCreateBodyProgressLogInput) => {
      setPhotoData(data)
    },
    [],
  )

  const handleNext = () => {
    if (currentStep === 'measurements') {
      setCurrentStep('photos')
    }
  }

  const handlePrev = () => {
    if (currentStep === 'photos') {
      setCurrentStep('measurements')
    }
  }

  const handleSubmitCheckin = () => {
    const payload = {
      input: {
        measurementData: measurementData || undefined,
        progressLogData: photoData || undefined,
      },
    }

    completeCheckin(payload)

    // Reset state and close
    setCurrentStep('measurements')
    setMeasurementData(null)
    setPhotoData(null)
    onOpenChange(false)
  }

  const handleClose = () => {
    setCurrentStep('measurements')
    setMeasurementData(null)
    setPhotoData(null)
    onOpenChange(false)
  }

  const canGoNext = currentStep === 'measurements'
  const canGoPrev = currentStep === 'photos'
  const canSubmit = currentStep === 'photos'

  // Check if there's any measurement data (at least one field filled)
  const hasMeasurementData =
    measurementData &&
    Object.values(omit(measurementData, ['notes', 'measuredAt'])).some(
      (value) => value !== undefined && value !== null,
    )

  // Check if there's at least one image uploaded
  const hasPhotoData =
    photoData &&
    (photoData.image1Url || photoData.image2Url || photoData.image3Url)

  // Enable submit only if we have either measurement data or photo data
  const canCompleteCheckin = hasMeasurementData || hasPhotoData

  return (
    <>
      <Drawer open={open} onOpenChange={handleClose}>
        <DrawerContent className="max-h-[90vh]" dialogTitle="Check-in Progress">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              {currentStep === 'measurements' ? (
                <>
                  <Scale className="size-5 text-blue-500" />
                  Body Measurements
                </>
              ) : (
                <>
                  <Camera className="size-5 text-purple-500" />
                  Progress Photos
                </>
              )}
            </DrawerTitle>
          </DrawerHeader>

          <div className="px-4 pb-4 space-y-6 overflow-y-auto compact-scrollbar">
            {currentStep === 'measurements' && (
              <div className="space-y-6">
                <div className="text-sm text-muted-foreground">
                  Record your body measurements to track progress over time.
                </div>

                <MeasurementForm
                  onDataChange={handleMeasurementDataChange}
                  showSubmitButton={false}
                />
              </div>
            )}

            {currentStep === 'photos' && (
              <div className="space-y-6">
                <div className="text-sm text-muted-foreground">
                  Take progress photos to visually track your transformation.
                </div>

                <ProgressPhotoForm
                  onDataChange={handlePhotoDataChange}
                  showSubmitButton={false}
                />

                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-sm font-medium">Photo Tips:</p>
                  <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                    <li>• Take photos in good lighting</li>
                    <li>• Use the same poses and angles each time</li>
                    <li>• Wear similar clothing for consistency</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <DrawerFooter>
            <div className="flex items-center justify-between gap-3">
              {canGoPrev ? (
                <Button
                  variant="tertiary"
                  onClick={handlePrev}
                  className="flex-1"
                  iconStart={<ArrowLeft />}
                >
                  Previous
                </Button>
              ) : (
                <Button
                  variant="tertiary"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Close
                </Button>
              )}

              {canGoNext && (
                <Button
                  onClick={handleNext}
                  className="flex-1"
                  iconEnd={<ArrowRight />}
                >
                  Next
                </Button>
              )}

              {canSubmit && (
                <Button
                  onClick={handleSubmitCheckin}
                  loading={isCompleting}
                  disabled={isCompleting || !canCompleteCheckin}
                  className="flex-1"
                  iconStart={<CheckCircle />}
                >
                  Complete Check-in
                </Button>
              )}
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
