'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  type GQLIngredient,
  useAddIngredientToMealMutation,
  useAddMealToNutritionPlanDayMutation,
  useCreateMealMutation,
  useGetNutritionPlanQuery,
} from '@/generated/graphql-client'

import { BasicMealInfoSection } from './basic-meal-info-section'
import { IngredientsSection } from './ingredients-section'
import { InstructionsSection } from './instructions-section'

// Simple Total Macros Display Component
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

const createCustomMealSchema = z.object({
  name: z.string().min(1, 'Meal name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  instructions: z.array(z.string()),
  servings: z.number().min(0).optional(),
  ingredients: z.array(ingredientSchema).optional(),
})

export type CreateCustomMealForm = z.infer<typeof createCustomMealSchema>

interface CreateCustomMealDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dayId: string
  nutritionPlanId: string
  onMealCreated?: () => void
}

export function CreateCustomMealDrawer({
  open,
  onOpenChange,
  dayId,
  nutritionPlanId,
  onMealCreated,
}: CreateCustomMealDrawerProps) {
  const [isCreating, setIsCreating] = useState(false)
  const queryClient = useQueryClient()

  const createMealMutation = useCreateMealMutation()
  const addMealToDayMutation = useAddMealToNutritionPlanDayMutation()
  const addIngredientMutation = useAddIngredientToMealMutation()

  const form = useForm<CreateCustomMealForm>({
    resolver: zodResolver(createCustomMealSchema),
    defaultValues: {
      name: '',
      description: '',
      instructions: [''],
      servings: 1,
      ingredients: [],
    },
  })

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control: form.control,
    name: 'ingredients',
  })

  const onSubmit = async (values: CreateCustomMealForm) => {
    setIsCreating(true)
    try {
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

      // Add ingredients to the meal if any were selected
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

      // Add the meal to the nutrition plan day
      await addMealToDayMutation.mutateAsync({
        input: {
          dayId,
          mealId: mealResult.createMeal.id,
          portionMultiplier: 1.0,
        },
      })

      // Invalidate the nutrition plan query to refresh the UI
      const queryKey = useGetNutritionPlanQuery.getKey({ id: nutritionPlanId })
      queryClient.invalidateQueries({ queryKey })

      toast.success('Custom meal created and added to day!')
      form.reset()
      onMealCreated?.()
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to create meal: ' + (error as Error).message)
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    form.reset({
      name: '',
      description: '',
      instructions: [''],
      servings: 1,
      ingredients: [],
    })
    onOpenChange(false)
  }

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: '',
        description: '',
        instructions: [''],
        servings: 1,
        ingredients: [],
      })
    }
  }, [open, form])

  const handleIngredientAdded = (
    ingredient: GQLIngredient,
    grams: number = 100,
  ) => {
    const existingIngredients = form.getValues('ingredients') || []
    const existingIndex = existingIngredients.findIndex(
      (field) => field.id === ingredient.id,
    )

    if (existingIndex >= 0) {
      form.setValue(`ingredients.${existingIndex}.grams`, grams)
    } else {
      appendIngredient({
        id: ingredient.id,
        name: ingredient.name,
        grams,
        caloriesPer100g: ingredient.caloriesPer100g,
        proteinPer100g: ingredient.proteinPer100g,
        carbsPer100g: ingredient.carbsPer100g,
        fatPer100g: ingredient.fatPer100g,
      })
    }
  }

  const handleIngredientRemoved = (index: number) => {
    removeIngredient(index)
    toast.info('Ingredient removed')
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="min-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create Custom Meal</SheetTitle>
        </SheetHeader>

        <div className="p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <BasicMealInfoSection control={form.control} />

              <InstructionsSection
                control={form.control}
                setValue={form.setValue}
              />

              <TotalMacrosDisplay ingredientFields={ingredientFields} />

              <IngredientsSection
                control={form.control}
                ingredientFields={ingredientFields}
                onIngredientAdded={handleIngredientAdded}
                onIngredientRemoved={handleIngredientRemoved}
              />

              {/* Footer */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Meal'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
