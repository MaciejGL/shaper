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

  // Simple image variants - just return the direct S3 URLs
  async image1() {
    return this.data.image1Url
      ? this.createImageVariants(this.data.image1Url)
      : null
  }

  async image2() {
    return this.data.image2Url
      ? this.createImageVariants(this.data.image2Url)
      : null
  }

  async image3() {
    return this.data.image3Url
      ? this.createImageVariants(this.data.image3Url)
      : null
  }

  // Create simple image variants that all point to the same public S3 URL
  private createImageVariants(imageUrl: string) {
    return {
      thumbnail: imageUrl,
      medium: imageUrl,
      large: imageUrl,
      url: imageUrl,
    }
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
