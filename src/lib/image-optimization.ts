/**
 * Image optimization utilities using Sharp for on-demand processing
 * This file contains helpers for generating optimized image URLs
 */
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import sharp from 'sharp'

import { BUCKET_NAME, s3Client } from './aws/image-handler'

// Image optimization utilities are now focused on exercise images only
// Progress images are stored as public S3 URLs without optimization

/**
 * Process exercise image to create optimized versions stored in S3
 * Downloads original, creates variants, uploads to S3, returns stored URLs
 */
export async function processExerciseImageToOptimized(
  originalUrl: string,
): Promise<{
  thumbnail: string | null
  medium: string | null
  large: string | null
}> {
  try {
    // Extract S3 key from the original URL
    const s3Key = extractS3KeyFromUrl(originalUrl)
    if (!s3Key) {
      console.error('Could not extract S3 key from URL:', originalUrl)
      return { thumbnail: null, medium: null, large: null }
    }

    // Create and store optimized variants
    const variants = await createAndStoreImageVariants(s3Key)

    return variants
  } catch (error) {
    console.error('Error processing exercise image:', error)
    return { thumbnail: null, medium: null, large: null }
  }
}

/**
 * Create and store image variants in S3
 * Downloads original, processes with Sharp, uploads variants
 */
async function createAndStoreImageVariants(originalS3Key: string): Promise<{
  thumbnail: string | null
  medium: string | null
  large: string | null
}> {
  try {
    // Download original image from S3
    const getObjectResponse = await s3Client.send(
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: originalS3Key,
      }),
    )

    if (!getObjectResponse.Body) {
      throw new Error('Could not retrieve original image from S3')
    }

    // Convert stream to buffer
    const originalBuffer = await getObjectResponse.Body.transformToByteArray()
    const imageBuffer = Buffer.from(originalBuffer)

    // Create base filename from original key
    const pathParts = originalS3Key.split('/')
    const filename = pathParts[pathParts.length - 1]
    const filenameWithoutExt = filename.split('.')[0]
    const basePath = pathParts.slice(0, -1).join('/')

    // Process and upload variants
    const variants = {
      thumbnail: null as string | null,
      medium: null as string | null,
      large: null as string | null,
    }

    // Create thumbnail (150x200)
    try {
      const thumbnailBuffer = await sharp(imageBuffer)
        .resize(150, 200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 70 })
        .toBuffer()

      const thumbnailKey = `${basePath}/${filenameWithoutExt}_thumbnail.webp`

      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: thumbnailKey,
          Body: thumbnailBuffer,
          ContentType: 'image/webp',
        }),
      )

      variants.thumbnail = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-north-1'}.amazonaws.com/${thumbnailKey}`
    } catch (error) {
      console.error('Error creating thumbnail:', error)
    }

    // Create medium (400x500)
    try {
      const mediumBuffer = await sharp(imageBuffer)
        .resize(400, 500, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer()

      const mediumKey = `${basePath}/${filenameWithoutExt}_medium.webp`

      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: mediumKey,
          Body: mediumBuffer,
          ContentType: 'image/webp',
        }),
      )

      variants.medium = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-north-1'}.amazonaws.com/${mediumKey}`
    } catch (error) {
      console.error('Error creating medium variant:', error)
    }

    // Create large (800x1000)
    try {
      const largeBuffer = await sharp(imageBuffer)
        .resize(800, 1000, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer()

      const largeKey = `${basePath}/${filenameWithoutExt}_large.webp`

      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: largeKey,
          Body: largeBuffer,
          ContentType: 'image/webp',
        }),
      )

      variants.large = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-north-1'}.amazonaws.com/${largeKey}`
    } catch (error) {
      console.error('Error creating large variant:', error)
    }

    return variants
  } catch (error) {
    console.error('Error creating image variants:', error)
    return { thumbnail: null, medium: null, large: null }
  }
}

/**
 * Delete all image variants (original, thumbnail, medium, large) from S3
 */
export async function deleteExerciseImageVariants(
  originalUrl: string,
): Promise<boolean> {
  try {
    // Extract S3 key from the original URL
    const originalS3Key = extractS3KeyFromUrl(originalUrl)
    if (!originalS3Key) {
      console.error('Could not extract S3 key from URL:', originalUrl)
      return false
    }

    // Generate keys for all variants
    const pathParts = originalS3Key.split('/')
    const filename = pathParts[pathParts.length - 1]
    const filenameWithoutExt = filename.split('.')[0]
    const basePath = pathParts.slice(0, -1).join('/')

    const keysToDelete = [
      originalS3Key, // Original image
      `${basePath}/${filenameWithoutExt}_thumbnail.webp`,
      `${basePath}/${filenameWithoutExt}_medium.webp`,
      `${basePath}/${filenameWithoutExt}_large.webp`,
    ]

    // Delete all variants
    const deletePromises = keysToDelete.map(async (key) => {
      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
          }),
        )
        // S3 object deleted successfully
      } catch (error) {
        console.error(`Failed to delete S3 object ${key}:`, error)
        // Don't throw - continue deleting other variants
      }
    })

    await Promise.all(deletePromises)
    return true
  } catch (error) {
    console.error('Error deleting image variants:', error)
    return false
  }
}

/**
 * Extract S3 key from various URL formats
 */
function extractS3KeyFromUrl(url: string): string | null {
  try {
    // Handle direct S3 URLs
    if (url.includes('.amazonaws.com/')) {
      return url.split('.amazonaws.com/')[1]
    }

    // Handle CloudFront URLs (e.g., https://d1ahv5z4h61wkv.cloudfront.net/path/to/file)
    if (url.includes('.cloudfront.net/')) {
      return url.split('.cloudfront.net/')[1]
    }

    // Handle local development URLs
    if (url.startsWith('/api/images/private/')) {
      return url.replace('/api/images/private/', '')
    }

    // If it's already an S3 key format
    if (url.includes('/') && !url.startsWith('http')) {
      return url
    }

    return null
  } catch (error) {
    console.error('Error extracting S3 key:', error)
    return null
  }
}
