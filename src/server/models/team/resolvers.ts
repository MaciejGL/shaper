import { GQLUserRole } from '@/generated/graphql-client'
import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { invalidateTrainerAccessCache } from '@/lib/access-control'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/getUser'
import { sendTeamInvitationNotifications } from '@/lib/team-invitation-utils'
import { GQLContext } from '@/types/gql-context'

import Team, { TeamInvitation } from './model'

const includeTeamWithMembers = {
  locations: {
    include: {
      location: true,
    },
  },
  members: {
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
  },
  _count: {
    select: {
      members: true,
    },
  },
}

export const Query: GQLQueryResolvers<GQLContext> = {
  myTeams: async (_, __, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)

    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: {
            userId: user.user.id,
          },
        },
      },
      include: includeTeamWithMembers,
    })

    return teams.map((team) => new Team(team, context))
  },

  team: async (_, { id }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)

    const team = await prisma.team.findFirst({
      where: {
        id,
        members: {
          some: {
            userId: user.user.id,
          },
        },
      },
      include: includeTeamWithMembers,
    })

    if (!team) {
      throw new Error('Team not found or access denied')
    }

    return new Team(team, context)
  },

  teamInvitations: async (_, __, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)

    const invitations = await prisma.teamInvitation.findMany({
      where: {
        invitedEmail: user.user.email,
        status: 'PENDING',
      },
      include: {
        team: {
          include: {
            locations: {
              include: {
                location: true,
              },
            },
          },
        },
        invitedBy: {
          include: {
            profile: true,
          },
        },
      },
    })

    return invitations.map(
      (invitation) => new TeamInvitation(invitation, context),
    )
  },

  sentTeamInvitations: async (_, __, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)

    const invitations = await prisma.teamInvitation.findMany({
      where: {
        invitedById: user.user.id,
      },
      include: {
        team: {
          include: {
            locations: {
              include: {
                location: true,
              },
            },
          },
        },
        invitedBy: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return invitations.map(
      (invitation) => new TeamInvitation(invitation, context),
    )
  },
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  createTeam: async (_, { input }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)

    // Create or find locations
    const locationData = []
    for (const locationInput of input.locations) {
      const location = await prisma.location.upsert({
        where: {
          city_country: {
            city: locationInput.city,
            country: locationInput.country,
          },
        },
        update: {},
        create: {
          city: locationInput.city,
          country: locationInput.country,
          countryCode: locationInput.countryCode,
        },
      })
      locationData.push({ locationId: location.id })
    }

    // Create team with user as admin
    const team = await prisma.team.create({
      data: {
        name: input.name,
        locations: {
          create: locationData,
        },
        members: {
          create: {
            userId: user.user.id,
            role: 'ADMIN',
          },
        },
      },
      include: includeTeamWithMembers,
    })

    return new Team(team, context)
  },

  updateTeam: async (_, { input }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)

    // Check if user is admin of the team
    const membership = await prisma.teamMember.findFirst({
      where: {
        teamId: input.teamId,
        userId: user.user.id,
        role: 'ADMIN',
      },
    })

    if (!membership) {
      throw new Error('You must be an admin to update this team')
    }

    const team = await prisma.team.update({
      where: { id: input.teamId },
      data: {
        ...(input.name && { name: input.name }),
      },
      include: includeTeamWithMembers,
    })

    return new Team(team, context)
  },

  addTeamLocation: async (_, { input }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)

    // Check if user is admin of the team
    const membership = await prisma.teamMember.findFirst({
      where: {
        teamId: input.teamId,
        userId: user.user.id,
        role: 'ADMIN',
      },
    })

    if (!membership) {
      throw new Error('You must be an admin to add team locations')
    }

    // Create or find location
    const location = await prisma.location.upsert({
      where: {
        city_country: {
          city: input.city,
          country: input.country,
        },
      },
      update: {},
      create: {
        city: input.city,
        country: input.country,
        countryCode: input.countryCode,
      },
    })

    // Check if location is already added to team
    const existingTeamLocation = await prisma.teamLocation.findUnique({
      where: {
        teamId_locationId: {
          teamId: input.teamId,
          locationId: location.id,
        },
      },
    })

    if (existingTeamLocation) {
      throw new Error('Location is already added to this team')
    }

    // Add location to team
    await prisma.teamLocation.create({
      data: {
        teamId: input.teamId,
        locationId: location.id,
      },
    })

    // Return updated team
    const team = await prisma.team.findUniqueOrThrow({
      where: { id: input.teamId },
      include: includeTeamWithMembers,
    })

    return new Team(team, context)
  },

  removeTeamLocation: async (_, { input }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)

    // Check if user is admin of the team
    const membership = await prisma.teamMember.findFirst({
      where: {
        teamId: input.teamId,
        userId: user.user.id,
        role: 'ADMIN',
      },
    })

    if (!membership) {
      throw new Error('You must be an admin to remove team locations')
    }

    // Remove location from team
    await prisma.teamLocation.deleteMany({
      where: {
        teamId: input.teamId,
        locationId: input.locationId,
      },
    })

    // Return updated team
    const team = await prisma.team.findUniqueOrThrow({
      where: { id: input.teamId },
      include: includeTeamWithMembers,
    })

    return new Team(team, context)
  },

  inviteTeamMember: async (_, { input }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)

    // Check if user is admin of the team
    const membership = await prisma.teamMember.findFirst({
      where: {
        teamId: input.teamId,
        userId: user.user.id,
        role: 'ADMIN',
      },
    })

    if (!membership) {
      throw new Error('You must be an admin to invite team members')
    }

    // Check if invitation already exists
    const existingInvitation = await prisma.teamInvitation.findFirst({
      where: {
        teamId: input.teamId,
        invitedEmail: input.email,
        status: 'PENDING',
      },
    })

    if (existingInvitation) {
      throw new Error('Invitation already sent to this email')
    }

    // Check if user is already a member
    const existingMember = await prisma.user.findFirst({
      where: {
        email: input.email,
        teamMemberships: {
          some: {
            teamId: input.teamId,
          },
        },
      },
    })

    if (existingMember) {
      throw new Error('User is already a member of this team')
    }

    const invitation = await prisma.teamInvitation.create({
      data: {
        teamId: input.teamId,
        invitedEmail: input.email,
        invitedById: user.user.id,
        status: 'PENDING',
      },
      include: {
        team: {
          include: {
            locations: {
              include: {
                location: true,
              },
            },
          },
        },
        invitedBy: true,
      },
    })

    // Send all notifications (email, in-app, push)
    const inviterName =
      user.user.profile?.firstName && user.user.profile?.lastName
        ? `${user.user.profile.firstName} ${user.user.profile.lastName}`
        : user.user.name || 'Someone'

    const locations = invitation.team.locations.map(
      (tl) => `${tl.location.city}, ${tl.location.country}`,
    )

    await sendTeamInvitationNotifications({
      invitedEmail: input.email,
      inviterName,
      invitedById: user.user.id,
      teamName: invitation.team.name,
      locations,
      invitationId: invitation.id,
    })

    return new TeamInvitation(invitation, context)
  },

  removeTeamMember: async (_, { input }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)

    // Check if user is admin of the team
    const adminMembership = await prisma.teamMember.findFirst({
      where: {
        teamId: input.teamId,
        userId: user.user.id,
        role: 'ADMIN',
      },
    })

    if (!adminMembership) {
      throw new Error('You must be an admin to remove team members')
    }

    // Get the member to remove
    const memberToRemove = await prisma.teamMember.findUnique({
      where: { id: input.memberId },
    })

    if (!memberToRemove || memberToRemove.teamId !== input.teamId) {
      throw new Error('Team member not found')
    }

    // Cannot remove yourself
    if (memberToRemove.userId === user.user.id) {
      throw new Error('You cannot remove yourself from the team')
    }

    await prisma.teamMember.delete({
      where: { id: input.memberId },
    })

    // Invalidate access control cache for the removed user
    await invalidateTrainerAccessCache(memberToRemove.userId)

    return true
  },

  respondToTeamInvitation: async (_, { input }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)

    const invitation = await prisma.teamInvitation.findFirst({
      where: {
        id: input.invitationId,
        invitedEmail: user.user.email,
        status: 'PENDING',
      },
      include: {
        team: {
          include: {
            locations: {
              include: {
                location: true,
              },
            },
          },
        },
        invitedBy: true,
      },
    })

    if (!invitation) {
      throw new Error('Invitation not found or already responded')
    }

    const status = input.accept ? 'ACCEPTED' : 'REJECTED'

    // Update invitation status
    const updatedInvitation = await prisma.teamInvitation.update({
      where: { id: input.invitationId },
      data: { status },
      include: {
        team: {
          include: {
            locations: {
              include: {
                location: true,
              },
            },
          },
        },
        invitedBy: true,
      },
    })

    // If accepted, add user to team
    if (input.accept) {
      await prisma.teamMember.create({
        data: {
          teamId: invitation.teamId,
          userId: user.user.id,
          role: 'MEMBER',
        },
      })

      // Invalidate access control cache for the new team member
      await invalidateTrainerAccessCache(user.user.id)
    }

    return new TeamInvitation(updatedInvitation, context)
  },
}
