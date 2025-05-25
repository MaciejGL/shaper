'use client'

import { useQueryState } from 'nuqs'

import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  GQLGetClientsQuery,
  useGetClientsQuery,
} from '@/generated/graphql-client'
import { smartSearch } from '@/lib/smart-search'

import ClientCard from './client-card'

export type Client = NonNullable<GQLGetClientsQuery['user']>['clients'][number]

export function ClientsTabs() {
  const { data } = useGetClientsQuery()
  const [search] = useQueryState('search')

  const clients = data?.user?.clients ?? []

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
          {/* <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="inactive">Inactive</TabsTrigger> */}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredClients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
            {filteredClients.length === 0 && (
              <div className="bg-foreground/20 p-4 rounded-md col-span-full text-center text-sm">
                No clients found
              </div>
            )}
          </div>
        </TabsContent>

        {/* <TabsContent value="active" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
        {clients
        .filter((client) => client.status === 'active')
        .map((client) => (
          <ClientCard key={client.id} client={client} />
          ))}
          </div>
          </TabsContent>
          
          <TabsContent value="inactive" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
          {clients
          .filter((client) => client.status === 'inactive')
          .map((client) => (
            <ClientCard key={client.id} client={client} />
            ))}
            </div>
            </TabsContent> */}
      </Tabs>
    </AnimatedPageTransition>
  )
}
