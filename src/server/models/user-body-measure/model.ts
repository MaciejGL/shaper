import { GQLUserBodyMeasure } from '@/generated/graphql-server'
import { UserBodyMeasure as PrismaUserBodyMeasure } from '@/generated/prisma/client'

export default class UserBodyMeasure implements GQLUserBodyMeasure {
  constructor(protected data: PrismaUserBodyMeasure) {}

  get id() {
    return this.data.id
  }

  get measuredAt() {
    return this.data.measuredAt.toISOString()
  }

  get weight() {
    return this.data.weight
  }

  get chest() {
    return this.data.chest
  }

  get waist() {
    return this.data.waist
  }

  get hips() {
    return this.data.hips
  }

  get neck() {
    return this.data.neck
  }

  get bicepsLeft() {
    return this.data.bicepsLeft
  }

  get bicepsRight() {
    return this.data.bicepsRight
  }

  get thighLeft() {
    return this.data.thighLeft
  }

  get thighRight() {
    return this.data.thighRight
  }

  get calfLeft() {
    return this.data.calfLeft
  }

  get calfRight() {
    return this.data.calfRight
  }

  get bodyFat() {
    return this.data.bodyFat
  }

  get notes() {
    return this.data.notes
  }
}
