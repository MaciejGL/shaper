'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface DeleteFolderDialogProps {
  open: boolean
  folderName: string | null
  workoutCount?: number
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
}

export function DeleteFolderDialog({
  open,
  folderName,
  workoutCount,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteFolderDialogProps) {
  if (!folderName) return null

  const dayCount = typeof workoutCount === 'number' ? workoutCount : null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent dialogTitle="Delete plan">
        <DialogHeader>
          <DialogTitle>Delete plan</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{folderName}"?
          </DialogDescription>
        </DialogHeader>

        <div className="bg-card-on-card dark:bg-card p-4 rounded-lg">
          <p className="text-sm dark:text-muted-foreground">
            This action cannot be undone.
          </p>
          {dayCount !== null ? (
            <p className="text-sm dark:text-muted-foreground mt-2">
              The <strong>{dayCount}</strong> {dayCount === 1 ? 'day' : 'days'}{' '}
              inside this plan will be permanently deleted.
            </p>
          ) : (
            <p className="text-sm dark:text-muted-foreground mt-2">
              Days inside this plan will be permanently deleted.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            loading={isDeleting}
          >
            Delete plan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
