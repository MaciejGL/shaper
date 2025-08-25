'use client'

import { useQueryState } from 'nuqs'
import { useMemo } from 'react'

import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUser } from '@/context/user-context'
import {
  GQLGetClientsQuery,
  useGetClientsQuery,
  useGetTrainerServiceDeliveriesQuery,
  useGetTrainerTasksQuery,
} from '@/generated/graphql-client'
import { smartSearch } from '@/lib/smart-search'

import ClientCard from './client-card'

export type Client = NonNullable<GQLGetClientsQuery['myClients']>[number]

interface TaskWithDelivery {
  id: string
  title: string
  status: string
  taskType: string
  requiresScheduling?: boolean
  scheduledAt?: string | null
  serviceDelivery: {
    packageName: string
    serviceType: string
  }
}

export function ClientsTabs() {
  const { user } = useUser()
  const { data } = useGetClientsQuery(
    {},
    {
      refetchOnWindowFocus: false,
    },
  )

  // Fetch service deliveries and tasks
  const { data: deliveriesData } = useGetTrainerServiceDeliveriesQuery(
    { trainerId: user?.id || '' },
    {
      enabled: !!user?.id,
    },
  )

  const { data: tasksData } = useGetTrainerTasksQuery(
    { trainerId: user?.id || '' },
    {
      enabled: !!user?.id,
    },
  )

  const [search] = useQueryState('search')

  const clients = data?.myClients ?? []

  // Group tasks by client
  const tasksByClient = useMemo(() => {
    if (!deliveriesData?.getTrainerDeliveries || !tasksData?.getTrainerTasks) {
      return {}
    }

    const grouped: Record<string, TaskWithDelivery[]> = {}

    deliveriesData.getTrainerDeliveries.forEach((delivery) => {
      const clientId = delivery.client?.id
      if (clientId) {
        const deliveryTasks = tasksData.getTrainerTasks.filter(
          (task) => task.serviceDeliveryId === delivery.id,
        )

        if (!grouped[clientId]) {
          grouped[clientId] = []
        }

        deliveryTasks.forEach((task) => {
          grouped[clientId].push({
            ...task,
            serviceDelivery: {
              packageName: delivery.packageName,
              serviceType: delivery.serviceType?.toString() || 'Unknown',
            },
          })
        })
      }
    })

    return grouped
  }, [deliveriesData, tasksData])

  if (!data) return null

  const filteredClients = smartSearch<Client>(clients, search, [
    'firstName',
    'lastName',
    'email',
  ])

  return (
    <AnimatedPageTransition id="clients-tabs">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Clients</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredClients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                tasks={tasksByClient[client.id] || []}
              />
            ))}
            {filteredClients.length === 0 && (
              <div className="bg-foreground/20 p-4 rounded-md col-span-full text-center text-sm">
                No clients found
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </AnimatedPageTransition>
  )
}
