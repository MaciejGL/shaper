'use client'

import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { GQLGetMealsForLibraryQuery } from '@/generated/graphql-client'
import { useCookingUnits } from '@/lib/cooking-units'

import { ArchiveMealDialog } from './archive-meal-dialog'
import { DeleteMealDialog } from './delete-meal-dialog'
import { DuplicateMealDialog } from './duplicate-meal-dialog'
import { MealCardActions } from './meal-card-actions'
import { MealFormDrawer } from './meal-form-drawer'
import { ViewMealDrawer } from './view-meal-drawer'

type Meal = NonNullable<GQLGetMealsForLibraryQuery['teamMeals']>[number]

interface MealCardProps {
  meal: Meal
}

export function MealCard({ meal }: MealCardProps) {
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  const { formatIngredient } = useCookingUnits()

  const isInUse = meal.usageCount > 0

  return (
    <>
      <Card className="relative gap-2">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="break-words pr-2">{meal.name}</CardTitle>
            <MealCardActions
              meal={meal}
              onView={() => setIsViewDrawerOpen(true)}
              onEdit={() => setIsEditDialogOpen(true)}
              onDelete={() => setIsDeleteDialogOpen(true)}
              onDuplicate={() => setIsDuplicateDialogOpen(true)}
              onArchive={() => setIsArchiveDialogOpen(true)}
              onUnarchive={() => setIsArchiveDialogOpen(true)}
            />
          </div>
          {isInUse && (
            <div className="flex justify-end">
              <Badge variant="secondary" className="text-xs">
                Used in {meal.usageCount} plan{meal.usageCount > 1 ? 's' : ''}
              </Badge>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-3 flex flex-col">
          {/* Description */}
          {meal.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {meal.description}
            </p>
          )}

          {/* Macros */}
          <div>
            <div className="grid grid-cols-4 mt-2">
              <div className="text-center p-2 border-r border-border/50">
                <div className="text-sm font-semibold text-primary">
                  {Math.round(meal.totalMacros?.calories || 0)}
                </div>
                <div className="text-xs text-muted-foreground">calories</div>
              </div>
              <div className="text-center p-2 border-r border-border/50">
                <div className="text-sm font-semibold text-green-600">
                  {Math.round(meal.totalMacros?.protein || 0)}g
                </div>
                <div className="text-xs text-muted-foreground">protein</div>
              </div>
              <div className="text-center p-2 border-r border-border/50">
                <div className="text-sm font-semibold text-blue-600">
                  {Math.round(meal.totalMacros?.carbs || 0)}g
                </div>
                <div className="text-xs text-muted-foreground">carbs</div>
              </div>
              <div className="text-center p-2">
                <div className="text-sm font-semibold text-yellow-600">
                  {Math.round(meal.totalMacros?.fat || 0)}g
                </div>
                <div className="text-xs text-muted-foreground">fat</div>
              </div>
            </div>
          </div>

          {/* Ingredients List */}
          <div className="grow">
            {meal.ingredients && meal.ingredients.length > 0 ? (
              <div className="space-y-1">
                {meal.ingredients
                  .sort((a, b) => a.order - b.order)
                  .map((ingredientItem) => {
                    // Use override grams if available, otherwise use blueprint grams

                    return (
                      <div
                        key={ingredientItem.id}
                        className="flex items-center gap-1 py-1 text-muted-foreground"
                      >
                        {/* <Dot size={16} className="text-foreground" /> */}

                        <span className="text-sm font-medium">
                          {ingredientItem.ingredient.name}
                        </span>
                        <span className="flex-1 border-b border-dotted border-border self-end mx-1 mb-1 h-0" />
                        <span className="text-sm text-muted-foreground">
                          {formatIngredient(
                            ingredientItem.grams,
                            ingredientItem.ingredient.name,
                          )}
                        </span>
                      </div>
                    )
                  })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No ingredients listed for this meal
              </p>
            )}
          </div>

          {/* Steps Count */}
          {meal.instructions && meal.instructions.length > 0 && (
            <>
              <div>
                <div className="space-y-3">
                  {meal.instructions.map((instruction, index) => (
                    <div key={index} className="flex flex-col">
                      <span className="text-sm font-medium">
                        Step {index + 1}
                      </span>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {instruction}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ViewMealDrawer
        meal={meal}
        open={isViewDrawerOpen}
        onOpenChange={setIsViewDrawerOpen}
      />
      <MealFormDrawer
        mode="edit"
        meal={meal}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
      <ArchiveMealDialog
        meal={meal}
        open={isArchiveDialogOpen}
        onOpenChange={setIsArchiveDialogOpen}
      />
      <DeleteMealDialog
        meal={meal}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
      <DuplicateMealDialog
        meal={meal}
        open={isDuplicateDialogOpen}
        onOpenChange={setIsDuplicateDialogOpen}
      />
    </>
  )
}
