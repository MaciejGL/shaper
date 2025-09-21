'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
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
  name: z
    .string()
    .min(1, 'Ingredient name is required')
    .max(100, 'Name too long'),
  proteinPer100g: z.number().min(0, 'Protein must be 0 or greater'),
  carbsPer100g: z.number().min(0, 'Carbs must be 0 or greater'),
  fatPer100g: z.number().min(0, 'Fat must be 0 or greater'),
  caloriesPer100g: z.number().min(0, 'Calories must be 0 or greater'),
})

type CreateIngredientForm = z.infer<typeof createIngredientSchema>

interface InlineIngredientFormProps {
  show: boolean
  defaultName?: string
  onIngredientCreated: (ingredient: GQLIngredient) => void
  onCancel: () => void
}

export function InlineIngredientForm({
  show,
  defaultName,
  onIngredientCreated,
  onCancel,
}: InlineIngredientFormProps) {
  const createIngredientMutation = useCreateIngredientMutation()

  const form = useForm<CreateIngredientForm>({
    resolver: zodResolver(createIngredientSchema),
    defaultValues: {
      name: defaultName || '',
      proteinPer100g: 0,
      carbsPer100g: 0,
      fatPer100g: 0,
      caloriesPer100g: 0,
    },
  })

  const handleSaveIngredient = async (values: CreateIngredientForm) => {
    try {
      const result = await createIngredientMutation.mutateAsync({
        input: values,
      })

      onIngredientCreated(result.createIngredient as GQLIngredient)
      form.reset()
      toast.success('Ingredient created and added!')
    } catch (error) {
      toast.error('Failed to create ingredient: ' + (error as Error).message)
    }
  }

  const handleCancel = () => {
    form.reset()
    onCancel()
  }

  if (!show) return null

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Create New Ingredient</h4>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSaveIngredient)}
          className="space-y-4"
        >
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

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="caloriesPer100g"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calories/100g</FormLabel>
                  <FormControl>
                    <Input
                      id="ingredient-calories"
                      type="number"
                      min="0"
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
                  <FormLabel>Protein/100g</FormLabel>
                  <FormControl>
                    <Input
                      id="ingredient-protein"
                      type="number"
                      min="0"
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
                  <FormLabel>Carbs/100g</FormLabel>
                  <FormControl>
                    <Input
                      id="ingredient-carbs"
                      type="number"
                      min="0"
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
                  <FormLabel>Fat/100g</FormLabel>
                  <FormControl>
                    <Input
                      id="ingredient-fat"
                      type="number"
                      min="0"
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

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createIngredientMutation.isPending}
            >
              {createIngredientMutation.isPending ? 'Creating...' : 'Save'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
