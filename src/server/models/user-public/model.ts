import {
  User as PrismaUser,
  UserProfile as PrismaUserProfile,
} from '@prisma/client'

import { GQLUserPublic, GQLUserRole } from '@/generated/graphql-server'

export default class UserPublic implements GQLUserPublic {
  constructor(
    protected data: PrismaUser & { profile?: PrismaUserProfile | null },
  ) {}

  get id() {
    return this.data.id
  }

  get email() {
    return this.data.email
  }

  get firstName() {
    return this.data.profile?.firstName
  }

  get lastName() {
    return this.data.profile?.lastName
  }

  get image() {
    return this.data.profile?.avatarUrl
  }

  get role() {
    switch (this.data.role) {
      case GQLUserRole.Trainer:
        return GQLUserRole.Trainer
      case GQLUserRole.Client:
        return GQLUserRole.Client
      default:
        return GQLUserRole.Client
    }
  }

  get sex() {
    return this.data.profile?.sex
  }

  get birthday() {
    if (!this.data.profile?.birthday) return null
    return new Date(this.data.profile?.birthday).toISOString()
  }

  get goal() {
    return this.data.profile?.goal
  }

  get currentWeight() {
    return this.data.profile?.weight
  }

  get height() {
    return this.data.profile?.height
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }
}
