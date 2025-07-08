import { useCallback, useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
} from '@/components/ui/drawer'
import {
  EditableFood,
  useMealPlanContext,
} from '@/context/meal-plan-context/meal-plan-context'

import { AddedFoods } from './added-foods'
import FoodSearch from './food-search'
import { BigMacroBadge } from './macro-badge'
import { formatHour, getMealNutrients } from './utils'

export function AddFoodDrawer({
  selectedHour,
  dayId,
  handleCloseSheet,
}: {
  selectedHour: number
  dayId: string
  handleCloseSheet: () => void
}) {
  const { getMealByHour, saveMeal } = useMealPlanContext()
  const [foods, setFoods] = useState<EditableFood[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const meal = getMealByHour(dayId, selectedHour)

  const mealNutrients = useMemo(
    () => getMealNutrients(meal?.foods || []),
    [meal],
  )

  // Remove food from local state
  const removeFood = useCallback((index: number) => {
    setFoods((prev) => prev.filter((_, i) => i !== index))
    setHasChanges(true)
  }, [])

  // Save changes
  const handleSave = useCallback(async () => {
    if (!hasChanges) {
      handleCloseSheet()
      return
    }

    setIsSaving(true)
    try {
      await saveMeal(dayId, selectedHour, foods)
      setHasChanges(false)
      handleCloseSheet()
    } catch (error) {
      console.error('Error saving meal:', error)
      // Error is handled in the context
    } finally {
      setIsSaving(false)
    }
  }, [hasChanges, saveMeal, dayId, selectedHour, foods, handleCloseSheet])

  // Cancel changes
  const handleCancel = useCallback(() => {
    if (hasChanges) {
      if (
        window.confirm(
          'You have unsaved changes. Are you sure you want to close?',
        )
      ) {
        handleCloseSheet()
      }
    } else {
      handleCloseSheet()
    }
  }, [hasChanges, handleCloseSheet])

  return (
    <Drawer
      open={selectedHour !== null}
      onOpenChange={handleCloseSheet}
      direction="right"
    >
      <DrawerContent dialogTitle="Edit Meal" className="w-full sm:!max-w-lg">
        <DrawerHeader>
          <DrawerDescription>
            <Badge variant="secondary" size="lg">
              {selectedHour !== null ? formatHour(selectedHour) : ''}
            </Badge>
          </DrawerDescription>
          <div className="grid grid-cols-4 gap-2">
            <BigMacroBadge
              macro="calories"
              value={mealNutrients.kcal}
              className="w-full"
            />
            <BigMacroBadge
              macro="protein"
              value={mealNutrients.protein}
              className="w-full"
            />
            <BigMacroBadge
              macro="carbs"
              value={mealNutrients.carbs}
              className="w-full"
            />
            <BigMacroBadge
              macro="fat"
              value={mealNutrients.fat}
              className="w-full"
            />
          </div>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto p-4">
          {selectedHour !== null && (
            <FoodSearch
              dayId={dayId}
              hour={selectedHour}
              onClose={handleCloseSheet}
              foods={foods}
              setFoods={setFoods}
              setHasChanges={setHasChanges}
            />
          )}

          {/* Added Foods */}
          {foods.length > 0 && (
            <AddedFoods
              foods={foods}
              removeFood={removeFood}
              setHasChanges={setHasChanges}
              setFoods={setFoods}
            />
          )}

          {foods.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              Search for foods to add to this meal
            </div>
          )}
        </div>

        <div className="p-4 sticky bottom-0 bg-background">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {hasChanges ? 'Unsaved changes' : 'No changes'}
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                loading={isSaving}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
