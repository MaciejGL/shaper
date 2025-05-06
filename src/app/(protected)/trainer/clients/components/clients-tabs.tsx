'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import ClientCard from './client-card'

export function ClientsTabs() {
  const clients = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      image: '/stylized-letters-sj.png',
      plan: 'Weight Loss Program',
      startDate: '2023-10-15',
      nextSession: '2023-11-10',
      progress: 75,
      status: 'active',
      lastActive: '2 hours ago',
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.c@example.com',
      image: '/microphone-concert-stage.png',
      plan: 'Muscle Building',
      startDate: '2023-09-05',
      nextSession: '2023-11-08',
      progress: 60,
      status: 'active',
      lastActive: '1 day ago',
    },
    {
      id: '3',
      name: 'Emma Wilson',
      email: 'emma.w@example.com',
      image: '/graffiti-ew.png',
      plan: 'Cardio Fitness',
      startDate: '2023-08-20',
      nextSession: '2023-11-15',
      progress: 85,
      status: 'active',
      lastActive: '5 hours ago',
    },
    {
      id: '4',
      name: 'James Rodriguez',
      email: 'james.r@example.com',
      image: '/stylized-jr-logo.png',
      plan: 'Strength Training',
      startDate: '2023-07-10',
      nextSession: '2023-11-12',
      progress: 90,
      status: 'active',
      lastActive: 'Just now',
    },
    {
      id: '5',
      name: 'Olivia Taylor',
      email: 'olivia.t@example.com',
      image: '/abstract-ot.png',
      plan: 'Flexibility Program',
      startDate: '2023-10-01',
      nextSession: '2023-11-20',
      progress: 40,
      status: 'inactive',
      lastActive: '1 week ago',
    },
    {
      id: '6',
      name: 'Daniel Brown',
      email: 'daniel.b@example.com',
      image: '/stylized-db-logo.png',
      plan: 'HIIT Training',
      startDate: '2023-09-15',
      nextSession: '2023-11-18',
      progress: 65,
      status: 'active',
      lastActive: '3 days ago',
    },
  ]

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="all">All Clients</TabsTrigger>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="inactive">Inactive</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
          {clients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="active" className="space-y-4">
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
      </TabsContent>
    </Tabs>
  )
}
