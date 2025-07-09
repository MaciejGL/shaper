'use client'

import { useQueryClient } from '@tanstack/react-query'
import { PlusCircle, UtensilsIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
  useCreateDraftMealTemplateMutation,
  useGetCollaborationMealPlanTemplatesQuery,
  useGetMealPlanTemplatesQuery,
} from '@/generated/graphql-client'

import { DashboardHeader } from '../components/dashboard-header'

import { MealPlansList } from './components/meal-plans-list'

export default function MealPlansPage() {
  const { data, isLoading } = useGetMealPlanTemplatesQuery()
  const { data: collaborationData, isLoading: isLoadingCollaboration } =
    useGetCollaborationMealPlanTemplatesQuery()

  const queryClient = useQueryClient()

  const router = useRouter()

  const {
    mutate: createDraftMealTemplate,
    isPending: isCreatingDraftMealTemplate,
  } = useCreateDraftMealTemplateMutation({
    onSuccess: (data) => {
      const newPlan = data.createDraftMealTemplate

      queryClient.invalidateQueries({ queryKey: ['GetMealPlanTemplates'] })

      router.push(`/trainer/meal-plans/creator/${newPlan.id}`)
    },
    onError: (error) => {
      console.error('❌ Failed to create draft meal template:', error)
    },
  })

  return (
    <div className="container h-full">
      <div className="flex items-baseline justify-between">
        <DashboardHeader
          title="Meal Plans"
          description="Manage your meal plans and nutrition templates"
          icon={<UtensilsIcon />}
        />
        <Button
          onClick={() => createDraftMealTemplate({})}
          loading={isCreatingDraftMealTemplate}
          iconStart={<PlusCircle />}
          className="self-baseline"
        >
          Create New Plan
        </Button>
      </div>

      <MealPlansList
        plans={data?.getMealPlanTemplates || []}
        collaborationPlans={
          collaborationData?.getCollaborationMealPlanTemplates || []
        }
        isLoading={isLoading || isLoadingCollaboration}
      />
    </div>
  )
}
