import {
  User as PrismaUser,
  UserProfile as PrismaUserProfile,
  UserSession as PrismaUserSession,
} from '@prisma/client'

import { GQLAdminUserListItem, GQLUserRole } from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import UserProfile from '../user-profile/model'
import UserPublic from '../user-public/model'

type UserWithIncludes = PrismaUser & {
  profile?: PrismaUserProfile | null
  trainer?: (PrismaUser & { profile?: PrismaUserProfile | null }) | null
  sessions?: PrismaUserSession[]
  _count?: {
    sessions: number
    clients: number
  }
}

export default class AdminUserListItem implements GQLAdminUserListItem {
  constructor(
    protected data: UserWithIncludes,
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get email() {
    return this.data.email
  }

  get name() {
    return this.data.name
  }

  get role() {
    return this.data.role as GQLUserRole
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }

  get lastLoginAt() {
    const lastSession = this.data.sessions?.[0]
    return lastSession?.createdAt?.toISOString() || null
  }

  get sessionCount() {
    return this.data._count?.sessions ?? 0
  }

  get profile() {
    return this.data.profile ? new UserProfile(this.data.profile) : null
  }

  get trainer() {
    return this.data.trainer
      ? new UserPublic(this.data.trainer, this.context)
      : null
  }

  get clientCount() {
    return this.data._count?.clients ?? 0
  }

  get isActive() {
    const lastSession = this.data.sessions?.[0]
    if (!lastSession) return false

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    return lastSession.createdAt > thirtyDaysAgo
  }
}
