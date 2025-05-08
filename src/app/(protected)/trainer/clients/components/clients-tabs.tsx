'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  GQLGetClientsQuery,
  useGetClientsQuery,
} from '@/generated/graphql-client'

import ClientCard from './client-card'

export type Client = NonNullable<GQLGetClientsQuery['user']>['clients'][number]

export function ClientsTabs() {
  const { data } = useGetClientsQuery()
  console.log(data)
  const clients = data?.user?.clients ?? []

  if (!data) return null

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="all">All Clients</TabsTrigger>
        {/* <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="inactive">Inactive</TabsTrigger> */}
      </TabsList>

      <TabsContent value="all" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
          {clients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
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
  )
}
