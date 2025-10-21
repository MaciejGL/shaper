'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  type GQLGetMealsForLibraryQuery,
  useDuplicateMealInLibraryMutation,
  useGetMealsForLibraryQuery,
} from '@/generated/graphql-client'

type Meal = NonNullable<GQLGetMealsForLibraryQuery['teamMeals']>[number]

interface DuplicateMealDialogProps {
  meal: Meal
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DuplicateMealDialog({
  meal,
  open,
  onOpenChange,
}: DuplicateMealDialogProps) {
  const [newName, setNewName] = useState(`${meal.name} (Copy)`)
  const queryClient = useQueryClient()

  const duplicateMutation = useDuplicateMealInLibraryMutation({
    onMutate: async () => {
      // Cancel outgoing queries
      const queryKey = useGetMealsForLibraryQuery.getKey({})
      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueryData(queryKey)

      return { previousData }
    },
    onSuccess: () => {
      toast.success('Meal duplicated successfully')
      onOpenChange(false)
      setNewName(`${meal.name} (Copy)`)
    },
    onError: (error, variables, context) => {
      toast.error('Failed to duplicate meal: ' + (error as Error).message)
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

  const handleDuplicate = () => {
    duplicateMutation.mutate({
      id: meal.id,
      newName: newName || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dialogTitle="Duplicate Meal">
        <DialogHeader>
          <DialogTitle>Duplicate Meal</DialogTitle>
          <DialogDescription>
            Create a copy of "{meal.name}" with all ingredients
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="newName">New meal name</Label>
            <Input
              id="newName"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter meal name"
              variant="secondary"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="tertiary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDuplicate}
            loading={duplicateMutation.isPending}
            disabled={!newName.trim() || duplicateMutation.isPending}
          >
            Duplicate Meal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
