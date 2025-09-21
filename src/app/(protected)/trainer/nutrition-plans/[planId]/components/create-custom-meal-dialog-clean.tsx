'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
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
  useAddIngredientToMealMutation,
  useAddMealToNutritionPlanDayMutation,
  useCreateMealMutation,
  useGetNutritionPlanQuery,
} from '@/generated/graphql-client'

import { BasicMealInfoSection } from './basic-meal-info-section'
import { IngredientsSection } from './ingredients-section'
import { InstructionsSection } from './instructions-section'

const ingredientSchema = z.object({
  id: z.string(),
  name: z.string(),
  grams: z.number().min(1, 'Amount must be at least 1g'),
})

const createCustomMealSchema = z.object({
  name: z.string().min(1, 'Meal name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  instructions: z.array(z.string()),
  preparationTime: z.number().min(0).optional(),
  cookingTime: z.number().min(0).optional(),
  servings: z.number().min(1).optional(),
  ingredients: z.array(ingredientSchema).optional(),
})

type CreateCustomMealForm = z.infer<typeof createCustomMealSchema>

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
      preparationTime: 15,
      cookingTime: 30,
      servings: 1,
      ingredients: [],
    },
  })

  const { append: appendIngredient, remove: removeIngredient } = useFieldArray({
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
          preparationTime: values.preparationTime,
          cookingTime: values.cookingTime,
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
      preparationTime: 15,
      cookingTime: 30,
      servings: 1,
      ingredients: [],
    })
    onOpenChange(false)
  }

  const handleIngredientAdded = (ingredient: any, grams: number = 100) => {
    const existingIngredients = form.getValues('ingredients') || []
    const existingIndex = existingIngredients.findIndex(
      (field: any) => field.id === ingredient.id,
    )

    if (existingIndex >= 0) {
      // Update existing ingredient
      form.setValue(`ingredients.${existingIndex}.grams`, grams)
      toast.info('Ingredient amount updated')
    } else {
      // Add new ingredient
      appendIngredient({
        id: ingredient.id,
        name: ingredient.name,
        grams,
      })
      toast.success('Ingredient added')
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

              <InstructionsSection control={form.control} />

              <IngredientsSection
                control={form.control}
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
