'use client'

import { useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  type GQLGetNutritionPlanQuery,
  useAddNutritionPlanDayMutation,
  useGetNutritionPlanQuery,
} from '@/generated/graphql-client'

type GQLNutritionPlanDay = NonNullable<
  GQLGetNutritionPlanQuery['nutritionPlan']
>['days'][number]

interface AddDayButtonProps {
  nutritionPlanId: string
  nextDayNumber: number
  onDayAdded?: (day: GQLNutritionPlanDay) => void
}

export function AddDayButton({
  nutritionPlanId,
  nextDayNumber,
  onDayAdded,
}: AddDayButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dayName, setDayName] = useState('')

  const queryClient = useQueryClient()

  const addDayMutation = useAddNutritionPlanDayMutation({
    onMutate: async () => {
      // Cancel outgoing refetches
      const queryKey = useGetNutritionPlanQuery.getKey({ id: nutritionPlanId })
      await queryClient.cancelQueries({ queryKey })

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey)

      // Optimistically update UI by adding the new day
      const optimisticDay = {
        id: `temp-${Date.now()}`,
        dayNumber: nextDayNumber,
        name: dayName.trim() || `Day ${nextDayNumber}`,
        dailyMacros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        meals: [],
      }

      queryClient.setQueryData(
        queryKey,
        (old: GQLGetNutritionPlanQuery | undefined) => {
          if (!old?.nutritionPlan) return old
          return {
            ...old,
            nutritionPlan: {
              ...old.nutritionPlan,
              days: [...(old.nutritionPlan.days || []), optimisticDay],
            },
          }
        },
      )

      return { previousData, queryKey }
    },
    onSuccess: (data) => {
      toast.success('Day added successfully!')
      onDayAdded?.(data.addNutritionPlanDay as GQLNutritionPlanDay)
      setIsOpen(false)
      setDayName('')
    },
    onError: (error, _, context) => {
      toast.error('Failed to add day: ' + (error as Error).message)
      // Rollback on error
      if (context?.previousData && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousData)
      }
    },
    onSettled: () => {
      // Always refetch after mutation
      const queryKey = useGetNutritionPlanQuery.getKey({ id: nutritionPlanId })
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const handleAddDay = () => {
    const finalDayName = dayName.trim() || `Day ${nextDayNumber}`

    addDayMutation.mutate({
      input: {
        nutritionPlanId,
        dayNumber: nextDayNumber,
        name: finalDayName,
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="tertiary" iconOnly={<Plus />}>
          Add Day
        </Button>
      </DialogTrigger>
      <DialogContent dialogTitle="Add New Day">
        <DialogHeader>
          <DialogTitle>Add New Day</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="dayName">Day Name</Label>
            <Input
              id="dayName"
              placeholder={`Day ${nextDayNumber}`}
              value={dayName}
              onChange={(e) => setDayName(e.target.value)}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Leave empty to use "Day {nextDayNumber}"
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={addDayMutation.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleAddDay} disabled={addDayMutation.isPending}>
              {addDayMutation.isPending ? 'Adding...' : 'Add Day'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
