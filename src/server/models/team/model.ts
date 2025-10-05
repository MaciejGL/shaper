import {
  GQLInvitationStatus,
  GQLTeam,
  GQLTeamInvitation,
  GQLTeamMember,
  GQLTeamRole,
} from '@/generated/graphql-server'
import {
  Location as PrismaLocation,
  Team as PrismaTeam,
  TeamInvitation as PrismaTeamInvitation,
  TeamLocation as PrismaTeamLocation,
  TeamMember as PrismaTeamMember,
  User as PrismaUser,
} from '@/generated/prisma/client'
import { GQLContext } from '@/types/gql-context'

import Location from '../location/model'
import UserPublic from '../user-public/model'

export class TeamMember implements GQLTeamMember {
  constructor(
    protected data: PrismaTeamMember & {
      user: PrismaUser
    },
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get user() {
    return new UserPublic(this.data.user, this.context)
  }

  get role() {
    return this.data.role as GQLTeamRole
  }

  get joinedAt() {
    return this.data.joinedAt.toISOString()
  }
}

export class TeamInvitation implements GQLTeamInvitation {
  constructor(
    protected data: PrismaTeamInvitation & {
      team: PrismaTeam & {
        locations: (PrismaTeamLocation & { location: PrismaLocation })[]
      }
      invitedBy: PrismaUser
    },
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get team() {
    return new Team(this.data.team, this.context)
  }

  get invitedEmail() {
    return this.data.invitedEmail
  }

  get invitedBy() {
    return new UserPublic(this.data.invitedBy, this.context)
  }

  get status() {
    return this.data.status as GQLInvitationStatus
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }
}

export default class Team implements GQLTeam {
  constructor(
    protected data: PrismaTeam & {
      locations?: (PrismaTeamLocation & { location: PrismaLocation })[]
      members?: (PrismaTeamMember & { user: PrismaUser })[]
      _count?: {
        members: number
      }
    },
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get name() {
    return this.data.name
  }

  get locations() {
    return this.data.locations?.map((tl) => new Location(tl.location)) || []
  }

  get memberCount() {
    return this.data._count?.members || this.data.members?.length || 0
  }

  get members() {
    return (
      this.data.members?.map(
        (member) => new TeamMember(member, this.context),
      ) || []
    )
  }

  get isAdmin() {
    if (!this.context.user?.user?.id) return false
    return (
      this.data.members?.some(
        (member) =>
          member.userId === this.context.user!.user.id &&
          member.role === 'ADMIN',
      ) || false
    )
  }

  get stripeConnectedAccountId() {
    return this.data.stripeConnectedAccountId || null
  }

  get hasStripeConnect() {
    return !!this.data.stripeConnectedAccountId
  }

  get platformFeePercent() {
    return this.data.platformFeePercent
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }
}
