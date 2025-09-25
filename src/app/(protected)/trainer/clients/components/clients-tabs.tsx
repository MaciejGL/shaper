'use client'

import { useQueryState } from 'nuqs'
import { useMemo, useState } from 'react'

import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'
import { LoadingSkeleton } from '@/components/loading-skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { cn } from '@/lib/utils'

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
  const { isEnabled, isLoading } = useFeatureFlag(FEATURE_FLAGS.teams)
  const [selectedTeamTab, setSelectedTeamTab] = useState<string | null>(null)
  // State for selected team member
  const [selectedTeamMember, setSelectedTeamMember] = useState<{
    memberId: string
    memberName: string
    teamId: string
  } | null>(null)

  // Fetch teams
  const { data: teamsData, isLoading: teamsLoading } = useMyTeamsQuery(
    {},
    {
      enabled: Boolean(isEnabled),
      refetchOnWindowFocus: false,
    },
  )

  // Get clients - use selected team member's ID if available
  const { data, isLoading: isLoadingTeamMemberClients } = useGetClientsQuery(
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
  const isLoadingTeams = isLoading || teamsLoading

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

  const filteredClients = smartSearch<Client>(clients, search, [
    'firstName',
    'lastName',
    'email',
  ])

  return (
    <AnimatedPageTransition id="clients-tabs">
      <Tabs
        value={selectedTeamTab || 'my-clients'}
        className="w-full"
        onValueChange={(value) => {
          if (value === 'my-clients') {
            setSelectedTeamMember(null)
          }
          setSelectedTeamTab(value)
        }}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="my-clients">My Clients</TabsTrigger>
          {isLoadingTeams && (
            <TabsTrigger value="loading" disabled className="animate-pulse">
              Loading...
            </TabsTrigger>
          )}
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
            {isLoadingTeamMemberClients && (
              <LoadingSkeleton count={4} variant="lg" />
            )}
            {filteredClients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                tasks={tasksByClient[client.id] || []}
              />
            ))}
            {!isLoadingTeamMemberClients && filteredClients.length === 0 && (
              <div className="bg-foreground/20 p-4 rounded-md col-span-full text-center text-sm">
                No clients found
              </div>
            )}
          </div>
        </TabsContent>

        {/* Team Tabs */}
        {isEnabled &&
          teams.map((team) => (
            <TabsContent key={team.id} value={team.id} className="space-y-6">
              {/* Always show trainers */}
              <div className="space-y-4 @container/section">
                <h3 className="text-lg font-medium">Team Members</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 @4xl/section:grid-cols-3 gap-4">
                  {team.members
                    .filter((member) => member.user.id !== user?.id)
                    .map((member) => {
                      const memberName =
                        member.user.firstName && member.user.lastName
                          ? `${member.user.firstName} ${member.user.lastName}`
                          : member.user.email

                      const isSelected =
                        selectedTeamMember?.memberId === member.user.id

                      return (
                        <Card
                          key={member.id}
                          borderless
                          className={cn(
                            'cursor-pointer transition-all duration-200 hover:shadow-md',
                            isSelected
                              ? 'ring-2 ring-primary bg-primary/5'
                              : 'hover:bg-muted/50',
                          )}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setSelectedTeamMember({
                              memberId: member.user.id,
                              memberName,
                              teamId: team.id,
                            })
                          }}
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

              {/* Show selected trainer's clients */}
              {selectedTeamMember?.teamId === team.id && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">
                      {selectedTeamMember.memberName}'s Clients
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {clients.length} client{clients.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {isLoadingTeamMemberClients ? (
                    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
                      <LoadingSkeleton count={4} variant="lg" />
                    </div>
                  ) : (
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
                  )}
                </div>
              )}
            </TabsContent>
          ))}
      </Tabs>
    </AnimatedPageTransition>
  )
}
