'use client'

import { Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { DatePicker } from '@/components/date-picker'
import { PrivateImageUpload } from '@/components/private-images/image-upload'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { GQLCreateBodyProgressLogInput } from '@/generated/graphql-client'

import { useBodyProgressLogs } from './body-progress/use-body-progress-logs'

interface ProgressPhotoFormProps {
  onSuccess?: (data?: GQLCreateBodyProgressLogInput) => void
  onDataChange?: (data: GQLCreateBodyProgressLogInput) => void
  showSubmitButton?: boolean
  submitButtonText?: string
  editLog?: {
    id: string
    loggedAt: string
    image1Url?: string | null
    image2Url?: string | null
    image3Url?: string | null
    shareWithTrainer: boolean
  } | null
}

export function ProgressPhotoForm({
  onSuccess,
  onDataChange,
  showSubmitButton = true,
  submitButtonText = 'Save Progress Photos',
  editLog = null,
}: ProgressPhotoFormProps) {
  const [formData, setFormData] = useState({
    loggedAt: editLog?.loggedAt || new Date().toISOString(),
    shareWithTrainer: editLog?.shareWithTrainer ?? true,
    image1Url: editLog?.image1Url,
    image2Url: editLog?.image2Url,
    image3Url: editLog?.image3Url,
  })

  const { createProgressLog, updateProgressLog, isCreating, isUpdating } =
    useBodyProgressLogs()

  // Update parent component whenever form data changes
  useEffect(() => {
    if (onDataChange) {
      const submitData = {
        loggedAt: formData.loggedAt,
        image1Url: formData.image1Url,
        image2Url: formData.image2Url,
        image3Url: formData.image3Url,
        shareWithTrainer: formData.shareWithTrainer,
      }
      onDataChange(submitData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]) // Remove onDataChange from dependencies to prevent infinite loops

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const submitData = {
      loggedAt: formData.loggedAt,
      image1Url: formData.image1Url,
      image2Url: formData.image2Url,
      image3Url: formData.image3Url,
      shareWithTrainer: formData.shareWithTrainer,
    }

    try {
      if (showSubmitButton) {
        // Submit directly when used as standalone form
        if (editLog) {
          await updateProgressLog(editLog.id, submitData)
        } else {
          await createProgressLog(submitData)
        }

        // Reset form only when actually submitting
        setFormData({
          loggedAt: new Date().toISOString(),
          shareWithTrainer: false,
          image1Url: undefined,
          image2Url: undefined,
          image3Url: undefined,
        })
      }

      // Always pass data to parent component
      onSuccess?.(submitData)
    } catch (error) {
      console.error('Failed to save progress photos:', error)
    }
  }

  const isLoading = isCreating || isUpdating

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date */}
      <DatePicker
        date={new Date(formData.loggedAt)}
        dateFormat="d MMM yyyy"
        setDate={(date) => {
          if (date) {
            // Preserve the original time when updating the date
            const originalTime = new Date(formData.loggedAt)
            const newDateTime = new Date(date)
            newDateTime.setHours(
              originalTime.getHours(),
              originalTime.getMinutes(),
              originalTime.getSeconds(),
              originalTime.getMilliseconds(),
            )
            setFormData((prev) => ({
              ...prev,
              loggedAt: newDateTime.toISOString(),
            }))
          }
        }}
        buttonProps={{
          variant: 'tertiary',
          className: 'min-w-1/2 w-max',
        }}
      />

      {/* Images */}
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <PrivateImageUpload
            label="Front View"
            imageUrl={formData.image1Url ?? undefined}
            onImageChange={(url) =>
              setFormData((prev) => ({ ...prev, image1Url: url }))
            }
            imageType="progress"
            disabled={isLoading}
          />
          <PrivateImageUpload
            label="Side View"
            imageUrl={formData.image2Url ?? undefined}
            onImageChange={(url) =>
              setFormData((prev) => ({ ...prev, image2Url: url }))
            }
            imageType="progress"
            disabled={isLoading}
          />
          <PrivateImageUpload
            label="Back View"
            imageUrl={formData.image3Url ?? undefined}
            onImageChange={(url) =>
              setFormData((prev) => ({ ...prev, image3Url: url }))
            }
            imageType="progress"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Share with trainer */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <Share2 className="size-4" />
                Share with trainer
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow your trainer to see this progress log and photos
              </p>
            </div>
            <Switch
              checked={formData.shareWithTrainer}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  shareWithTrainer: checked,
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {showSubmitButton && (
        <Button
          type="submit"
          disabled={
            isLoading ||
            [formData.image1Url, formData.image2Url, formData.image3Url].every(
              (url) => !url,
            )
          }
          loading={isLoading}
          className="w-full"
        >
          {submitButtonText}
        </Button>
      )}
    </form>
  )
}
