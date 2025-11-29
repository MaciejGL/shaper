import { GQLBodyProgressLog } from '@/generated/graphql-server'
import { BodyProgressLog as PrismaBodyProgressLog } from '@/generated/prisma/client'
import { ImageHandler } from '@/lib/aws/image-handler'

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

  // Generate presigned URLs for private progress images
  // URLs are valid for 24 hours and cached in Redis
  private async createImageVariants(imageUrl: string) {
    // Check if this is a progress-private image that needs presigning
    if (imageUrl.includes('progress-private')) {
      const presignedUrl = await ImageHandler.getPresignedReadUrl(
        imageUrl,
        86400, // 24 hours
      )
      return {
        thumbnail: presignedUrl,
        medium: presignedUrl,
        large: presignedUrl,
        url: presignedUrl,
      }
    }

    // For other images (legacy public URLs), return as-is
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
