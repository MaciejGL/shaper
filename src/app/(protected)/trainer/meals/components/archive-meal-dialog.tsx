'use client'

import { useQueryClient } from '@tanstack/react-query'
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
  useArchiveMealInLibraryMutation,
  useGetMealsForLibraryQuery,
  useUnarchiveMealInLibraryMutation,
} from '@/generated/graphql-client'

type Meal = NonNullable<GQLGetMealsForLibraryQuery['teamMeals']>[number]

interface ArchiveMealDialogProps {
  meal: Meal
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ArchiveMealDialog({
  meal,
  open,
  onOpenChange,
}: ArchiveMealDialogProps) {
  const queryClient = useQueryClient()
  const isArchived = meal.archived

  const archiveMutation = useArchiveMealInLibraryMutation({
    onMutate: async () => {
      const queryKey = useGetMealsForLibraryQuery.getKey({})
      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(
        queryKey,
        (old: GQLGetMealsForLibraryQuery | undefined) => {
          if (!old?.teamMeals) return old
          return {
            ...old,
            teamMeals: old.teamMeals.map((m) =>
              m.id === meal.id ? { ...m, archived: true } : m,
            ),
          }
        },
      )

      return { previousData }
    },
    onSuccess: () => {
      toast.success('Meal archived successfully')
      onOpenChange(false)
    },
    onError: (error, _, context) => {
      toast.error('Failed to archive meal: ' + (error as Error).message)
      if (context?.previousData) {
        const queryKey = useGetMealsForLibraryQuery.getKey({})
        queryClient.setQueryData(queryKey, context.previousData)
      }
    },
    onSettled: () => {
      const queryKey = useGetMealsForLibraryQuery.getKey({})
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const unarchiveMutation = useUnarchiveMealInLibraryMutation({
    onMutate: async () => {
      const queryKey = useGetMealsForLibraryQuery.getKey({})
      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(
        queryKey,
        (old: GQLGetMealsForLibraryQuery | undefined) => {
          if (!old?.teamMeals) return old
          return {
            ...old,
            teamMeals: old.teamMeals.map((m) =>
              m.id === meal.id ? { ...m, archived: false } : m,
            ),
          }
        },
      )

      return { previousData }
    },
    onSuccess: () => {
      toast.success('Meal restored successfully')
      onOpenChange(false)
    },
    onError: (error, _, context) => {
      toast.error('Failed to restore meal: ' + (error as Error).message)
      if (context?.previousData) {
        const queryKey = useGetMealsForLibraryQuery.getKey({})
        queryClient.setQueryData(queryKey, context.previousData)
      }
    },
    onSettled: () => {
      const queryKey = useGetMealsForLibraryQuery.getKey({})
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const handleConfirm = () => {
    if (isArchived) {
      unarchiveMutation.mutate({ id: meal.id })
    } else {
      archiveMutation.mutate({ id: meal.id })
    }
  }

  const isPending = archiveMutation.isPending || unarchiveMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dialogTitle={isArchived ? 'Unarchive Meal' : 'Archive Meal'}
      >
        <DialogHeader>
          <DialogTitle>
            {isArchived ? 'Unarchive Meal' : 'Archive Meal'}
          </DialogTitle>
          <DialogDescription>
            {isArchived
              ? `Are you sure you want to restore "${meal.name}"? It will be visible in your meal library again.`
              : `Are you sure you want to archive "${meal.name}"? You can restore it later from the archived meals view.`}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="tertiary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            loading={isPending}
            disabled={isPending}
          >
            {isArchived ? 'Unarchive' : 'Archive'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
