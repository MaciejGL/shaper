import { GQLReview } from '@/generated/graphql-server'
import {
  UserProfile as PrismaProfile,
  Review as PrismaReview,
  User as PrismaUser,
} from '@/generated/prisma/client'
import { GQLContext } from '@/types/gql-context'

export default class Review implements GQLReview {
  constructor(
    protected data: PrismaReview & {
      createdBy: (PrismaUser & { profile: PrismaProfile | null }) | null
    },
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get rating() {
    return this.data.rating
  }

  get comment() {
    if (!this.data.comment) {
      return ''
    }

    return this.data.comment
  }

  get isEdited() {
    return this.data.isEdited
  }

  get isHidden() {
    return this.data.isHidden
  }

  get flagged() {
    return this.data.flagged
  }

  get flagReason() {
    return this.data.flagReason
  }

  get creatorName() {
    if (!this.data.createdBy?.profile) {
      return null
    }

    if (
      !this.data.createdBy.profile.firstName ||
      !this.data.createdBy.profile.lastName
    ) {
      return null
    }

    return `${this.data.createdBy.profile.firstName} ${this.data.createdBy.profile.lastName}`
  }

  get createdById() {
    return this.data.createdById
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }
}
