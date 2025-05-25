import { Notification as PrismaNotification } from '@prisma/client'

import {
  GQLNotification,
  GQLNotificationType,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'

import User from '../user/model'

export default class Notification implements GQLNotification {
  constructor(protected data: PrismaNotification) {}

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
    if (!this.data.createdBy) return null
    const creator = await prisma.user.findUnique({
      where: { id: this.data.createdBy },
    })
    if (!creator) return null
    return new User(creator)
  }
}
