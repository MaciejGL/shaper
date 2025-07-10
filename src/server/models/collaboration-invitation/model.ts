import {
  CollaborationInvitation as PrismaCollaborationInvitation,
  User as PrismaUser,
} from '@prisma/client'

import {
  GQLAvailablePlan,
  GQLCollaborationInvitation,
  GQLCollaborationInvitationStatus,
  GQLCollaborationPermission,
  GQLPlanCollaboratorSummary,
  GQLTeamMember,
} from '@/generated/graphql-server'
import UserPublic from '@/server/models/user-public/model'
import { GQLContext } from '@/types/gql-context'

export default class CollaborationInvitation
  implements GQLCollaborationInvitation
{
  constructor(
    protected data: PrismaCollaborationInvitation & {
      sender?: PrismaUser | null
      recipient?: PrismaUser | null
    },
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get senderId() {
    return this.data.senderId
  }

  get recipientId() {
    return this.data.recipientId
  }

  get status(): GQLCollaborationInvitationStatus {
    return this.data.status as GQLCollaborationInvitationStatus
  }

  get message() {
    return this.data.message
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }

  async sender() {
    if (this.data.sender) {
      return new UserPublic(this.data.sender, this.context)
    } else {
      console.error(
        `[CollaborationInvitation] No sender found for invitation ${this.id}. Loading from database.`,
      )
      const sender = await this.context.loaders.user.userById.load(
        this.data.senderId,
      )
      if (!sender) {
        throw new Error(
          `Sender not found for collaboration invitation ${this.id}`,
        )
      }
      return new UserPublic(sender, this.context)
    }
  }

  async recipient() {
    if (this.data.recipient) {
      return new UserPublic(this.data.recipient, this.context)
    } else {
      console.error(
        `[CollaborationInvitation] No recipient found for invitation ${this.id}. Loading from database.`,
      )
      const recipient = await this.context.loaders.user.userById.load(
        this.data.recipientId,
      )
      if (!recipient) {
        throw new Error(
          `Recipient not found for collaboration invitation ${this.id}`,
        )
      }
      return new UserPublic(recipient, this.context)
    }
  }
}

export class TeamMember implements GQLTeamMember {
  constructor(
    protected data: {
      id: string
      user: PrismaUser
      addedBy: PrismaUser
      isCurrentUserSender: boolean
      createdAt: Date
      updatedAt: Date
    },
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get isCurrentUserSender() {
    return this.data.isCurrentUserSender
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }

  async user() {
    return new UserPublic(this.data.user, this.context)
  }

  async addedBy() {
    return new UserPublic(this.data.addedBy, this.context)
  }
}

export class PlanCollaboratorSummary implements GQLPlanCollaboratorSummary {
  constructor(
    private data: {
      id: string
      collaborator: UserPublic
      addedBy: UserPublic
      permission: string
      planType: string
      planId: string
      planTitle: string
      createdAt: Date
      updatedAt: Date
    },
    private context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get collaborator() {
    return this.data.collaborator
  }

  get addedBy() {
    return this.data.addedBy
  }

  get permission(): GQLCollaborationPermission {
    return this.data.permission as GQLCollaborationPermission
  }

  get planType() {
    return this.data.planType
  }

  get planId() {
    return this.data.planId
  }

  get planTitle() {
    return this.data.planTitle
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }
}

export class PlanWithPermissions {
  constructor(
    private data: {
      id: string
      title: string
      planType: string
      description: string | null
      isTemplate: boolean
      createdAt: Date
      currentPermission: string | null
      hasAccess: boolean
    },
    private context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get title() {
    return this.data.title
  }

  get planType() {
    return this.data.planType
  }

  get description() {
    return this.data.description
  }

  get isTemplate() {
    return this.data.isTemplate
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get currentPermission(): GQLCollaborationPermission | null {
    return this.data.currentPermission as GQLCollaborationPermission | null
  }

  get hasAccess() {
    return this.data.hasAccess
  }
}

export class AvailablePlan implements GQLAvailablePlan {
  constructor(
    protected data: {
      id: string
      title: string
      planType: 'TRAINING' | 'MEAL'
      description?: string | null
      isTemplate: boolean
      createdAt: Date
    },
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get title() {
    return this.data.title
  }

  get planType() {
    return this.data.planType
  }

  get description() {
    return this.data.description
  }

  get isTemplate() {
    return this.data.isTemplate
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }
}
