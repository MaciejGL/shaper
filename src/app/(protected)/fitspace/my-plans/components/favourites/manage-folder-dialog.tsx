'use client'

import { useEffect, useState } from 'react'

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

interface ManageFolderDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  folderOperations: ReturnType<
    typeof import('@/hooks/use-favourite-workouts').useFavouriteWorkoutFolderOperations
  >
  folderToEdit?: { id: string; name: string } | null
}

export function ManageFolderDialog({
  open,
  onClose,
  onSuccess,
  folderOperations,
  folderToEdit,
}: ManageFolderDialogProps) {
  const [folderName, setFolderName] = useState('')
  const isEditing = !!folderToEdit

  useEffect(() => {
    if (open) {
      setFolderName(folderToEdit?.name || '')
    }
  }, [open, folderToEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!folderName.trim()) return

    try {
      if (isEditing && folderToEdit) {
        await folderOperations.updateFolder({
          id: folderToEdit.id,
          name: folderName.trim(),
        })
      } else {
        await folderOperations.createFolder({ name: folderName.trim() })
      }
      setFolderName('')
      onSuccess()
    } catch (error) {
      console.error('Failed to save folder:', error)
    }
  }

  const handleClose = () => {
    setFolderName('')
    onClose()
  }

  const isLoading =
    folderOperations.isCreatingFolder || folderOperations.isUpdatingFolder

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        dialogTitle={isEditing ? 'Edit Folder' : 'Create New Folder'}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Folder' : 'Create New Folder'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update the name of your folder'
                : 'Organize your custom workout days into folders'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-1">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g., Leg Days, Upper Body"
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!folderName.trim() || isLoading}
              loading={isLoading}
            >
              {isEditing ? 'Save Changes' : 'Create Folder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
