import {
  CollaborationInvitation as PrismaCollaborationInvitation,
  User as PrismaUser,
} from '@prisma/client'

import {
  GQLCollaborationInvitation,
  GQLCollaborationInvitationStatus,
} from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import UserPublic from '../user-public/model'

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
