import { GQLTeam } from '@/generated/graphql-server'
import {
  Location as PrismaLocation,
  Team as PrismaTeam,
} from '@/generated/prisma/client'

import Location from '../location/model'

export default class Team implements GQLTeam {
  constructor(
    protected data: PrismaTeam & {
      location: PrismaLocation
      _count?: {
        members: number
      }
    },
  ) {}

  get id() {
    return this.data.id
  }

  get name() {
    return this.data.name
  }

  get location() {
    return new Location(this.data.location)
  }

  get memberCount() {
    return this.data._count?.members || 0
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }
}
