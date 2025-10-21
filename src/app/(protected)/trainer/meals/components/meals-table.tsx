'use client'

import { Archive, Copy, Edit, Eye, MoreVertical, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { GQLGetMealsForLibraryQuery } from '@/generated/graphql-client'
import { useCookingUnits } from '@/lib/cooking-units'

import { ArchiveMealDialog } from './archive-meal-dialog'
import { DeleteMealDialog } from './delete-meal-dialog'
import { DuplicateMealDialog } from './duplicate-meal-dialog'
import { MealFormDrawer } from './meal-form-drawer'
import { ViewMealDrawer } from './view-meal-drawer'

type Meal = NonNullable<GQLGetMealsForLibraryQuery['teamMeals']>[number]

interface MealsTableProps {
  meals: Meal[]
}

function IngredientsTooltip({ meal }: { meal: Meal }) {
  const { formatIngredient } = useCookingUnits()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-sm text-muted-foreground cursor-pointer">
            {meal.ingredients.length}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            {meal.ingredients
              .sort((a, b) => a.order - b.order)
              .map((ingredientItem) => (
                <div
                  key={ingredientItem.id}
                  className="flex items-center gap-1 py-1"
                >
                  <span className="text-xs font-medium">
                    {ingredientItem.ingredient.name}
                  </span>
                  <span className="flex-1 border-b border-dotted border-border self-end mx-1 mb-1 h-0" />
                  <span className="text-xs text-muted-foreground">
                    {formatIngredient(
                      ingredientItem.grams,
                      ingredientItem.ingredient.name,
                    )}
                  </span>
                </div>
              ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function MealRowActions({ meal }: { meal: Meal }) {
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false)

  const isInUse = meal.usageCount > 0
  const isArchived = meal.archived

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon-sm" variant="ghost" iconOnly={<MoreVertical />} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsViewDrawerOpen(true)}>
            <Eye className="size-4" />
            View
          </DropdownMenuItem>

          {!isInUse && !isArchived && (
            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="size-4" />
              Edit
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={() => setIsDuplicateDialogOpen(true)}>
            <Copy className="size-4" />
            Duplicate
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setIsArchiveDialogOpen(true)}>
            <Archive className="size-4" />
            {isArchived ? 'Unarchive' : 'Archive'}
          </DropdownMenuItem>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={isInUse}
                  className="text-destructive"
                >
                  <Trash2 className="size-4" />
                  Delete
                </DropdownMenuItem>
              </TooltipTrigger>
              {isInUse && (
                <TooltipContent>
                  Cannot delete meal used in {meal.usageCount} plan
                  {meal.usageCount > 1 ? 's' : ''}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </DropdownMenuContent>
      </DropdownMenu>

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

export function MealsTable({ meals }: MealsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-center">Ingredients</TableHead>
            <TableHead className="text-right">Calories</TableHead>
            <TableHead className="text-right">Protein</TableHead>
            <TableHead className="text-right">Carbs</TableHead>
            <TableHead className="text-right">Fat</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meals.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No meals found.
              </TableCell>
            </TableRow>
          ) : (
            meals.map((meal) => (
              <TableRow key={meal.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col gap-1">
                    <span>{meal.name}</span>
                    {meal.description && (
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {meal.description}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <IngredientsTooltip meal={meal} />
                </TableCell>
                <TableCell className="text-right">
                  {Math.round(meal.totalMacros.calories)}
                </TableCell>
                <TableCell className="text-right">
                  {Math.round(meal.totalMacros.protein)}g
                </TableCell>
                <TableCell className="text-right">
                  {Math.round(meal.totalMacros.carbs)}g
                </TableCell>
                <TableCell className="text-right">
                  {Math.round(meal.totalMacros.fat)}g
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    {meal.archived && (
                      <Badge variant="secondary" className="text-xs">
                        Archived
                      </Badge>
                    )}
                    {meal.usageCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Used in {meal.usageCount}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <MealRowActions meal={meal} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
