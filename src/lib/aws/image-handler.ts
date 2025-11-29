import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { cache } from '../cache'

import { IMAGE_CONFIGS, type ImageType } from './s3'

// Re-export ImageType for easier imports
export type { ImageType }

// Initialize S3 client
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!

export interface ImageOperationResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// Specific result types for each operation
export interface UploadResult {
  presignedUrl: string
  finalUrl: string
  displayUrl: string
  s3FileName: string
  expiresIn: number
}

export interface DeleteResult {
  deletedCount: number
}

export interface MoveResult {
  movedUrls: string[]
}

export interface UrlResult {
  url: string
  type: 'public' | 'private'
  expiresIn?: number
}

export interface UploadConfig {
  fileName: string
  contentType: string
  imageType: ImageType
  userId: string
  relatedId?: string
  expiresIn?: number
}

export interface DeleteConfig {
  images: string | string[]
}

export interface MoveConfig {
  fromUrls: string[]
  toId: string
  imageType: ImageType
}

export interface UrlConfig {
  fileName: string
  imageType: ImageType
  expiresIn?: number
}

/**
 * Centralized handler for all image operations across AWS S3
 * Handles both public and private images with unified interface
 */
export class ImageHandler {
  /**
   * Generate presigned upload URL and return upload configuration
   */
  static async upload(
    config: UploadConfig,
  ): Promise<ImageOperationResult<UploadResult>> {
    try {
      const {
        fileName,
        contentType,
        imageType,
        userId,
        relatedId,
        expiresIn = 300,
      } = config

      // Validate inputs
      const validation = this.validateFile({ contentType, imageType })
      if (!validation.success) {
        return {
          success: false,
          error: validation.error,
        }
      }

      // Generate unique file name
      const s3FileName = this.generateFileName(
        fileName,
        userId,
        imageType,
        relatedId,
      )

      // Generate presigned URL
      const presignedUrl = await this.generatePresignedUrl(
        s3FileName,
        contentType,
        expiresIn,
      )

      // Get final URL for the image
      const finalUrl = this.getImageUrl(s3FileName, imageType)

      // For private images, also generate a signed URL for immediate display
      let displayUrl = finalUrl
      if (!IMAGE_CONFIGS[imageType].isPublic) {
        displayUrl = await this.generateSignedUrl(s3FileName, 3600) // 1 hour for display
      }

      return {
        success: true,
        data: {
          presignedUrl,
          finalUrl, // S3 key for storage
          displayUrl, // Signed URL for immediate display
          s3FileName,
          expiresIn,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      }
    }
  }

  /**
   * Delete single or multiple images
   */
  static async delete(
    config: DeleteConfig,
  ): Promise<ImageOperationResult<DeleteResult>> {
    try {
      const images = Array.isArray(config.images)
        ? config.images
        : [config.images]

      if (images.length === 0) {
        return { success: true, data: { deletedCount: 0 } }
      }

      const deletePromises = images.map(async (imageUrl) => {
        const fileKey = this.extractFileKey(imageUrl)
        return this.deleteFromS3(fileKey)
      })

      await Promise.all(deletePromises)

      return {
        success: true,
        data: { deletedCount: images.length },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed',
      }
    }
  }

  /**
   * Move images from temp to final location
   */
  static async move(
    config: MoveConfig,
  ): Promise<ImageOperationResult<MoveResult>> {
    try {
      const { fromUrls, toId, imageType } = config
      const movedUrls: string[] = []

      for (const url of fromUrls) {
        if (url.includes('/temp/')) {
          const moveResult = await this.moveFromTemp(url, toId, imageType)
          movedUrls.push(moveResult)
        } else {
          movedUrls.push(url)
        }
      }

      return {
        success: true,
        data: { movedUrls },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Move failed',
      }
    }
  }

  /**
   * Get appropriate URL for an image (public or signed)
   */
  static async getUrl(
    config: UrlConfig,
  ): Promise<ImageOperationResult<UrlResult>> {
    try {
      const { fileName, imageType, expiresIn = 3600 } = config
      const imageConfig = IMAGE_CONFIGS[imageType]

      if (imageConfig.isPublic) {
        const publicUrl = this.getImageUrl(fileName, imageType)
        return {
          success: true,
          data: { url: publicUrl, type: 'public' },
        }
      } else {
        const signedUrl = await this.generateSignedUrl(fileName, expiresIn)
        return {
          success: true,
          data: { url: signedUrl, type: 'private', expiresIn },
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'URL generation failed',
      }
    }
  }

  /**
   * Convert S3 key to display URL (for existing images)
   * Useful for converting stored S3 keys to displayable URLs
   */
  static async getDisplayUrl(
    s3Key: string,
  ): Promise<ImageOperationResult<UrlResult>> {
    try {
      // Determine image type from S3 key path
      let imageType: ImageType
      if (
        s3Key.startsWith('progress-public/') ||
        s3Key.startsWith('progress-private/')
      ) {
        imageType = 'progress'
      } else if (s3Key.startsWith('avatars/')) {
        imageType = 'avatar'
      } else if (s3Key.startsWith('exercises/')) {
        imageType = 'exercise'
      } else {
        return {
          success: false,
          error: 'Could not determine image type from S3 key',
        }
      }

      return await this.getUrl({
        fileName: s3Key,
        imageType,
      })
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Display URL generation failed',
      }
    }
  }

  /**
   * Validate file before upload
   */
  static validateFile({
    contentType,
    imageType,
  }: Pick<
    UploadConfig,
    'contentType' | 'imageType'
  >): ImageOperationResult<void> {
    // Validate image type
    if (!Object.keys(IMAGE_CONFIGS).includes(imageType)) {
      return {
        success: false,
        error: `Invalid image type. Must be: ${Object.keys(IMAGE_CONFIGS).join(', ')}`,
      }
    }

    // Validate content type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(contentType)) {
      return {
        success: false,
        error: 'Invalid content type. Only JPEG, PNG, and WebP are allowed',
      }
    }

    return { success: true }
  }

  // Private helper methods
  private static generateFileName(
    originalName: string,
    userId: string,
    type: ImageType,
    id?: string,
  ): string {
    const timestamp = Date.now()
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const folder = IMAGE_CONFIGS[type].folder

    if (type === 'avatar') {
      return `${folder}/${userId}/${timestamp}-${sanitizedName}`
    } else if (type === 'exercise') {
      if (id) {
        return `${folder}/${id}/${timestamp}-${sanitizedName}`
      } else {
        return `exercises/temp/${userId}/${timestamp}-${sanitizedName}`
      }
    } else if (type === 'progress') {
      return `${folder}/${userId}/${timestamp}-${sanitizedName}`
    }

    throw new Error('Invalid image type or missing required parameters')
  }

  private static async generatePresignedUrl(
    fileName: string,
    contentType: string,
    expiresIn: number,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      ContentType: contentType,
    })

    return await getSignedUrl(s3Client, command, { expiresIn })
  }

  private static getImageUrl(fileName: string, imageType: ImageType): string {
    const config = IMAGE_CONFIGS[imageType]

    if (config.isPublic) {
      // For temp images, always use direct S3 URLs
      if (fileName.includes('/temp/')) {
        return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-north-1'}.amazonaws.com/${fileName}`
      }

      // For final images, use CloudFront if available
      const cloudFrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN
      if (cloudFrontDomain) {
        return `https://${cloudFrontDomain}/${fileName}`
      }
      return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-north-1'}.amazonaws.com/${fileName}`
    } else {
      // Private images: return S3 key directly (will be converted to signed URL when needed)
      return fileName
    }
  }

  private static async generateSignedUrl(
    fileName: string,
    expiresIn: number,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    })

    return await getSignedUrl(s3Client, command, { expiresIn })
  }

  /**
   * Generate a presigned URL for reading a private image
   * Use this for progress photos and other private content
   * Cached in Redis to avoid regenerating on every request
   * @param s3Url - The S3 URL or key (e.g., https://bucket.s3.region.amazonaws.com/key or just the key)
   * @param expiresIn - URL validity in seconds (default: 24 hours)
   */
  static async getPresignedReadUrl(
    s3Url: string,
    expiresIn: number = 86400, // Default 24 hours
  ): Promise<string> {
    // Extract the S3 key from the URL if it's a full URL
    const s3Key = this.extractFileKey(s3Url)

    // Try to get from cache first

    const cacheKey = cache.keys.images.presignedUrl(s3Key)

    // Use cache.getOrSet to handle cache miss/hit automatically
    return await cache.getOrSet(
      cacheKey,
      () => this.generateSignedUrl(s3Key, expiresIn),
      expiresIn - 3600, // Cache for 1 hour less than URL expiry for safety
    )
  }

  /**
   * Generate optimized image URL with on-demand processing
   */
  static getOptimizedImageUrl(
    s3Key: string,
    options: {
      width?: number
      height?: number
      quality?: number
      format?: 'webp' | 'jpeg' | 'png'
    } = {},
  ): string {
    const params = new URLSearchParams()
    params.set('key', s3Key)

    if (options.width) params.set('w', options.width.toString())
    if (options.height) params.set('h', options.height.toString())
    if (options.quality) params.set('q', options.quality.toString())
    if (options.format) params.set('f', options.format)

    return `/api/images/process?${params.toString()}`
  }

  private static async deleteFromS3(fileName: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    })

    await s3Client.send(command)
  }

  private static extractFileKey(imageUrl: string): string {
    const cloudFrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN
    const s3Domain = `${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-north-1'}.amazonaws.com`

    // Remove protocol and domain to get the file key
    if (cloudFrontDomain && imageUrl.includes(cloudFrontDomain)) {
      return imageUrl.replace(`https://${cloudFrontDomain}/`, '')
    } else if (imageUrl.includes(s3Domain)) {
      return imageUrl.replace(`https://${s3Domain}/`, '')
    }

    // If it's already just a file key, return as is
    return imageUrl
  }

  private static async moveFromTemp(
    tempUrl: string,
    toId: string,
    imageType: ImageType,
  ): Promise<string> {
    // Extract filename from temp URL
    const urlParts = tempUrl.split('/')
    const filename = urlParts[urlParts.length - 1]

    // Create new key in final location
    const oldKey = this.extractFileKey(tempUrl)
    const newKey = `${IMAGE_CONFIGS[imageType].folder}/${toId}/${filename}`

    // Copy from temp to final location
    await s3Client.send(
      new CopyObjectCommand({
        Bucket: BUCKET_NAME,
        Key: newKey,
        CopySource: `${BUCKET_NAME}/${oldKey}`,
      }),
    )

    // Delete from temp location
    await this.deleteFromS3(oldKey)

    // Return new URL
    return this.getImageUrl(newKey, imageType)
  }
}
