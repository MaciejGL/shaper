import { CoachingRequest as PrismaCoachingRequest } from '@prisma/client'

import {
  GQLCoachingRequest,
  GQLCoachingRequestStatus,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

import User from '../user/model'

export default class CoachingRequest implements GQLCoachingRequest {
  constructor(
    protected data: PrismaCoachingRequest,
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
}
