import { GQLMessage } from '@/generated/graphql-server'
import {
  Message as PrismaMessage,
  User as PrismaUser,
} from '@/generated/prisma/client'
import { GQLContext } from '@/types/gql-context'

import User from '../user/model'

export default class Message implements GQLMessage {
  constructor(
    protected data: PrismaMessage & {
      sender?: PrismaUser | null
    },
    protected context: GQLContext,
  ) {}

  // Scalar fields
  get id() {
    return this.data.id
  }

  get chatId() {
    return this.data.chatId
  }

  get senderId() {
    return this.data.senderId
  }

  get content() {
    return this.data.content
  }

  get imageUrl() {
    return this.data.imageUrl
  }

  get isEdited() {
    return this.data.isEdited
  }

  get isDeleted() {
    return this.data.isDeleted
  }

  get readAt() {
    return this.data.readAt?.toISOString() || null
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }

  // Relations
  get sender() {
    if (!this.data.sender) {
      throw new Error('Sender data not loaded')
    }
    return new User(this.data.sender, this.context)
  }
}
