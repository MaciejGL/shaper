import {
  Note as PrismaNote,
  User as PrismaUser,
  UserProfile,
} from '@prisma/client'

import { GQLNote } from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import UserPublic from '../user-public/model'

export default class Note implements GQLNote {
  constructor(
    protected data: PrismaNote & {
      createdBy?: PrismaUser & { profile?: UserProfile | null }
      replies?: (PrismaNote & {
        createdBy?: PrismaUser & { profile?: UserProfile | null }
      })[]
    },
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get text() {
    return this.data.text
  }

  get relatedTo() {
    return this.data.relatedToId
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

  get shareWithTrainer() {
    if (!this.data.metadata || typeof this.data.metadata !== 'object') {
      return null
    }
    const metadata = this.data.metadata as { shareWithTrainer?: boolean }
    return metadata.shareWithTrainer ?? null
  }

  get parentNoteId() {
    if (!this.data.metadata || typeof this.data.metadata !== 'object') {
      return null
    }
    const metadata = this.data.metadata as { parentNoteId?: string }
    return metadata.parentNoteId ?? null
  }

  get replies() {
    return (this.data.replies || []).map(
      (reply) => new Note(reply, this.context),
    )
  }

  get createdBy() {
    const user = this.data.createdBy
    if (!user) {
      throw new Error('User data not loaded')
    }

    return new UserPublic(user, this.context)
  }
}
