'use client'

import { Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useClearWorkoutDay } from '@/hooks/use-clear-workout'

interface ClearWorkoutModalProps {
  dayId: string
  onSuccess?: () => void
}

export function ClearWorkoutModal({
  dayId,
  onSuccess,
}: ClearWorkoutModalProps) {
  const [open, setOpen] = useState(false)
  const { mutate: clearWorkout, isPending: isClearing } =
    useClearWorkoutDay(dayId)

  const handleConfirm = async () => {
    try {
      await clearWorkout(
        { dayId },
        {
          onSuccess: () => {
            setOpen(false)
            onSuccess?.()
          },
        },
      )
    } catch (error) {
      // Error handling is done in the hook
      console.error('Failed to clear workout:', error)
    }
  }

  return (
    <>
      <Button
        variant="destructive"
        size="md"
        onClick={() => setOpen(true)}
        iconStart={<Trash2 />}
        className="w-full"
      >
        Clear All Exercises
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dialogTitle="Clear all exercises?">
          <DialogHeader>
            <DialogTitle>Clear all exercises?</DialogTitle>
            <DialogDescription>
              This will remove all exercises from this workout. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="tertiary"
              onClick={() => setOpen(false)}
              disabled={isClearing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isClearing}
              loading={isClearing}
            >
              {isClearing ? 'Clearing...' : 'Clear All'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
