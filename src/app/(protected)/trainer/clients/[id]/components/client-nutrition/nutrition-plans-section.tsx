'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { ConfirmationModal } from '@/components/confirmation-modal'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  type GQLCreateNutritionPlanInput,
  type GQLGetClientNutritionPlansQuery,
  useCreateNutritionPlanMutation,
  useDeleteNutritionPlanMutation,
  useGetClientNutritionPlansQuery,
  useShareNutritionPlanWithClientMutation,
  useUnshareNutritionPlanFromClientMutation,
} from '@/generated/graphql-client'
import { useOptimisticMutation } from '@/lib/optimistic-mutations'

import { ImportPlanCombobox } from './import-plan-combobox'
import { NutritionPlanCard } from './nutrition-plan-card'

interface NutritionPlansSectionProps {
  clientId: string
}

export function NutritionPlansSection({
  clientId,
}: NutritionPlansSectionProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useGetClientNutritionPlansQuery({
    clientId,
  })

  const queryKey = useGetClientNutritionPlansQuery.getKey({ clientId })
  const createPlanMutation = useCreateNutritionPlanMutation()
  const sharePlanMutation = useShareNutritionPlanWithClientMutation()
  const unsharePlanMutation = useUnshareNutritionPlanFromClientMutation()
  const deletePlanMutation = useDeleteNutritionPlanMutation()

  // Optimistic update function for adding nutrition plans
  const addNutritionPlanToCache = (
    oldData: GQLGetClientNutritionPlansQuery,
    variables: { input: GQLCreateNutritionPlanInput },
  ): GQLGetClientNutritionPlansQuery => {
    const optimisticPlan = {
      id: `temp-${Date.now()}`,
      name: variables.input.name,
      description: variables.input.description || null,
      isSharedWithClient: false,
      createdAt: new Date().toISOString(),
      dayCount: 0,
      totalMealCount: 0,
    }

    return {
      ...oldData,
      getClientNutritionPlans: [
        optimisticPlan,
        ...(oldData?.getClientNutritionPlans || []),
      ],
    }
  }

  const { optimisticMutate: createPlanOptimistic } = useOptimisticMutation({
    queryKey,
    mutationFn: createPlanMutation.mutateAsync,
    updateFn: addNutritionPlanToCache,
    onSuccess: () => {
      setIsCreating(false)
      // Invalidate the query to fetch the real plan with actual ID
      queryClient.invalidateQueries({ queryKey })
    },
    onError: (error: Error) => {
      setIsCreating(false)
      console.error('Failed to create nutrition plan:', error)
    },
  })

  // Share/Unshare optimistic update functions
  const togglePlanSharingInCache = (
    oldData: GQLGetClientNutritionPlansQuery,
    variables: { id: string },
    isSharing: boolean,
  ): GQLGetClientNutritionPlansQuery => {
    return {
      ...oldData,
      getClientNutritionPlans:
        oldData.getClientNutritionPlans?.map((plan) =>
          plan.id === variables.id
            ? { ...plan, isSharedWithClient: isSharing }
            : plan,
        ) || [],
    }
  }

  const { optimisticMutate: sharePlanOptimistic } = useOptimisticMutation({
    queryKey,
    mutationFn: sharePlanMutation.mutateAsync,
    updateFn: (oldData, variables) =>
      togglePlanSharingInCache(
        oldData as GQLGetClientNutritionPlansQuery,
        variables,
        true,
      ),
    onError: (error: Error) => {
      console.error('Failed to share nutrition plan:', error)
    },
  })

  const { optimisticMutate: unsharePlanOptimistic } = useOptimisticMutation({
    queryKey,
    mutationFn: unsharePlanMutation.mutateAsync,
    updateFn: (oldData, variables) =>
      togglePlanSharingInCache(
        oldData as GQLGetClientNutritionPlansQuery,
        variables,
        false,
      ),
    onError: (error: Error) => {
      console.error('Failed to unshare nutrition plan:', error)
    },
  })

  // Delete optimistic update function
  const removePlanFromCache = (
    oldData: GQLGetClientNutritionPlansQuery,
    variables: { id: string },
  ): GQLGetClientNutritionPlansQuery => {
    return {
      ...oldData,
      getClientNutritionPlans:
        oldData.getClientNutritionPlans?.filter(
          (plan) => plan.id !== variables.id,
        ) || [],
    }
  }

  const { optimisticMutate: deletePlanOptimistic } = useOptimisticMutation({
    queryKey,
    mutationFn: deletePlanMutation.mutateAsync,
    updateFn: removePlanFromCache,
    onError: (error: Error) => {
      console.error('Failed to delete nutrition plan:', error)
    },
  })

  const handleCreatePlan = () => {
    const planName = `Nutrition Plan ${new Date().toLocaleDateString()}`
    setIsCreating(true)

    createPlanOptimistic({
      input: {
        name: planName,
        description: null,
        clientId,
      },
    })
  }

  const handleToggleSharing = (planId: string, isShared: boolean) => {
    // Don't allow actions on pending plans
    if (planId.startsWith('temp-')) return

    if (isShared) {
      unsharePlanOptimistic({ id: planId })
    } else {
      sharePlanOptimistic({ id: planId })
    }
  }

  const handleDeletePlan = (planId: string) => {
    // Don't allow delete on pending plans
    if (planId.startsWith('temp-')) return

    setDeleteConfirmId(planId)
  }

  const confirmDeletePlan = () => {
    if (deleteConfirmId) {
      deletePlanOptimistic({ id: deleteConfirmId })
      setDeleteConfirmId(null)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nutrition Plans</CardTitle>
          <CardDescription>Meal plans for your client</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nutrition Plans</CardTitle>
          <CardDescription>Meal plans for your client</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive">Failed to load nutrition plans</p>
            <p className="text-sm text-muted-foreground mt-1">
              {error instanceof Error
                ? error.message
                : 'Unknown error occurred'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const nutritionPlans = data?.getClientNutritionPlans || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Nutrition Plans</h3>
          <p className="text-sm text-muted-foreground">
            Meal plans for your client
          </p>
        </div>
        <div className="flex gap-2">
          <ImportPlanCombobox clientId={clientId} />
          <Button
            onClick={handleCreatePlan}
            disabled={isCreating || isLoading}
            size="sm"
          >
            Create New Plan
          </Button>
        </div>
      </div>

      {nutritionPlans.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">No nutrition plans yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first nutrition plan for this client
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 @xl/client-detail-page:grid-cols-2">
          {nutritionPlans.map((plan) => (
            <NutritionPlanCard
              key={plan.id}
              plan={plan}
              onToggleSharing={handleToggleSharing}
              onDelete={handleDeletePlan}
            />
          ))}
        </div>
      )}

      <ConfirmationModal
        open={deleteConfirmId !== null}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
        onConfirm={confirmDeletePlan}
        title="Delete nutrition plan"
        description="Are you sure you want to delete this nutrition plan? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  )
}
