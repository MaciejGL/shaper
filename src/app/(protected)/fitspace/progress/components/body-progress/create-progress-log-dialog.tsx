'use client'

import { Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { DatePicker } from '@/components/date-picker'
import { PrivateImageUpload } from '@/components/private-images/image-upload'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

import { useBodyProgressLogs } from './use-body-progress-logs'

interface CreateProgressLogDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editLog?: {
    id: string
    loggedAt: string
    image1Url?: string | null
    image2Url?: string | null
    image3Url?: string | null
    shareWithTrainer: boolean
  } | null
}

export function CreateProgressLogDialog({
  open,
  onOpenChange,
  editLog = null,
}: CreateProgressLogDialogProps) {
  const [formData, setFormData] = useState({
    loggedAt: editLog?.loggedAt
      ? editLog.loggedAt.split('T')[0]
      : new Date().toISOString().split('T')[0],
    shareWithTrainer: editLog?.shareWithTrainer || false,
    image1Url: editLog?.image1Url,
    image2Url: editLog?.image2Url,
    image3Url: editLog?.image3Url,
  })

  const { createProgressLog, updateProgressLog, isCreating, isUpdating } =
    useBodyProgressLogs()

  // Reset form when editLog changes or dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        loggedAt: editLog?.loggedAt
          ? editLog.loggedAt.split('T')[0]
          : new Date().toISOString().split('T')[0],
        shareWithTrainer: editLog?.shareWithTrainer || false,
        image1Url: editLog?.image1Url,
        image2Url: editLog?.image2Url,
        image3Url: editLog?.image3Url,
      })
    }
  }, [editLog, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const submitData = {
      loggedAt: formData.loggedAt,
      image1Url: formData.image1Url,
      image2Url: formData.image2Url,
      image3Url: formData.image3Url,
      shareWithTrainer: formData.shareWithTrainer,
    }

    if (editLog) {
      // Update existing progress log
      updateProgressLog(editLog.id, submitData)
    } else {
      // Create new progress log
      createProgressLog(submitData)
    }

    // Reset form and close dialog immediately (optimistic)
    setFormData({
      loggedAt: new Date().toISOString().split('T')[0],
      shareWithTrainer: false,
      image1Url: undefined,
      image2Url: undefined,
      image3Url: undefined,
    })
    onOpenChange(false)
  }

  const isEditing = !!editLog
  const isLoading = isCreating || isUpdating

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className="max-h-[90vh] overflow-y-auto"
        dialogTitle={isEditing ? 'Edit Progress Log' : 'Add Progress Log'}
      >
        <DrawerHeader className="flex flex-row items-center gap-2">
          <DrawerTitle className="flex items-center gap-2">
            {isEditing ? 'Edit Progress Log' : 'Add Progress Log'}
          </DrawerTitle>
        </DrawerHeader>

        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date */}
            <DatePicker
              date={new Date(formData.loggedAt)}
              dateFormat="d MMM yyyy"
              setDate={(date) =>
                date &&
                setFormData((prev) => ({
                  ...prev,
                  loggedAt: date.toISOString(),
                }))
              }
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
                <div className="flex items-center justify-between">
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

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="tertiary"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
                loading={isLoading}
              >
                {isEditing ? 'Update Progress Log' : 'Add Progress Log'}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
