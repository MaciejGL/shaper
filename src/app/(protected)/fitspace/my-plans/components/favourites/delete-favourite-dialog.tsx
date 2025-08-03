'use client'

import { AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { GQLGetFavouriteWorkoutsQuery } from '@/generated/graphql-client'

type FavouriteWorkout = NonNullable<
  NonNullable<GQLGetFavouriteWorkoutsQuery>['getFavouriteWorkouts']
>[number]

interface DeleteFavouriteDialogProps {
  open: boolean
  favourite: FavouriteWorkout | null
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
}

export function DeleteFavouriteDialog({
  open,
  favourite,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteFavouriteDialogProps) {
  if (!favourite) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent dialogTitle="Delete Favourite Workout">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <DialogTitle>Delete Favourite Workout</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{favourite.title}"?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. The favourite workout and all its
            exercises will be permanently deleted.
          </p>
          {favourite.exercises.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              <strong>{favourite.exercises.length} exercises</strong> will be
              removed.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Favourite'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
