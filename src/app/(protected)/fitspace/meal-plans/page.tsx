'use client'

import { ChefHat } from 'lucide-react'
import { useState } from 'react'

import { useFitspaceMealPlansOverviewQuery } from '@/generated/graphql-client'

import { DashboardHeader } from '../../trainer/components/dashboard-header'

import { MealPlanActionDialog } from './components/meal-plan-action-dialog'
import { MealPlanCard } from './components/meal-plan-card'
import { MealPlanDrawer } from './components/meal-plan-drawer'
import { useMealPlanAction } from './hooks/use-meal-plan-action'
import { ActiveMealPlan, AvailableMealPlan } from './types'

export default function MealPlansOverviewPage() {
  const [selectedPlan, setSelectedPlan] = useState<
    ActiveMealPlan | AvailableMealPlan | null
  >(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const {
    dialogState,
    handleMealPlanAction,
    handleConfirmAction,
    handleCloseDialog,
    isActivating,
    isDeactivating,
    isDeleting,
  } = useMealPlanAction()

  const { data, isLoading } = useFitspaceMealPlansOverviewQuery()

  // Combine active and available plans
  const allPlans = [
    ...(data?.getMyMealPlansOverview?.activePlan
      ? [data.getMyMealPlansOverview.activePlan]
      : []),
    ...(data?.getMyMealPlansOverview?.availablePlans ?? []),
  ]

  const handleCardClick = (plan: ActiveMealPlan | AvailableMealPlan) => {
    setSelectedPlan(plan)
    setDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setSelectedPlan(null)
  }

  // Find the current plan from fresh data to avoid stale state
  const currentPlan = selectedPlan
    ? allPlans.find((plan) => plan.id === selectedPlan.id)
    : null

  return (
    <div className="container-fitspace mx-auto mb-24">
      <DashboardHeader title="Meal Plans" icon={<ChefHat />} />

      {/* Meal Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allPlans.map((plan) => (
          <MealPlanCard
            key={plan.id}
            plan={plan}
            isActive={plan.active}
            onClick={() => handleCardClick(plan)}
            onAction={handleMealPlanAction}
            loading={isLoading}
          />
        ))}
      </div>

      {/* Empty State */}
      {!isLoading && allPlans.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <ChefHat className="size-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Meal Plans</h3>
          <p className="text-muted-foreground">
            You don't have any meal plans yet. Contact your trainer to get
            started.
          </p>
        </div>
      )}

      {/* Meal Plan Details Drawer */}
      <MealPlanDrawer
        plan={currentPlan}
        open={drawerOpen}
        onClose={handleCloseDrawer}
        onAction={handleMealPlanAction}
        isLoading={isActivating || isDeactivating || isDeleting}
      />

      {/* Action Dialog */}
      <MealPlanActionDialog
        isOpen={dialogState.isOpen}
        onClose={handleCloseDialog}
        action={dialogState.action}
        plan={dialogState.plan}
        onConfirm={handleConfirmAction}
        isLoading={isActivating || isDeactivating || isDeleting}
      />
    </div>
  )
}
