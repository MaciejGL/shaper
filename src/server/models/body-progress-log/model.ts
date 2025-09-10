import { GQLBodyProgressLog } from '@/generated/graphql-server'
import { BodyProgressLog as PrismaBodyProgressLog } from '@/generated/prisma/client'

export default class BodyProgressLog implements GQLBodyProgressLog {
  constructor(protected data: PrismaBodyProgressLog) {}

  get id() {
    return this.data.id
  }

  get loggedAt() {
    return this.data.loggedAt.toISOString()
  }

  get notes() {
    return this.data.notes
  }
  // Front view
  get image1Url() {
    return this.data.image1Url
  }

  // Side view
  get image2Url() {
    return this.data.image2Url
  }

  // Back view
  get image3Url() {
    return this.data.image3Url
  }

  get shareWithTrainer() {
    return this.data.shareWithTrainer
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }
}
