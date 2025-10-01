'use client'

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

import { ProgressPhotoForm } from '../progress-photo-form'

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
  const isEditing = !!editLog

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
          <ProgressPhotoForm
            editLog={editLog}
            onSuccess={() => onOpenChange(false)}
            submitButtonText={
              isEditing ? 'Update Progress Log' : 'Add Progress Log'
            }
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
