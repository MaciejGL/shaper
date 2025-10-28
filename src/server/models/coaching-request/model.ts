import {
  GQLCoachingRequest,
  GQLCoachingRequestStatus,
} from '@/generated/graphql-server'
import {
  CoachingRequest as PrismaCoachingRequest,
  User as PrismaUser,
  UserProfile as PrismaUserProfile,
} from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

import User from '../user/model'

type CoachingRequestWithRelations = PrismaCoachingRequest & {
  sender?:
    | (Pick<PrismaUser, 'id' | 'email'> & {
        profile?: Pick<PrismaUserProfile, 'firstName' | 'lastName'> | null
      })
    | null
  recipient?:
    | (Pick<PrismaUser, 'id' | 'email'> & {
        profile?: Pick<PrismaUserProfile, 'firstName' | 'lastName'> | null
      })
    | null
}

export default class CoachingRequest implements GQLCoachingRequest {
  constructor(
    protected data: CoachingRequestWithRelations,
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get status() {
    return this.data.status as GQLCoachingRequestStatus
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

  async recipient() {
    // Use preloaded data if available
    if (this.data.recipient) {
      return new User(this.data.recipient as PrismaUser, this.context)
    }

    // Fallback to database query if not preloaded
    console.error(
      `[CoachingRequest] Making database query for recipient user in request ${this.id}. This could cause N+1 queries.`,
    )
    const user = await prisma.user.findUnique({
      where: { id: this.data.recipientId },
    })

    if (!user) {
      console.error('[COACHING-REQUEST] Recipient not found')
      throw null
    }

    return new User(user, this.context)
  }

  async sender() {
    // Use preloaded data if available
    if (this.data.sender) {
      return new User(this.data.sender as PrismaUser, this.context)
    }

    // Fallback to database query if not preloaded
    console.error(
      `[CoachingRequest] Making database query for sender user in request ${this.id}. This could cause N+1 queries.`,
    )
    const user = await prisma.user.findUnique({
      where: { id: this.data.senderId },
    })

    if (!user) {
      console.error('[COACHING-REQUEST] Sender not found')
      throw null
    }

    return new User(user, this.context)
  }

  get interestedServices() {
    return this.data.interestedServices
  }
}
