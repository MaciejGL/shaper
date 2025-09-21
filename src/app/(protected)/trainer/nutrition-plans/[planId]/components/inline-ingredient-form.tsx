'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Calculator, CheckCircle, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
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
import { formatDecimalInput, formatNumberSmart } from '@/lib/format-tempo'

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

interface GraphQLError {
  message: string
  locations?: { line: number; column: number }[]
  path?: string[]
}

interface GraphQLErrorResponse {
  message?: string
  graphQLErrors?: GraphQLError[]
}

function calculateExpectedCalories(
  protein: number,
  carbs: number,
  fat: number,
): number {
  return Math.round((protein * 4 + carbs * 4 + fat * 9) * 10) / 10
}

function isCaloriesValid(entered: number, calculated: number): boolean {
  if (calculated === 0) return entered >= 0
  const tolerance = 0.4
  const diff = Math.abs(entered - calculated) / calculated
  return diff <= tolerance
}

function extractErrorMessage(
  error: GraphQLErrorResponse | Error | string | unknown,
): string {
  if (typeof error === 'string') {
    return error
  }

  if (error instanceof Error) {
    return error.message
  }

  const graphqlError = error as GraphQLErrorResponse
  if (graphqlError?.message) {
    return graphqlError.message
  }

  if (graphqlError?.graphQLErrors?.[0]?.message) {
    return graphqlError.graphQLErrors[0].message
  }

  return 'An unexpected error occurred'
}

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
  const [isLoadingAI, setIsLoadingAI] = useState(false)

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

  const [inputValues, setInputValues] = useState({
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  })

  const [focusedFields, setFocusedFields] = useState({
    calories: false,
    protein: false,
    carbs: false,
    fat: false,
  })

  const watchedValues = form.watch([
    'proteinPer100g',
    'carbsPer100g',
    'fatPer100g',
    'caloriesPer100g',
  ])
  const [protein, carbs, fat, enteredCalories] = watchedValues

  const expectedCalories = useMemo(() => {
    return calculateExpectedCalories(protein || 0, carbs || 0, fat || 0)
  }, [protein, carbs, fat])

  const isCaloriesValidForForm = useMemo(() => {
    if (!enteredCalories || enteredCalories === 0) return true
    return isCaloriesValid(enteredCalories, expectedCalories)
  }, [enteredCalories, expectedCalories])

  useEffect(() => {
    if (defaultName) {
      form.setValue('name', defaultName)
    }
  }, [defaultName, form])
  useEffect(() => {
    if (!focusedFields.protein) {
      setInputValues((prev) => ({
        ...prev,
        protein: formatNumberSmart(protein, 1),
      }))
    }
  }, [protein, focusedFields.protein])

  useEffect(() => {
    if (!focusedFields.carbs) {
      setInputValues((prev) => ({
        ...prev,
        carbs: formatNumberSmart(carbs, 1),
      }))
    }
  }, [carbs, focusedFields.carbs])

  useEffect(() => {
    if (!focusedFields.fat) {
      setInputValues((prev) => ({ ...prev, fat: formatNumberSmart(fat, 1) }))
    }
  }, [fat, focusedFields.fat])

  useEffect(() => {
    if (!focusedFields.calories) {
      setInputValues((prev) => ({
        ...prev,
        calories: formatNumberSmart(enteredCalories, 1),
      }))
    }
  }, [enteredCalories, focusedFields.calories])

  const handleInputChange = (
    field: keyof typeof inputValues,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const sanitizedValue = formatDecimalInput(e)
    setInputValues((prev) => ({ ...prev, [field]: sanitizedValue }))

    if (sanitizedValue === '' || sanitizedValue === null) {
      const fieldName =
        field === 'calories' ? 'caloriesPer100g' : `${field}Per100g`
      form.setValue(fieldName as keyof CreateIngredientForm, 0)
      return
    }

    const numericValue = parseFloat(sanitizedValue)
    if (!isNaN(numericValue)) {
      const fieldName =
        field === 'calories' ? 'caloriesPer100g' : `${field}Per100g`
      form.setValue(fieldName as keyof CreateIngredientForm, numericValue)
    }
  }

  const handleFocus = (field: keyof typeof focusedFields) => {
    setFocusedFields((prev) => ({ ...prev, [field]: true }))
  }

  const handleBlur = (field: keyof typeof focusedFields) => {
    setFocusedFields((prev) => ({ ...prev, [field]: false }))
    const value = inputValues[field]
    const numericValue = parseFloat(value)
    if (!isNaN(numericValue)) {
      setInputValues((prev) => ({
        ...prev,
        [field]: formatNumberSmart(numericValue, 1),
      }))
    }
  }

  const handleSaveIngredient = async (values: CreateIngredientForm) => {
    try {
      const result = await createIngredientMutation.mutateAsync({
        input: values,
      })

      onIngredientCreated(result.createIngredient as GQLIngredient)
      form.reset({
        name: '',
        proteinPer100g: 0,
        carbsPer100g: 0,
        fatPer100g: 0,
        caloriesPer100g: 0,
      })
      setInputValues({
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
      })
      toast.success('Ingredient created and added!')
    } catch (error) {
      console.error('Error creating ingredient:', error)
      const errorMessage = extractErrorMessage(error)
      toast.error(errorMessage, {
        duration: 5000,
        description: 'Please check your ingredient data and try again',
      })
    }
  }

  const handleGetMacrosFromAI = async () => {
    const ingredientName = form.getValues('name')
    if (!ingredientName.trim()) {
      toast.error('Please enter an ingredient name first')
      return
    }

    setIsLoadingAI(true)
    try {
      const response = await fetch('/api/ai/get-macros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredientName }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const result = await response.json()
      if (result.success && result.data) {
        const {
          caloriesPer100g,
          proteinPer100g,
          carbsPer100g,
          fatPer100g,
          confidence,
          notes,
        } = result.data

        // Update form values
        form.setValue('caloriesPer100g', caloriesPer100g)
        form.setValue('proteinPer100g', proteinPer100g)
        form.setValue('carbsPer100g', carbsPer100g)
        form.setValue('fatPer100g', fatPer100g)

        // Show success message with confidence level
        const confidenceEmoji =
          confidence === 'high' ? '✅' : confidence === 'medium' ? '⚠️' : '❓'
        toast.success(
          `Macros generated ${confidenceEmoji} (${confidence} confidence)`,
          {
            description: notes || 'AI-generated nutritional data populated',
          },
        )
      } else {
        throw new Error(result.error || 'Invalid response from AI')
      }
    } catch (error) {
      console.error('AI macro generation error:', error)
      toast.error('Failed to generate macros from AI', {
        description: 'Please try again or enter values manually',
      })
    } finally {
      setIsLoadingAI(false)
    }
  }

  const handleCancel = () => {
    form.reset({
      name: '',
      proteinPer100g: 0,
      carbsPer100g: 0,
      fatPer100g: 0,
      caloriesPer100g: 0,
    })
    setInputValues({
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
    })
    onCancel()
  }

  if (!show) return null

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Create New Ingredient</h4>
      </div>

      <Form {...form}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Ingredient Name</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGetMacrosFromAI}
                    disabled={isLoadingAI || !field.value?.trim()}
                    className="text-xs"
                  >
                    {isLoadingAI ? (
                      'Getting AI macros...'
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3 mr-1" />
                        Get Macros from AI
                      </>
                    )}
                  </Button>
                </div>
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
              render={() => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Calories/100g</FormLabel>
                    {expectedCalories > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calculator className="h-3 w-3" />
                        <span>Expected: {expectedCalories}</span>
                        {enteredCalories > 0 && (
                          <>
                            {isCaloriesValidForForm ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <AlertCircle className="h-3 w-3 text-amber-500" />
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <FormControl>
                    <div className="flex gap-1">
                      <Input
                        id="ingredient-calories"
                        type="text"
                        placeholder="e.g., 165"
                        value={inputValues.calories}
                        onFocus={() => handleFocus('calories')}
                        onBlur={() => handleBlur('calories')}
                        onChange={(e) => handleInputChange('calories', e)}
                        className={
                          enteredCalories > 0 && !isCaloriesValidForForm
                            ? 'border-amber-300 focus:border-amber-500'
                            : ''
                        }
                      />
                      {expectedCalories > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="px-2 text-xs"
                          onClick={() => {
                            form.setValue('caloriesPer100g', expectedCalories)
                          }}
                          title={`Use calculated calories (${expectedCalories})`}
                        >
                          <Calculator className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </FormControl>
                  {!isCaloriesValidForForm && enteredCalories > 0 && (
                    <div className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>
                        Calories should be within 40% of calculated value (
                        {expectedCalories}). Current difference:{' '}
                        {Math.abs(
                          ((enteredCalories - expectedCalories) /
                            expectedCalories) *
                            100,
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="proteinPer100g"
              render={() => (
                <FormItem>
                  <FormLabel>Protein/100g</FormLabel>
                  <FormControl>
                    <Input
                      id="ingredient-protein"
                      type="text"
                      placeholder="e.g., 31"
                      value={inputValues.protein}
                      onFocus={() => handleFocus('protein')}
                      onBlur={() => handleBlur('protein')}
                      onChange={(e) => handleInputChange('protein', e)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="carbsPer100g"
              render={() => (
                <FormItem>
                  <FormLabel>Carbs/100g</FormLabel>
                  <FormControl>
                    <Input
                      id="ingredient-carbs"
                      type="text"
                      placeholder="e.g., 0"
                      value={inputValues.carbs}
                      onFocus={() => handleFocus('carbs')}
                      onBlur={() => handleBlur('carbs')}
                      onChange={(e) => handleInputChange('carbs', e)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fatPer100g"
              render={() => (
                <FormItem>
                  <FormLabel>Fat/100g</FormLabel>
                  <FormControl>
                    <Input
                      id="ingredient-fat"
                      type="text"
                      placeholder="e.g., 3.6"
                      value={inputValues.fat}
                      onFocus={() => handleFocus('fat')}
                      onBlur={() => handleBlur('fat')}
                      onChange={(e) => handleInputChange('fat', e)}
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
              type="button"
              size="sm"
              disabled={createIngredientMutation.isPending}
              onClick={async () => {
                const values = form.getValues()
                await handleSaveIngredient(values)
              }}
            >
              {createIngredientMutation.isPending ? 'Creating...' : 'Save'}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  )
}
