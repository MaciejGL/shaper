'use client'

import { useQueryClient } from '@tanstack/react-query'
import { Check, Edit2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  GQLGetNutritionPlanQuery,
  useGetNutritionPlanQuery,
  useUpdateNutritionPlanMutation,
} from '@/generated/graphql-client'

interface EditablePlanNameProps {
  planId: string
  planName: string
}

export function EditablePlanName({ planId, planName }: EditablePlanNameProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(planName)
  const [optimisticName, setOptimisticName] = useState(planName)
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const updateMutation = useUpdateNutritionPlanMutation({
    onSuccess: (data) => {
      toast.success('Plan name updated!')
      setIsEditing(false)

      // Update the optimistic name to the server response
      setOptimisticName(data.updateNutritionPlan.name)

      // Invalidate the query to ensure all components re-render with fresh data
      queryClient.invalidateQueries({
        queryKey: useGetNutritionPlanQuery.getKey({ id: planId }),
      })
    },
    onError: (error) => {
      toast.error('Failed to update plan name: ' + (error as Error).message)
      // Revert optimistic update by invalidating the query
      queryClient.invalidateQueries({
        queryKey: useGetNutritionPlanQuery.getKey({ id: planId }),
      })
      // Revert to original name
      setOptimisticName(planName)
      setValue(planName)
      setIsEditing(false)
    },
  })

  const handleEdit = () => {
    setIsEditing(true)
    setValue(optimisticName)
    // Focus the input after state update
    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 0)
  }

  const handleSave = () => {
    const trimmedValue = value.trim()

    if (!trimmedValue) {
      toast.error('Plan name cannot be empty')
      return
    }

    if (trimmedValue === planName) {
      // No change, just exit edit mode
      setIsEditing(false)
      return
    }

    // Apply optimistic update immediately
    setOptimisticName(trimmedValue)

    // Update the cache optimistically
    queryClient.setQueryData(
      useGetNutritionPlanQuery.getKey({ id: planId }),
      (oldData: GQLGetNutritionPlanQuery) => {
        if (!oldData?.nutritionPlan) return oldData

        return {
          ...oldData,
          nutritionPlan: {
            ...oldData.nutritionPlan,
            name: trimmedValue,
          },
        }
      },
    )

    // Save to server
    updateMutation.mutate({
      id: planId,
      input: {
        name: trimmedValue,
      },
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setValue(optimisticName)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  // Update internal state when prop changes (from parent re-render)
  useEffect(() => {
    if (!isEditing) {
      setOptimisticName(planName)
      setValue(planName)
    }
  }, [planName, isEditing])

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          id="editable-plan-name"
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="!text-3xl font-bold text-primary h-auto border-none p-0 bg-transparent focus-visible:ring-1"
          disabled={updateMutation.isPending}
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
          title="Save changes"
          iconOnly={<Check />}
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          disabled={updateMutation.isPending}
          className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          title="Cancel changes"
          iconOnly={<X />}
        />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 group">
      <h1 className="text-3xl font-bold text-primary">{optimisticName}</h1>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleEdit}
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit2 className="h-3 w-3" />
      </Button>
      {updateMutation.isPending && (
        <div className="text-xs text-muted-foreground">Saving...</div>
      )}
    </div>
  )
}
