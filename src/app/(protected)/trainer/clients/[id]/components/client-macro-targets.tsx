'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  useGetClientMacroTargetsQuery,
  useSetMacroTargetsMutation,
} from '@/generated/graphql-client'

const macroTargetsSchema = z.object({
  calories: z.number().min(0).max(10000).optional(),
  protein: z.number().min(0).max(1000).optional(),
  carbs: z.number().min(0).max(1000).optional(),
  fat: z.number().min(0).max(1000).optional(),
  notes: z.string().optional(),
})

type MacroTargetsForm = z.infer<typeof macroTargetsSchema>

interface ClientMacroTargetsProps {
  clientId: string
  clientName: string
}

export function ClientMacroTargets({
  clientId,
  clientName,
}: ClientMacroTargetsProps) {
  const queryClient = useQueryClient()
  const { data } = useGetClientMacroTargetsQuery({ clientId })
  const queryKey = useGetClientMacroTargetsQuery.getKey({ clientId })

  const mutation = useSetMacroTargetsMutation({
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey })

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey)

      // Optimistically update UI immediately
      queryClient.setQueryData(queryKey, {
        getClientMacroTargets: {
          id: 'temp-id',
          clientId: variables.input.clientId,
          trainerId: 'current-trainer',
          calories: variables.input.calories,
          protein: variables.input.protein,
          carbs: variables.input.carbs,
          fat: variables.input.fat,
          notes: variables.input.notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      })

      return { previousData }
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      toast.error('Failed to update macro targets: ' + (error as Error).message)
    },
    onSuccess: () => {
      toast.success('Macro targets updated successfully')
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const form = useForm<MacroTargetsForm>({
    resolver: zodResolver(macroTargetsSchema),
    defaultValues: {
      calories: data?.getClientMacroTargets?.calories || undefined,
      protein: data?.getClientMacroTargets?.protein || undefined,
      carbs: data?.getClientMacroTargets?.carbs || undefined,
      fat: data?.getClientMacroTargets?.fat || undefined,
      notes: data?.getClientMacroTargets?.notes || '',
    },
  })

  const onSubmit = (values: MacroTargetsForm) => {
    mutation.mutate({
      input: {
        clientId,
        calories: values.calories,
        protein: values.protein,
        carbs: values.carbs,
        fat: values.fat,
        notes: values.notes,
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Macro Targets for {clientName}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calories</FormLabel>
                    <FormControl>
                      <Input
                        id="calories"
                        type="number"
                        placeholder="2000"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined,
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="protein"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Protein (g)</FormLabel>
                    <FormControl>
                      <Input
                        id="protein"
                        type="number"
                        placeholder="150"
                        step="0.1"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined,
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="carbs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carbs (g)</FormLabel>
                    <FormControl>
                      <Input
                        id="carbs"
                        type="number"
                        placeholder="200"
                        step="0.1"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined,
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fat (g)</FormLabel>
                    <FormControl>
                      <Input
                        id="fat"
                        type="number"
                        placeholder="80"
                        step="0.1"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined,
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      id="notes"
                      placeholder="Additional nutrition guidance..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" loading={mutation.isPending}>
              Save Macro Targets
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
