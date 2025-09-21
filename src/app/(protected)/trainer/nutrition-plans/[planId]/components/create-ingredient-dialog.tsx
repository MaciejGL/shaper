'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
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
import {
  type GQLIngredient,
  useCreateIngredientMutation,
} from '@/generated/graphql-client'

const createIngredientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  proteinPer100g: z
    .number()
    .min(0, 'Protein must be positive')
    .max(100, 'Invalid protein value'),
  carbsPer100g: z
    .number()
    .min(0, 'Carbs must be positive')
    .max(100, 'Invalid carbs value'),
  fatPer100g: z
    .number()
    .min(0, 'Fat must be positive')
    .max(100, 'Invalid fat value'),
  caloriesPer100g: z
    .number()
    .min(0, 'Calories must be positive')
    .max(1000, 'Invalid calories value'),
})

type CreateIngredientForm = z.infer<typeof createIngredientSchema>

interface CreateIngredientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onIngredientCreated: (ingredient: GQLIngredient) => void
}

export function CreateIngredientDialog({
  open,
  onOpenChange,
  onIngredientCreated,
}: CreateIngredientDialogProps) {
  const createIngredientMutation = useCreateIngredientMutation()

  const form = useForm<CreateIngredientForm>({
    resolver: zodResolver(createIngredientSchema),
    defaultValues: {
      name: '',
      proteinPer100g: 0,
      carbsPer100g: 0,
      fatPer100g: 0,
      caloriesPer100g: 0,
    },
  })

  const onSubmit = async (values: CreateIngredientForm) => {
    try {
      const result = await createIngredientMutation.mutateAsync({
        input: values,
      })

      form.reset()
      onIngredientCreated(result.createIngredient as GQLIngredient)
    } catch (error) {
      console.error('Failed to create ingredient:', error)
    }
  }

  const handleClose = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" dialogTitle="Create New Ingredient">
        <DialogHeader>
          <DialogTitle>Create New Ingredient</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ingredient Name</FormLabel>
                  <FormControl>
                    <Input
                      id="ingredient-name"
                      placeholder="e.g., Chicken Breast"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="caloriesPer100g"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calories (per 100g)</FormLabel>
                    <FormControl>
                      <Input
                        id="calories-per-100g"
                        type="number"
                        step="0.1"
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
                name="proteinPer100g"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Protein (g)</FormLabel>
                    <FormControl>
                      <Input
                        id="protein-per-100g"
                        type="number"
                        step="0.1"
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
                name="carbsPer100g"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carbs (g)</FormLabel>
                    <FormControl>
                      <Input
                        id="carbs-per-100g"
                        type="number"
                        step="0.1"
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
                name="fatPer100g"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fat (g)</FormLabel>
                    <FormControl>
                      <Input
                        id="fat-per-100g"
                        type="number"
                        step="0.1"
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
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createIngredientMutation.isPending}
              >
                {createIngredientMutation.isPending
                  ? 'Creating...'
                  : 'Create Ingredient'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
