import {
  User as PrismaUser,
  UserProfile as PrismaUserProfile,
  UserSession as PrismaUserSession,
} from '@prisma/client'

import { GQLPublicTrainer, GQLUserRole } from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import UserProfile from '../user-profile/model'

type UserWithIncludes = PrismaUser & {
  profile?: PrismaUserProfile | null
  sessions?: PrismaUserSession[]
  _count?: {
    sessions: number
    clients: number
  }
}

export default class PublicTrainer implements GQLPublicTrainer {
  constructor(
    private readonly data: UserWithIncludes,
    private readonly context: GQLContext,
  ) {}

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

  get clientCount() {
    return this.data._count?.clients ?? 0
  }

  get sessionCount() {
    return this.data._count?.sessions ?? 0
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
    return this.data.profile?.trainerSince?.toISOString() ?? null
  }

  get isActive() {
    const lastSession = this.data.sessions?.[0]
    if (!lastSession) return false

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    return lastSession.createdAt > thirtyDaysAgo
  }
}
