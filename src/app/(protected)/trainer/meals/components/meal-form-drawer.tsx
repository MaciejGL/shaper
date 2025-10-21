'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { BasicMealInfoSection } from '@/app/(protected)/trainer/nutrition-plans/[planId]/components/basic-meal-info-section'
import { IngredientsSection } from '@/app/(protected)/trainer/nutrition-plans/[planId]/components/ingredients-section'
import { InstructionsSection } from '@/app/(protected)/trainer/nutrition-plans/[planId]/components/instructions-section'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  type GQLGetMealsForLibraryQuery,
  type GQLIngredient,
  useAddIngredientToMealMutation,
  useCreateMealInLibraryMutation,
  useGetMealsForLibraryQuery,
  useUpdateMealInLibraryMutation,
} from '@/generated/graphql-client'

type Meal = NonNullable<GQLGetMealsForLibraryQuery['teamMeals']>[number]

// Total Macros Display Component
function TotalMacrosDisplay({
  ingredientFields,
}: {
  ingredientFields: {
    id: string
    name: string
    grams: number
    caloriesPer100g: number
    proteinPer100g: number
    carbsPer100g: number
    fatPer100g: number
  }[]
}) {
  if (ingredientFields.length === 0) return null

  const totals = ingredientFields.reduce(
    (acc, ingredient) => {
      const multiplier = ingredient.grams / 100
      return {
        calories: acc.calories + ingredient.caloriesPer100g * multiplier,
        protein: acc.protein + ingredient.proteinPer100g * multiplier,
        carbs: acc.carbs + ingredient.carbsPer100g * multiplier,
        fat: acc.fat + ingredient.fatPer100g * multiplier,
      }
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )

  return (
    <div className="flex gap-2 mb-4">
      <div className="text-sm font-medium text-foreground mr-2">Total:</div>
      <div className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm font-medium">
        {Math.round(totals.calories)} kcal
      </div>
      <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
        {Math.round(totals.protein * 10) / 10}g protein
      </div>
      <div className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
        {Math.round(totals.carbs * 10) / 10}g carbs
      </div>
      <div className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-medium">
        {Math.round(totals.fat * 10) / 10}g fat
      </div>
    </div>
  )
}

const ingredientSchema = z.object({
  id: z.string(),
  name: z.string(),
  grams: z.number().min(1, 'Amount must be at least 1g'),
  caloriesPer100g: z.number(),
  proteinPer100g: z.number(),
  carbsPer100g: z.number(),
  fatPer100g: z.number(),
})

const mealFormSchema = z.object({
  name: z.string().min(1, 'Meal name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  instructions: z.array(z.string()),
  servings: z.number().min(0).optional(),
  ingredients: z.array(ingredientSchema).optional(),
})

export type MealFormData = z.infer<typeof mealFormSchema>

interface MealFormDrawerProps {
  mode: 'create' | 'edit'
  meal?: Meal
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (mealId: string) => void
}

export function MealFormDrawer({
  mode,
  meal,
  open,
  onOpenChange,
  onSuccess,
}: MealFormDrawerProps) {
  const queryClient = useQueryClient()

  const createMealMutation = useCreateMealInLibraryMutation()
  const updateMealMutation = useUpdateMealInLibraryMutation()
  const addIngredientMutation = useAddIngredientToMealMutation()

  const form = useForm<MealFormData>({
    resolver: zodResolver(mealFormSchema),
    defaultValues: {
      name: meal?.name || '',
      description: meal?.description || '',
      instructions: meal?.instructions.length ? meal.instructions : [''],
      servings: meal?.servings || 1,
      ingredients: meal
        ? meal.ingredients.map((ing) => ({
            id: ing.ingredient.id,
            name: ing.ingredient.name,
            grams: ing.grams,
            caloriesPer100g: ing.ingredient.caloriesPer100g,
            proteinPer100g: ing.ingredient.proteinPer100g,
            carbsPer100g: ing.ingredient.carbsPer100g,
            fatPer100g: ing.ingredient.fatPer100g,
          }))
        : [],
    },
  })

  // Reset form when mode/meal changes
  useEffect(() => {
    if (open) {
      form.reset({
        name: meal?.name || '',
        description: meal?.description || '',
        instructions: meal?.instructions.length ? meal.instructions : [''],
        servings: meal?.servings || 1,
        ingredients: meal
          ? meal.ingredients.map((ing) => ({
              id: ing.ingredient.id,
              name: ing.ingredient.name,
              grams: ing.grams,
              caloriesPer100g: ing.ingredient.caloriesPer100g,
              proteinPer100g: ing.ingredient.proteinPer100g,
              carbsPer100g: ing.ingredient.carbsPer100g,
              fatPer100g: ing.ingredient.fatPer100g,
            }))
          : [],
      })
    }
  }, [meal, open, form, mode])

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control: form.control,
    name: 'ingredients',
  })

  const onSubmit = async (values: MealFormData) => {
    try {
      if (mode === 'create') {
        // Create the meal first
        const mealResult = await createMealMutation.mutateAsync({
          input: {
            name: values.name,
            description: values.description || undefined,
            instructions: values.instructions.filter(
              (inst: string) => inst.trim() !== '',
            ),
            servings: values.servings,
          },
        })

        // Add ingredients to the meal
        if (values.ingredients && values.ingredients.length > 0) {
          for (const ingredient of values.ingredients) {
            await addIngredientMutation.mutateAsync({
              input: {
                mealId: mealResult.createMeal.id,
                ingredientId: ingredient.id,
                grams: ingredient.grams,
              },
            })
          }
        }

        toast.success('Meal created successfully!')
        queryClient.invalidateQueries({
          queryKey: useGetMealsForLibraryQuery.getKey({}),
        })

        if (onSuccess) {
          onSuccess(mealResult.createMeal.id)
        }
      } else {
        // Update mode
        if (!meal) return

        await updateMealMutation.mutateAsync({
          id: meal.id,
          input: {
            name: values.name,
            description: values.description || undefined,
            instructions: values.instructions.filter(
              (inst: string) => inst.trim() !== '',
            ),
            servings: values.servings,
          },
        })

        toast.success('Meal updated successfully!')
        queryClient.invalidateQueries({
          queryKey: useGetMealsForLibraryQuery.getKey({}),
        })

        if (onSuccess) {
          onSuccess(meal.id)
        }
      }

      onOpenChange(false)
      form.reset()
    } catch (error) {
      toast.error(
        `Failed to ${mode === 'create' ? 'create' : 'update'} meal: ` +
          (error as Error).message,
      )
    }
  }

  const handleIngredientAdded = (ingredient: GQLIngredient, grams?: number) => {
    appendIngredient({
      id: ingredient.id,
      name: ingredient.name,
      grams: grams || 100,
      caloriesPer100g: ingredient.caloriesPer100g,
      proteinPer100g: ingredient.proteinPer100g,
      carbsPer100g: ingredient.carbsPer100g,
      fatPer100g: ingredient.fatPer100g,
    })
  }

  const handleIngredientRemoved = (index: number) => {
    removeIngredient(index)
  }

  const isPending =
    createMealMutation.isPending ||
    updateMealMutation.isPending ||
    addIngredientMutation.isPending

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {mode === 'create' ? 'Create New Meal' : `Edit ${meal?.name}`}
          </SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-6 p-4"
          >
            {/* Basic Info */}
            <BasicMealInfoSection control={form.control} />

            {/* Ingredients */}
            <IngredientsSection
              control={form.control}
              ingredientFields={ingredientFields}
              onIngredientAdded={handleIngredientAdded}
              onIngredientRemoved={handleIngredientRemoved}
            />

            {/* Total Macros */}
            <TotalMacrosDisplay ingredientFields={ingredientFields} />

            {/* Instructions */}
            <InstructionsSection
              control={form.control}
              setValue={form.setValue}
            />

            {/* Actions */}
            <div className="flex gap-2 justify-end sticky bottom-0 bg-background py-4 border-t">
              <Button
                type="button"
                variant="tertiary"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isPending} disabled={isPending}>
                {mode === 'create' ? 'Create Meal' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
