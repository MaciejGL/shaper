'use client'

import { BookmarkCheckIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCreateFavouriteWorkout } from '@/hooks/use-favourite-workouts'

interface CreateEmptyFavouriteDrawerProps {
  open: boolean
  onClose: () => void
  onSuccess: (favouriteId: string) => void
  currentFolderId?: string | null
}

export function CreateEmptyFavouriteDrawer({
  open,
  onClose,
  onSuccess,
  currentFolderId,
}: CreateEmptyFavouriteDrawerProps) {
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
    <Drawer open={open} onOpenChange={handleClose}>
      <DrawerContent
        dialogTitle="Create Custom Template"
        className="max-h-[85vh]"
      >
        <DrawerHeader>
          <DrawerTitle>Create Custom Template</DrawerTitle>
          <DrawerDescription>
            Give your template a name. You'll add exercises in the next step.
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-4 px-4 pb-4">
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
              placeholder="Add notes about this template..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
            />
          </div>
        </div>

        <DrawerFooter>
          <Button
            variant="tertiary"
            onClick={handleClose}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim() || isCreating}
            loading={isCreating}
            iconStart={<BookmarkCheckIcon />}
          >
            Create Template
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
