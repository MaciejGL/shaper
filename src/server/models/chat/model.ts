import { GQLChat } from '@/generated/graphql-server'
import {
  Chat as PrismaChat,
  Message as PrismaMessage,
  User as PrismaUser,
  UserProfile as PrismaUserProfile,
} from '@/generated/prisma/client'
import { GQLContext } from '@/types/gql-context'

import { getChatMessages } from '../message/factory'
import Message from '../message/model'
import UserPublic from '../user-public/model'

export default class Chat implements GQLChat {
  constructor(
    protected data: PrismaChat & {
      trainer?:
        | (PrismaUser & {
            profile?: PrismaUserProfile | null
          })
        | null
      client?:
        | (PrismaUser & {
            profile?: PrismaUserProfile | null
          })
        | null
      messages?: (PrismaMessage & {
        sender?:
          | (PrismaUser & {
              profile?: PrismaUserProfile | null
            })
          | null
      })[]
    },
    protected context: GQLContext,
  ) {}

  // Scalar fields
  get id() {
    return this.data.id
  }

  get trainerId() {
    return this.data.trainerId
  }

  get clientId() {
    return this.data.clientId
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }

  // Relations
  get trainer() {
    if (!this.data.trainer) {
      throw new Error('Trainer data not loaded')
    }
    return new UserPublic(this.data.trainer, this.context)
  }

  get client() {
    if (!this.data.client) {
      throw new Error('Client data not loaded')
    }
    return new UserPublic(this.data.client, this.context)
  }

  get lastMessage() {
    if (!this.data.messages || this.data.messages.length === 0) {
      return null
    }
    return new Message(this.data.messages[0], this.context)
  }

  async messages({
    skip = 0,
    take = 50,
  }: { skip?: number; take?: number } = {}) {
    // Fall back to individual query for pagination or when not prefetched
    return getChatMessages({ chatId: this.id, skip, take }, this.context)
  }

  async unreadCount() {
    const currentUserId = this.context.user?.user.id
    if (!currentUserId) return 0

    // Fall back to DataLoader for individual requests
    return await this.context.loaders.chat.unreadCount.load(
      `${this.id}:${currentUserId}`,
    )
  }
}
