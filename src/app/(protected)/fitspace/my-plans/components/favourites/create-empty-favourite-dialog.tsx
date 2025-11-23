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
import { Textarea } from '@/components/ui/textarea'
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
  const [description, setDescription] = useState('')

  const { mutateAsync: createFavourite, isPending: isCreating } =
    useCreateFavouriteWorkout()

  const handleSave = async () => {
    if (!title.trim()) return

    try {
      const result = await createFavourite({
        input: {
          title: title.trim(),
          description: description.trim() || null,
          folderId: currentFolderId || null,
          exercises: [],
        },
      })

      // Reset and call success callback with the new favourite ID
      setTitle('')
      setDescription('')
      onSuccess(result.createFavouriteWorkout.id)
      onClose()
    } catch (error) {
      console.error('Failed to create favourite workout:', error)
    }
  }

  const handleClose = () => {
    setTitle('')
    setDescription('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent dialogTitle="Create Custom Template">
        <DialogHeader>
          <DialogTitle>Create Custom Template</DialogTitle>
          <DialogDescription>
            Give your template a name. You'll add exercises in the next step.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Template Name *</Label>
            <Input
              id="title"
              placeholder="e.g., Upper Body Strength"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Add notes about this day..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              className="min-h-[100px]"
              rows={4}
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

