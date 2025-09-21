'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  useAddMealToNutritionPlanDayMutation,
  useCreateMealMutation,
} from '@/generated/graphql-client'

const createCustomMealSchema = z.object({
  name: z.string().min(1, 'Meal name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  instructions: z.array(z.string()),
  preparationTime: z.number().min(0).optional(),
  cookingTime: z.number().min(0).optional(),
  servings: z.number().min(1).optional(),
})

type CreateCustomMealForm = z.infer<typeof createCustomMealSchema>

interface CreateCustomMealDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dayId: string
  onMealCreated?: () => void
}

export function CreateCustomMealDialog({
  open,
  onOpenChange,
  dayId,
  onMealCreated,
}: CreateCustomMealDialogProps) {
  const [isCreating, setIsCreating] = useState(false)

  const createMealMutation = useCreateMealMutation()
  const addMealToDayMutation = useAddMealToNutritionPlanDayMutation()

  const form = useForm<CreateCustomMealForm>({
    resolver: zodResolver(createCustomMealSchema),
    defaultValues: {
      name: '',
      description: '',
      instructions: [''],
      preparationTime: 15,
      cookingTime: 30,
      servings: 1,
    },
  })

  // @ts-ignore - useFieldArray type conflict with string array
  const { fields, append, remove }: any = useFieldArray({
    control: form.control,
    // @ts-ignore
    name: 'instructions',
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

      // Add the meal to the nutrition plan day
      await addMealToDayMutation.mutateAsync({
        input: {
          dayId,
          mealId: mealResult.createMeal.id,
          portionMultiplier: 1.0,
        },
      })

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
    form.reset()
    onOpenChange(false)
  }

  const addInstruction = () => {
    append('' as any)
  }

  const removeInstruction = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        dialogTitle="Create Custom Meal"
      >
        <DialogHeader>
          <DialogTitle>Create Custom Meal</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meal Name</FormLabel>
                    <FormControl>
                      <Input
                        id="meal-name"
                        placeholder="e.g., Grilled Chicken Salad"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        id="meal-description"
                        placeholder="Brief description of the meal..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Timing and Servings */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="preparationTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prep Time (min)</FormLabel>
                    <FormControl>
                      <Input
                        id="prep-time"
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cookingTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cook Time (min)</FormLabel>
                    <FormControl>
                      <Input
                        id="cook-time"
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="servings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Servings</FormLabel>
                    <FormControl>
                      <Input
                        id="servings"
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value) || 1)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Instructions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>Instructions</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addInstruction}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>

              <div className="space-y-2">
                {fields.map((field: any, index: number) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-8">
                      {index + 1}.
                    </span>
                    <FormField
                      control={form.control}
                      name={`instructions.${index}`}
                      render={({ field }: any) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              id={`instruction-${index}`}
                              placeholder="Enter instruction step..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInstruction(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

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
      </DialogContent>
    </Dialog>
  )
}
