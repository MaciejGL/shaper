import { Note as PrismaNote } from '@prisma/client'

import { GQLNote } from '@/generated/graphql-server'

export default class Note implements GQLNote {
  constructor(protected data: PrismaNote) {}

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
}
