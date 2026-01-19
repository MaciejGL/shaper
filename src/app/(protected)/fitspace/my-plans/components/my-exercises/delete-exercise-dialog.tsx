'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface DeleteExerciseDialogProps {
  exercise: { id: string; name: string } | null
  isDeleting: boolean
  onCancel: () => void
  onConfirm: () => Promise<void>
}

export function DeleteExerciseDialog({
  exercise,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteExerciseDialogProps) {
  return (
    <Dialog
      open={Boolean(exercise)}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onCancel()
      }}
    >
      <DialogContent dialogTitle="Delete exercise">
        <DialogHeader>
          <DialogTitle>Delete exercise</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{exercise?.name}"? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row gap-2 justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            loading={isDeleting}
            disabled={!exercise || isDeleting}
            onClick={() => void onConfirm()}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

