import {
  Notification as PrismaNotification,
  User as PrismaUser,
} from '@prisma/client'
import { GraphQLError } from 'graphql'

import {
  GQLNotification,
  GQLNotificationType,
} from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import User from '../user/model'

export default class Notification implements GQLNotification {
  constructor(
    protected data: PrismaNotification & {
      creator?: PrismaUser | null
    },
    protected context: GQLContext,
  ) {}

  // Scalar fields
  get id() {
    return this.data.id
  }

  get message() {
    return this.data.message
  }

  get type(): GQLNotificationType {
    // Ensure type matches your enum
    return this.data.type as GQLNotificationType
  }

  get read() {
    return this.data.read
  }

  get link() {
    return this.data.link
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get createdBy() {
    return this.data.createdBy
  }

  get relatedItemId() {
    return this.data.relatedItemId
  }

  async creator() {
    if (this.data.creator) {
      return new User(this.data.creator, this.context)
    } else {
      console.error(
        `[Notification] No creator found for notification ${this.id}. Loading from database.`,
      )
      throw new GraphQLError('No creator found for notification')
    }
  }
}
