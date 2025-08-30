import { GQLLocation } from '@/generated/graphql-server'
import { Location as PrismaLocation } from '@/generated/prisma/client'

export default class Location implements GQLLocation {
  constructor(protected data: PrismaLocation) {}

  get id() {
    return this.data.id
  }

  get city() {
    return this.data.city
  }

  get country() {
    return this.data.country
  }

  get countryCode() {
    return this.data.countryCode
  }
}
