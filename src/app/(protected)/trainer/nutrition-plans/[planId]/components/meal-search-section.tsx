'use client'

import { Plus } from 'lucide-react'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'

import { CreateCustomMealDrawer } from './create-custom-meal-dialog'
import { MealSearchCombobox } from './meal-search-combobox'

interface MealSearchSectionProps {
  dayId: string
  nutritionPlanId: string
}

export function MealSearchSection({
  dayId,
  nutritionPlanId,
}: MealSearchSectionProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const handleCreateCustomMeal = () => {
    setShowCreateDialog(true)
  }

  const handleCustomMealCreated = () => {
    // Query invalidation is now handled in the CreateCustomMealDialog component
    console.info('Custom meal created for day:', dayId)
  }

  return (
    <div className="space-y-4">
      {/* Recipe Search & Actions */}
      <div className="grid grid-cols-[1fr_auto] gap-4">
        <MealSearchCombobox
          dayId={dayId}
          nutritionPlanId={nutritionPlanId}
          placeholder="Search recipes by name, ingredient, or cuisine..."
        />

        <Button
          onClick={handleCreateCustomMeal}
          className="w-full justify-start"
          variant="secondary"
          iconStart={<Plus />}
        >
          Create New Recipe
        </Button>
      </div>

      <CreateCustomMealDrawer
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        dayId={dayId}
        nutritionPlanId={nutritionPlanId}
        onMealCreated={handleCustomMealCreated}
      />
    </div>
  )
}
