'use client'

import { useQueryClient } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  type GQLGetMealsForLibraryQuery,
  useDeleteMealInLibraryMutation,
  useGetMealsForLibraryQuery,
} from '@/generated/graphql-client'

type Meal = NonNullable<GQLGetMealsForLibraryQuery['teamMeals']>[number]

interface DeleteMealDialogProps {
  meal: Meal
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteMealDialog({
  meal,
  open,
  onOpenChange,
}: DeleteMealDialogProps) {
  const queryClient = useQueryClient()
  const isInUse = meal.usageCount > 0

  const deleteMutation = useDeleteMealInLibraryMutation({
    onMutate: async () => {
      // Cancel outgoing queries
      const queryKey = useGetMealsForLibraryQuery.getKey({})
      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueryData(queryKey)

      // Optimistically remove meal from list
      queryClient.setQueryData(
        queryKey,
        (old: GQLGetMealsForLibraryQuery | undefined) => {
          if (!old) return old
          return {
            ...old,
            teamMeals: old.teamMeals.filter((m) => m.id !== meal.id),
          }
        },
      )

      return { previousData }
    },
    onSuccess: () => {
      toast.success('Meal deleted successfully')
      onOpenChange(false)
    },
    onError: (error, _, context) => {
      toast.error('Failed to delete meal: ' + (error as Error).message)
      // Rollback
      if (context?.previousData) {
        const queryKey = useGetMealsForLibraryQuery.getKey({})
        queryClient.setQueryData(queryKey, context.previousData)
      }
    },
    onSettled: () => {
      // Refetch
      const queryKey = useGetMealsForLibraryQuery.getKey({})
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const handleDelete = () => {
    if (isInUse) return
    deleteMutation.mutate({ id: meal.id })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dialogTitle="Delete Meal">
        <DialogHeader>
          <DialogTitle>Delete Meal</DialogTitle>
          <DialogDescription>
            {isInUse
              ? `This meal is used in ${meal.usageCount} nutrition plan${meal.usageCount > 1 ? 's' : ''}`
              : `Are you sure you want to delete "${meal.name}"?`}
          </DialogDescription>
        </DialogHeader>

        {isInUse ? (
          <div className="rounded-lg bg-destructive/10 p-4 flex items-start gap-3">
            <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-destructive mb-1">
                Cannot delete this meal
              </p>
              <p className="text-muted-foreground">
                This meal is currently used in {meal.usageCount} nutrition plan
                {meal.usageCount > 1 ? 's' : ''}. Remove it from all plans
                before deleting, or duplicate it to create an editable version.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. The meal and all its ingredient data
            will be permanently deleted.
          </p>
        )}

        <DialogFooter>
          <Button variant="tertiary" onClick={() => onOpenChange(false)}>
            {isInUse ? 'Close' : 'Cancel'}
          </Button>
          {!isInUse && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              loading={deleteMutation.isPending}
              disabled={deleteMutation.isPending}
            >
              Delete Meal
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
