'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
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
  useDeleteMacroTargetsMutation,
  useGetClientMacroTargetsQuery,
  useSetMacroTargetsMutation,
} from '@/generated/graphql-client'

import { ClientHeader } from './header'

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
}

export function ClientMacroTargets({ clientId }: ClientMacroTargetsProps) {
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

  const deleteMutation = useDeleteMacroTargetsMutation({
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey })

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey)

      // Optimistically remove macro targets
      queryClient.setQueryData(queryKey, {
        getClientMacroTargets: null,
      })

      return { previousData }
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      toast.error('Failed to reset macro targets: ' + (error as Error).message)
    },
    onSuccess: () => {
      form.reset({
        calories: undefined,
        protein: undefined,
        carbs: undefined,
        fat: undefined,
        notes: '',
      })
      toast.success('Macro targets reset successfully')
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const hasMacroTargets = !!data?.getClientMacroTargets

  const form = useForm<MacroTargetsForm>({
    resolver: zodResolver(macroTargetsSchema),
    defaultValues: {
      calories: undefined,
      protein: undefined,
      carbs: undefined,
      fat: undefined,
      notes: '',
    },
  })

  useEffect(() => {
    if (data?.getClientMacroTargets) {
      form.reset({
        calories: data.getClientMacroTargets.calories || undefined,
        protein: data.getClientMacroTargets.protein || undefined,
        carbs: data.getClientMacroTargets.carbs || undefined,
        fat: data.getClientMacroTargets.fat || undefined,
        notes: data.getClientMacroTargets.notes || '',
      })
    }
  }, [data, form])

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

  const handleReset = () => {
    deleteMutation.mutate({ clientId })
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <ClientHeader
            title="Daily Macro Targets"
            action={
              <div className="flex gap-2">
                <Button size="sm" type="submit" loading={mutation.isPending}>
                  Save Macro Targets
                </Button>
                {hasMacroTargets && (
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    loading={deleteMutation.isPending}
                    onClick={handleReset}
                  >
                    Reset Macro
                  </Button>
                )}
              </div>
            }
          />
          <div className="grid grid-cols-4 gap-4">
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
        </form>
      </Form>
    </div>
  )
}
