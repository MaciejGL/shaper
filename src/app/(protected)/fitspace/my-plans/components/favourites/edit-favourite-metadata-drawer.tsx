'use client'

import { BookmarkCheckIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

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
import { useUpdateFavouriteWorkout } from '@/hooks/use-favourite-workouts'

interface EditFavouriteMetadataDrawerProps {
  open: boolean
  onClose: () => void
  favouriteId: string
  currentTitle: string
  currentDescription?: string | null
  onSuccess: () => void
}

export function EditFavouriteMetadataDrawer({
  open,
  onClose,
  favouriteId,
  currentTitle,
  currentDescription,
  onSuccess,
}: EditFavouriteMetadataDrawerProps) {
  const [title, setTitle] = useState(currentTitle)
  const [description, setDescription] = useState(currentDescription || '')

  // Update local state when props change
  useEffect(() => {
    if (open) {
      setTitle(currentTitle)
      setDescription(currentDescription || '')
    }
  }, [open, currentTitle, currentDescription])

  const { mutateAsync: updateFavourite, isPending: isUpdating } =
    useUpdateFavouriteWorkout()

  const handleSave = async () => {
    if (!title.trim()) return

    try {
      await updateFavourite({
        input: {
          id: favouriteId,
          title: title.trim(),
          description: description.trim() || null,
        },
      })

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to update favourite workout:', error)
    }
  }

  const handleClose = () => {
    setTitle(currentTitle)
    setDescription(currentDescription || '')
    onClose()
  }

  return (
    <Drawer open={open} onOpenChange={handleClose}>
      <DrawerContent
        dialogTitle="Edit Template Details"
        className="max-h-[85vh]"
      >
        <DrawerHeader>
          <DrawerTitle>Edit Template Details</DrawerTitle>
          <DrawerDescription>
            Update the name and description of your template
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-4 px-4 pb-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Template Name *</Label>
            <Input
              id="edit-title"
              placeholder="e.g., Upper Body Strength"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description (optional)</Label>
            <Textarea
              id="edit-description"
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
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim() || isUpdating}
            loading={isUpdating}
            iconStart={<BookmarkCheckIcon />}
          >
            Save Changes
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
