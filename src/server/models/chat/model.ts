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
import User from '../user/model'

export default class Chat implements GQLChat {
  constructor(
    protected data: PrismaChat & {
      trainer?: PrismaUser | null
      client?: PrismaUser | null
      messages?: (PrismaMessage & {
        sender?: PrismaUser & {
          profile?: PrismaUserProfile | null
        }
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
    return new User(this.data.trainer, this.context)
  }

  get client() {
    if (!this.data.client) {
      throw new Error('Client data not loaded')
    }
    return new User(this.data.client, this.context)
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
    return getChatMessages({ chatId: this.id, skip, take }, this.context)
  }

  async unreadCount() {
    const currentUserId = this.context.user?.user.id
    if (!currentUserId) return 0

    const { prisma } = await import('@/lib/db')

    const count = await prisma.message.count({
      where: {
        chatId: this.id,
        senderId: { not: currentUserId }, // Messages from other person
        readAt: null,
        isDeleted: false,
      },
    })

    return count
  }
}
