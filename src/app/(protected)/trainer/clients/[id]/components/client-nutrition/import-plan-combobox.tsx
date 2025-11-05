'use client'

import { useQueryClient } from '@tanstack/react-query'
import { Download, Search } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  type GQLCopyNutritionPlanInput,
  type GQLGetClientNutritionPlansQuery,
  type GQLGetTrainerNutritionPlansQuery,
  useCopyNutritionPlanMutation,
  useGetClientNutritionPlansQuery,
  useGetTrainerNutritionPlansQuery,
} from '@/generated/graphql-client'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'

type NutritionPlanWithClient = NonNullable<
  GQLGetTrainerNutritionPlansQuery['trainerNutritionPlans']
>[number]

interface ImportPlanComboboxProps {
  clientId: string
}

export function ImportPlanCombobox({ clientId }: ImportPlanComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const queryClient = useQueryClient()

  // Debounce search query for better UX
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Fetch all trainer's nutrition plans
  const { data: trainerPlansData, isLoading: isLoadingPlans } =
    useGetTrainerNutritionPlansQuery(undefined, {
      enabled: isOpen,
      staleTime: 2 * 60 * 1000, // 2 minutes
    })

  const clientNutritionPlansQueryKey = useGetClientNutritionPlansQuery.getKey({
    clientId,
  })

  const copyPlanMutation = useCopyNutritionPlanMutation({
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: clientNutritionPlansQueryKey,
      })

      const previousData = queryClient.getQueryData(
        clientNutritionPlansQueryKey,
      )

      // Find the source plan to get its name for optimistic update
      const sourcePlan = trainerPlansData?.trainerNutritionPlans?.find(
        (p) => p.id === variables.input.sourceNutritionPlanId,
      )

      if (sourcePlan) {
        // Optimistically add the copied plan
        queryClient.setQueryData(
          clientNutritionPlansQueryKey,
          (old: GQLGetClientNutritionPlansQuery | undefined) => {
            const optimisticPlan = {
              id: `temp-${Date.now()}`,
              name: `${sourcePlan.name} (Copy)`,
              description: sourcePlan.description,
              isSharedWithClient: false,
              createdAt: new Date().toISOString(),
              dayCount: sourcePlan.dayCount,
              totalMealCount: sourcePlan.totalMealCount,
            }

            return {
              ...old,
              getClientNutritionPlans: [
                optimisticPlan,
                ...(old?.getClientNutritionPlans || []),
              ],
            }
          },
        )
      }

      return { previousData }
    },
    onSuccess: () => {
      toast.success('Nutrition plan imported successfully')
      setIsOpen(false)
      setSearchQuery('')
    },
    onError: (error, variables, context) => {
      toast.error('Failed to import plan: ' + (error as Error).message)
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(
          clientNutritionPlansQueryKey,
          context.previousData,
        )
      }
    },
    onSettled: () => {
      // Always refetch to sync with server
      queryClient.invalidateQueries({ queryKey: clientNutritionPlansQueryKey })
    },
  })

  const handleImportPlan = (plan: NutritionPlanWithClient) => {
    const input: GQLCopyNutritionPlanInput = {
      sourceNutritionPlanId: plan.id,
      targetClientId: clientId,
    }

    copyPlanMutation.mutate({ input })
  }

  // Filter and group plans
  const allPlans = trainerPlansData?.trainerNutritionPlans || []

  // Filter out current client's plans and apply search
  const filteredPlans = allPlans
    .filter((plan) => plan.client && plan.client.id !== clientId)
    .filter((plan) => {
      if (!debouncedSearchQuery) return true

      const searchLower = debouncedSearchQuery.toLowerCase()
      const client = plan.client!
      return (
        plan.name.toLowerCase().includes(searchLower) ||
        client.firstName?.toLowerCase().includes(searchLower) ||
        client.lastName?.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower)
      )
    })

  // Group by client
  const groupedPlans = filteredPlans.reduce(
    (acc, plan) => {
      const client = plan.client!
      const clientKey = client.id
      if (!acc[clientKey]) {
        acc[clientKey] = {
          client,
          plans: [],
        }
      }
      acc[clientKey].plans.push(plan)
      return acc
    },
    {} as Record<
      string,
      {
        client: NonNullable<NutritionPlanWithClient['client']>
        plans: NutritionPlanWithClient[]
      }
    >,
  )

  const clientGroups = Object.values(groupedPlans)
  const hasResults = clientGroups.length > 0

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" iconStart={<Download />}>
          Import Plan
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="end">
        <div className="flex flex-col">
          {/* Search Input */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by plan name, client name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>

          {/* Results */}
          <Command className="rounded-none border-0">
            <CommandList className="max-h-[300px]">
              {isLoadingPlans && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Loading plans...
                </div>
              )}

              {!isLoadingPlans && !hasResults && (
                <CommandEmpty className="py-6 text-center text-sm">
                  {debouncedSearchQuery
                    ? `No plans found for "${debouncedSearchQuery}"`
                    : 'No nutrition plans from other clients'}
                </CommandEmpty>
              )}

              {!isLoadingPlans && hasResults && (
                <>
                  {clientGroups.map(({ client, plans }) => (
                    <CommandGroup
                      key={client.id}
                      heading={`${client.firstName || ''} ${client.lastName || ''} (${client.email})`.trim()}
                    >
                      {plans.map((plan) => (
                        <CommandItem
                          key={plan.id}
                          className="cursor-pointer"
                          onSelect={() => handleImportPlan(plan)}
                          disabled={copyPlanMutation.isPending}
                        >
                          <div className="flex w-full items-center justify-between">
                            <div className="font-medium text-sm truncate">
                              {plan.name}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {plan.dayCount} day
                              {plan.dayCount !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                </>
              )}
            </CommandList>
          </Command>
        </div>
      </PopoverContent>
    </Popover>
  )
}
