'use client'

import { Users2 } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { useMemo, useState } from 'react'

import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUser } from '@/context/user-context'
import {
  GQLGetClientsQuery,
  useGetClientsQuery,
  useGetTrainerServiceDeliveriesQuery,
  useGetTrainerTasksQuery,
  useMyTeamsQuery,
} from '@/generated/graphql-client'
import { FEATURE_FLAGS, useFeatureFlag } from '@/hooks/use-feature-flag'
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
  const { isEnabled } = useFeatureFlag(FEATURE_FLAGS.teams)

  // State for selected team member
  const [selectedTeamMember, setSelectedTeamMember] = useState<{
    memberId: string
    memberName: string
    teamId: string
  } | null>(null)

  // Fetch teams
  const { data: teamsData } = useMyTeamsQuery(
    {},
    {
      enabled: Boolean(isEnabled),
      refetchOnWindowFocus: false,
    },
  )

  // Get clients - use selected team member's ID if available
  const { data } = useGetClientsQuery(
    { trainerId: selectedTeamMember?.memberId || undefined },
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
  const teams = teamsData?.myTeams ?? []

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
      <Tabs defaultValue="my-clients" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="my-clients">My Clients</TabsTrigger>
          {isEnabled &&
            teams.map((team) => (
              <TabsTrigger key={team.id} value={team.id}>
                {team.name}
              </TabsTrigger>
            ))}
        </TabsList>

        {/* My Clients Tab */}
        <TabsContent value="my-clients" className="space-y-4">
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

        {/* Team Tabs */}
        {isEnabled &&
          teams.map((team) => (
            <TabsContent key={team.id} value={team.id} className="space-y-4">
              {selectedTeamMember?.teamId === team.id ? (
                // Show selected member's clients
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">
                        {selectedTeamMember.memberName}'s Clients
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {clients.length} client{clients.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedTeamMember(null)}
                    >
                      <Users2 className="size-4 mr-2" />
                      Back to Team
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredClients.map((client) => (
                      <ClientCard
                        key={client.id}
                        client={client}
                        tasks={[]} // Don't show tasks for team member clients
                      />
                    ))}
                    {filteredClients.length === 0 && (
                      <div className="bg-foreground/20 p-4 rounded-md col-span-full text-center text-sm">
                        {selectedTeamMember.memberName} has no clients
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Show team member selection
                <div className="space-y-4">
                  <div className="text-center py-6">
                    <Users2 className="size-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-2">
                      Select Team Member
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Choose a trainer from <strong>{team.name}</strong> to view
                      their clients
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {team.members.map((member) => {
                      const memberName =
                        member.user.firstName && member.user.lastName
                          ? `${member.user.firstName} ${member.user.lastName}`
                          : member.user.email

                      return (
                        <Card
                          key={member.id}
                          className="cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-muted/50"
                          onClick={() =>
                            setSelectedTeamMember({
                              memberId: member.user.id,
                              memberName,
                              teamId: team.id,
                            })
                          }
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="size-10">
                                <AvatarImage
                                  src={member.user.image || undefined}
                                  alt={memberName}
                                />
                                <AvatarFallback className="text-sm">
                                  {member.user.firstName?.[0] ||
                                    member.user.email[0]}
                                  {member.user.lastName?.[0] || ''}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-base font-medium truncate">
                                  {memberName}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground truncate">
                                  {member.user.email}
                                </p>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
      </Tabs>
    </AnimatedPageTransition>
  )
}
