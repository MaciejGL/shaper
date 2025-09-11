import { GQLBodyProgressLog } from '@/generated/graphql-server'
import { BodyProgressLog as PrismaBodyProgressLog } from '@/generated/prisma/client'
import { getOptimizedProgressImageUrl } from '@/lib/image-optimization'

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
  // Optimized image variants
  async image1() {
    return this.getOptimizedImageVariants(this.data.image1Url)
  }

  async image2() {
    return this.getOptimizedImageVariants(this.data.image2Url)
  }

  async image3() {
    return this.getOptimizedImageVariants(this.data.image3Url)
  }

  // Generate all optimized variants for an image
  private async getOptimizedImageVariants(imageUrl: string | null) {
    if (!imageUrl) return null

    const s3Key = this.extractS3Key(imageUrl)

    if (!s3Key || !s3Key.startsWith('progress-private/')) {
      // For non-private images, return basic variants
      return {
        thumbnail: imageUrl,
        medium: imageUrl,
        large: imageUrl,
        url: imageUrl,
      }
    }

    // Generate optimized variants using the utility functions
    return {
      thumbnail: getOptimizedProgressImageUrl(s3Key, 'small'),
      medium: getOptimizedProgressImageUrl(s3Key, 'medium'),
      large: getOptimizedProgressImageUrl(s3Key, 'large'),
      url: getOptimizedProgressImageUrl(s3Key, 'medium'), // Default to medium
    }
  }

  // Helper method to extract S3 key from URL (backwards compatibility)
  private extractS3Key(url: string): string {
    // New format: already an S3 key
    if (!url.startsWith('/api/images/private/')) {
      return url
    }

    // Old format: extract key from API path
    return url.replace('/api/images/private/', '')
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
