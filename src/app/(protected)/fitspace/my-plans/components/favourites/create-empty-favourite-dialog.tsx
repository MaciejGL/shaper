'use client'

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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateFavouriteWorkout } from '@/hooks/use-favourite-workouts'

interface CreateEmptyFavouriteDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: (favouriteId: string) => void
  currentFolderId?: string | null
}

export function CreateEmptyFavouriteDialog({
  open,
  onClose,
  onSuccess,
  currentFolderId,
}: CreateEmptyFavouriteDialogProps) {
  const [title, setTitle] = useState('')

  const { mutateAsync: createFavourite, isPending: isCreating } =
    useCreateFavouriteWorkout()

  const handleSave = async () => {
    if (!title.trim()) return

    try {
      const result = await createFavourite({
        input: {
          title: title.trim(),
          folderId: currentFolderId || null,
          exercises: [],
        },
      })

      // Reset and call success callback with the new favourite ID
      setTitle('')
      onSuccess(result.createFavouriteWorkout.id)
      onClose()
    } catch (error) {
      console.error('Failed to create favourite workout:', error)
    }
  }

  const handleClose = () => {
    setTitle('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent dialogTitle="Create Custom Template">
        <DialogHeader>
          <DialogTitle>Create day</DialogTitle>
          <DialogDescription>
            Give your day a name. You'll add exercises in the next step.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Day Name</Label>
            <Input
              id="title"
              placeholder="e.g., Upper Body Strength"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim() || isCreating}
            loading={isCreating}
          >
            Add Day
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
