'use client'

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
      <DialogContent dialogTitle="Remove Custom Day">
        <DialogHeader>
          <DialogTitle>Remove Custom Day</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{favourite.title}"?
          </DialogDescription>
        </DialogHeader>

        <div className="bg-card-on-card p-4 rounded-lg">
          <p className="text-sm dark:text-muted-foreground">
            This action cannot be undone. The custom day and all its exercises
            will be permanently deleted.
          </p>
          {favourite.exercises.length > 0 && (
            <p className="text-sm dark:text-muted-foreground mt-2">
              <strong>{favourite.exercises.length} exercises</strong> will be
              removed.
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
            Remove Day
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
