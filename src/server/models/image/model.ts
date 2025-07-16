import { Image as PrismaImage } from '@prisma/client'

import { GQLImage } from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

export default class Image implements GQLImage {
  constructor(
    protected data: PrismaImage,
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get url() {
    return this.data.url
  }

  get order() {
    return this.data.order
  }

  get entityType() {
    return this.data.entityType
  }

  get entityId() {
    return this.data.entityId
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }
}
