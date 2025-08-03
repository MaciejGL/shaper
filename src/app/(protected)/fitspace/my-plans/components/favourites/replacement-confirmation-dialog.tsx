'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ReplacementConfirmationDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isStarting: boolean
  message: string
  workoutDescription?: string
}

export function ReplacementConfirmationDialog({
  open,
  onClose,
  onConfirm,
  isStarting,
  message,
}: ReplacementConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent dialogTitle="Replace Current Workout">
        <DialogHeader>
          <DialogTitle>Replace Current Workout</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={isStarting}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isStarting}>
            {isStarting ? 'Starting...' : 'Replace & Start'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
