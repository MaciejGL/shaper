import { GQLPublicTrainer, GQLUserRole } from '@/generated/graphql-server'
import {
  User as PrismaUser,
  UserProfile as PrismaUserProfile,
} from '@/generated/prisma/client'

import UserProfile from '../user-profile/model'

type UserWithIncludes = PrismaUser & {
  profile?: PrismaUserProfile | null
  _count?: {
    clients: number
  }
}

export default class PublicTrainer implements GQLPublicTrainer {
  constructor(private readonly data: UserWithIncludes) {}

  get id() {
    return this.data.id
  }

  get name() {
    return this.data.name
  }

  get role() {
    return this.data.role as GQLUserRole
  }

  get profile() {
    return this.data.profile ? new UserProfile(this.data.profile) : null
  }

  get email() {
    return this.data.email ?? null
  }

  get clientCount() {
    return this.data._count?.clients ?? 0
  }

  get specialization() {
    return this.data.profile?.specialization ?? []
  }

  get credentials() {
    return this.data.profile?.credentials ?? []
  }

  get successStories() {
    return this.data.profile?.successStories ?? []
  }

  get trainerSince() {
    if (!this.data.profile?.trainerSince) return null
    if (typeof this.data.profile?.trainerSince === 'string') {
      return this.data.profile?.trainerSince
    }

    return this.data.profile?.trainerSince?.toISOString() ?? null
  }

  get capacity() {
    return this.data.capacity ?? null
  }

  get spotsLeft() {
    if (!this.data.capacity) return null
    const clientCount = this.data._count?.clients ?? 0
    return Math.max(0, this.data.capacity - clientCount)
  }

  get isAtCapacity() {
    if (!this.data.capacity) return false
    const clientCount = this.data._count?.clients ?? 0
    return clientCount >= this.data.capacity
  }
}
