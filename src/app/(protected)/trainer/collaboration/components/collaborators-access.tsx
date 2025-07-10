'use client'

import {
  ExternalLink,
  MoreVertical,
  Settings,
  Trash2,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import {
  GQLCollaborationInvitationAction,
  GQLCollaborationPermission,
  useMyPlanCollaboratorsQuery,
  useMyTeamMembersQuery,
  useRemoveMealPlanCollaboratorMutation,
  useRemoveTrainingPlanCollaboratorMutation,
  useRespondToCollaborationInvitationMutation,
  useUpdateMealPlanCollaboratorPermissionMutation,
  useUpdateTrainingPlanCollaboratorPermissionMutation,
} from '@/generated/graphql-client'
import {
  getPermissionColor,
  getPlanTypeColor,
  getPlanTypeLabel,
} from '@/lib/collaboration-utils'
import { formatRelativeTime } from '@/lib/date-utils'
import { useInvalidateQuery } from '@/lib/invalidate-query'
import { getUserDisplayName, getUserInitials } from '@/lib/user-utils'

import { LoadingSkeleton } from './loading-skeleton'
import { TeamMemberPlanModal } from './team-member-plan-modal'

// Type for the team member that the modal expects
interface TeamMemberForModal {
  id: string
  user: {
    id: string
    firstName?: string | null
    lastName?: string | null
    email: string
  }
}

// Type for grouped collaborators
interface GroupedCollaborator {
  userId: string
  user: {
    id: string
    firstName?: string | null
    lastName?: string | null
    email: string
  }
  planAccesses: {
    id: string
    permission: string
    planType: string
    planId: string
    planTitle: string
    createdAt: string
    updatedAt: string
    collaborator: {
      id: string
      firstName?: string | null
      lastName?: string | null
      email: string
    }
    addedBy: {
      id: string
      firstName?: string | null
      lastName?: string | null
      email: string
    }
  }[]
}

// Extract the dropdown menu into a reusable component
interface CollaboratorDropdownProps {
  groupedCollaborator: GroupedCollaborator
  onManagePlans: (teamMember: TeamMemberForModal) => void
  onRemoveFromTeam: (userId: string) => void
  isRemoving?: boolean
}

function CollaboratorDropdown({
  groupedCollaborator,
  onManagePlans,
  onRemoveFromTeam,
  isRemoving = false,
}: CollaboratorDropdownProps) {
  const handleManagePlans = () => {
    // Construct the proper object structure for the modal
    const teamMember: TeamMemberForModal = {
      id: groupedCollaborator.userId,
      user: groupedCollaborator.user,
    }
    onManagePlans(teamMember)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" disabled={isRemoving}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleManagePlans} disabled={isRemoving}>
          <Settings className="h-4 w-4 mr-2" />
          Manage Plans
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onRemoveFromTeam(groupedCollaborator.userId)}
          disabled={isRemoving}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {isRemoving ? 'Removing...' : 'Remove from Team'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function CollaboratorsAccess() {
  const invalidateQueries = useInvalidateQuery()
  const {
    data: planCollaboratorsData,
    refetch,
    isLoading,
  } = useMyPlanCollaboratorsQuery()
  const [selectedMember, setSelectedMember] =
    useState<TeamMemberForModal | null>(null)
  const [updatingPermissions, setUpdatingPermissions] = useState<Set<string>>(
    new Set(),
  )
  const [removingFromTeam, setRemovingFromTeam] = useState<Set<string>>(
    new Set(),
  )

  const { mutate: removeFromTeam } =
    useRespondToCollaborationInvitationMutation({
      onSuccess: async (_, variables) => {
        try {
          await refetch()
          invalidateQueries({
            queryKey: useMyTeamMembersQuery.getKey(),
          })
          toast.success('Team member removed successfully')
        } catch (error) {
          toast.error('Failed to refresh data')
        } finally {
          // Clear loading state
          const userId = variables.input.invitationId // This is actually the userId
          setRemovingFromTeam((prev) => {
            const newSet = new Set(prev)
            newSet.delete(userId)
            return newSet
          })
        }
      },
      onError: (_, variables) => {
        // Clear loading state on error
        const userId = variables.input.invitationId // This is actually the userId
        setRemovingFromTeam((prev) => {
          const newSet = new Set(prev)
          newSet.delete(userId)
          return newSet
        })
        toast.error('Failed to remove team member')
      },
    })

  const handleRemoveTeamMember = async (userId: string) => {
    setRemovingFromTeam((prev) => new Set(prev).add(userId))

    // The resolver now handles finding the invitation and removing all plan permissions
    removeFromTeam({
      input: {
        invitationId: userId, // Resolver will find the correct invitation
        action: GQLCollaborationInvitationAction.Reject,
      },
    })
  }

  const { mutate: removeTrainingCollaborator } =
    useRemoveTrainingPlanCollaboratorMutation()

  const { mutate: removeMealCollaborator } =
    useRemoveMealPlanCollaboratorMutation()

  const { mutate: updateTrainingPermission } =
    useUpdateTrainingPlanCollaboratorPermissionMutation({
      onSuccess: async (_, variables) => {
        try {
          await refetch()
          toast.success('Permission updated successfully')
        } catch (error) {
          toast.error('Failed to refresh data')
        } finally {
          setUpdatingPermissions((prev) => {
            const newSet = new Set(prev)
            newSet.delete(variables.input.collaboratorId)
            return newSet
          })
        }
      },
      onError: (_, variables) => {
        setUpdatingPermissions((prev) => {
          const newSet = new Set(prev)
          newSet.delete(variables.input.collaboratorId)
          return newSet
        })
        toast.error('Failed to update permission')
      },
    })

  const { mutate: updateMealPermission } =
    useUpdateMealPlanCollaboratorPermissionMutation({
      onSuccess: async (_, variables) => {
        try {
          await refetch()
          toast.success('Permission updated successfully')
        } catch (error) {
          toast.error('Failed to refresh data')
        } finally {
          setUpdatingPermissions((prev) => {
            const newSet = new Set(prev)
            newSet.delete(variables.input.collaboratorId)
            return newSet
          })
        }
      },
      onError: (_, variables) => {
        setUpdatingPermissions((prev) => {
          const newSet = new Set(prev)
          newSet.delete(variables.input.collaboratorId)
          return newSet
        })
        toast.error('Failed to update permission')
      },
    })

  const handleRemoveCollaborator = (
    collaboratorId: string,
    planType: string,
  ) => {
    if (planType === 'TRAINING') {
      removeTrainingCollaborator({
        input: { collaboratorId },
      })
    } else if (planType === 'MEAL') {
      removeMealCollaborator({
        input: { collaboratorId },
      })
    }
  }

  const handleUpdatePermission = (
    collaboratorId: string,
    planType: string,
    permission: GQLCollaborationPermission,
  ) => {
    // Set loading state for this specific plan access
    setUpdatingPermissions((prev) => new Set(prev).add(collaboratorId))

    if (planType === 'TRAINING') {
      updateTrainingPermission({
        input: { collaboratorId, permission },
      })
    } else if (planType === 'MEAL') {
      updateMealPermission({
        input: { collaboratorId, permission },
      })
    }
  }

  const handleManagePlans = (teamMember: TeamMemberForModal) => {
    setSelectedMember(teamMember)
  }

  const planCollaborators = planCollaboratorsData?.myPlanCollaborators || []

  // Group collaborators by user
  const groupedCollaborators = planCollaborators.reduce((acc, collaborator) => {
    const userId = collaborator.collaborator.id
    const existing = acc.find((group) => group.userId === userId)

    // Skip placeholder entries from the plan accesses (but use them to create the user entry)
    const isPlaceholder = collaborator.planType === 'PLACEHOLDER'

    if (existing) {
      // Only add real plan accesses, not placeholders
      if (!isPlaceholder) {
        existing.planAccesses.push(collaborator)
      }
    } else {
      acc.push({
        userId,
        user: collaborator.collaborator,
        planAccesses: isPlaceholder ? [] : [collaborator], // Empty array for placeholder users
      })
    }

    return acc
  }, [] as GroupedCollaborator[])

  const getPermissionLabel = (permission: string) => {
    switch (permission) {
      case 'VIEW':
        return 'View Only'
      case 'EDIT':
        return 'Edit'
      case 'ADMIN':
        return 'Admin'
      default:
        return permission
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Access Management</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {groupedCollaborators.length} collaborators
          </Badge>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <LoadingSkeleton count={3} />
        </div>
      ) : null}
      {!isLoading && groupedCollaborators.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">
              No plan collaborators yet
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Assign team members to specific plans to give them access
            </p>
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && groupedCollaborators.length > 0 ? (
        <div className="space-y-4">
          {groupedCollaborators.map((groupedCollaborator) => {
            const isRemovingUser = removingFromTeam.has(
              groupedCollaborator.userId,
            )

            return (
              <Card
                key={groupedCollaborator.userId}
                className={isRemovingUser ? 'opacity-50' : ''}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {getUserInitials(groupedCollaborator.user)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-base">
                          {getUserDisplayName(groupedCollaborator.user)}
                          {isRemovingUser && (
                            <span className="ml-2 text-sm text-muted-foreground">
                              (Removing...)
                            </span>
                          )}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary">
                            {groupedCollaborator.planAccesses.length} plan
                            {groupedCollaborator.planAccesses.length !== 1
                              ? 's'
                              : ''}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            •
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {groupedCollaborator.user.email}
                          </span>
                        </div>
                      </div>
                    </div>
                    <CollaboratorDropdown
                      groupedCollaborator={groupedCollaborator}
                      onManagePlans={handleManagePlans}
                      onRemoveFromTeam={handleRemoveTeamMember}
                      isRemoving={isRemovingUser}
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {groupedCollaborator.planAccesses.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">
                        No plan permissions assigned yet
                      </p>

                      <Button
                        variant="outline"
                        size="sm"
                        className="mx-auto mt-4"
                        onClick={() => {
                          setSelectedMember({
                            id: groupedCollaborator.userId,
                            user: groupedCollaborator.user,
                          })
                        }}
                      >
                        Manage Plans
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {groupedCollaborator.planAccesses.map(
                        (planAccess, index) => {
                          const isUpdating = updatingPermissions.has(
                            planAccess.id,
                          )

                          return (
                            <div key={planAccess.id}>
                              {index > 0 && <Separator className="my-2" />}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Badge
                                    variant="secondary"
                                    className={getPlanTypeColor(
                                      planAccess.planType,
                                    )}
                                  >
                                    {getPlanTypeLabel(planAccess.planType)}
                                  </Badge>
                                  <span className="text-sm font-medium truncate max-w-xs">
                                    {planAccess.planTitle}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge
                                    variant={getPermissionColor(
                                      planAccess.permission,
                                    )}
                                    className={isUpdating ? 'opacity-50' : ''}
                                  >
                                    {isUpdating
                                      ? 'Updating...'
                                      : planAccess.permission}
                                  </Badge>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        disabled={isUpdating || isRemovingUser}
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem asChild>
                                        <Link
                                          href={`/trainer/${
                                            planAccess.planType === 'TRAINING'
                                              ? 'trainings/creator'
                                              : 'meal-plans/creator'
                                          }/${planAccess.planId}`}
                                          className="flex items-center"
                                          target="_blank"
                                        >
                                          <ExternalLink className="h-4 w-4 mr-2" />
                                          View Plan
                                        </Link>
                                      </DropdownMenuItem>
                                      <DropdownMenuSub>
                                        <DropdownMenuSubTrigger
                                          disabled={
                                            isUpdating || isRemovingUser
                                          }
                                        >
                                          <Settings className="h-4 w-4 mr-2" />
                                          Change Permission
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent>
                                          {Object.values(
                                            GQLCollaborationPermission,
                                          ).map((permission) => (
                                            <DropdownMenuItem
                                              key={permission}
                                              onClick={() =>
                                                handleUpdatePermission(
                                                  planAccess.id,
                                                  planAccess.planType,
                                                  permission,
                                                )
                                              }
                                              disabled={
                                                planAccess.permission ===
                                                  permission ||
                                                isUpdating ||
                                                isRemovingUser
                                              }
                                            >
                                              {getPermissionLabel(permission)}
                                              {planAccess.permission ===
                                                permission && (
                                                <span className="ml-2 text-xs text-muted-foreground">
                                                  (current)
                                                </span>
                                              )}
                                            </DropdownMenuItem>
                                          ))}
                                        </DropdownMenuSubContent>
                                      </DropdownMenuSub>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleRemoveCollaborator(
                                            planAccess.id,
                                            planAccess.planType,
                                          )
                                        }
                                        disabled={isUpdating || isRemovingUser}
                                        className="text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Remove Access
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Added {formatRelativeTime(planAccess.createdAt)}{' '}
                                by {getUserDisplayName(planAccess.addedBy)}
                              </div>
                            </div>
                          )
                        },
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : null}

      {selectedMember && (
        <TeamMemberPlanModal
          isOpen={!!selectedMember}
          onClose={() => setSelectedMember(null)}
          teamMember={selectedMember}
        />
      )}
    </div>
  )
}
