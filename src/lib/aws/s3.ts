import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!

// Image type configurations
export const IMAGE_CONFIGS = {
  avatar: {
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.9,
    folder: 'avatars',
    maxSize: 2 * 1024 * 1024, // 2MB
    isPublic: true, // Avatars are public - visible to other users
  },
  exercise: {
    maxWidth: 800,
    maxHeight: 600,
    quality: 0.8,
    folder: 'exercises',
    maxSize: 5 * 1024 * 1024, // 5MB
    isPublic: true, // Exercise images are public content
  },
  progress: {
    maxWidth: 1200,
    maxHeight: 900,
    quality: 0.8,
    folder: 'progress-private', // Different folder for private content
    maxSize: 8 * 1024 * 1024, // 8MB
    isPublic: false, // Progress photos are private - only owner can see
  },
} as const

export type ImageType = keyof typeof IMAGE_CONFIGS

// Generate a unique file name
export function generateFileName(
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
    // For exercise images:
    // - If we have an exerciseId (editing), use it for organization
    // - If no exerciseId (temp), use exercises/temp folder
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

// Generate presigned URL for upload
export async function generatePresignedUploadUrl(
  fileName: string,
  contentType: string,
  expiresIn: number = 300, // 5 minutes
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    ContentType: contentType,
  })

  return await getSignedUrl(s3Client, command, { expiresIn })
}

// Get appropriate URL for an image based on its type
export function getImageUrl(fileName: string, imageType: ImageType): string {
  const config = IMAGE_CONFIGS[imageType]

  if (config.isPublic) {
    // For temp images, always use direct S3 URLs (CloudFront might not serve temp folder)
    if (fileName.startsWith('exercises/temp/')) {
      return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-north-1'}.amazonaws.com/${fileName}`
    }

    // For final images, use CloudFront if available
    const cloudFrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN
    if (cloudFrontDomain) {
      return `https://${cloudFrontDomain}/${fileName}`
    }
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-north-1'}.amazonaws.com/${fileName}`
  } else {
    // Private images: go through our API for authentication
    return `/api/images/private/${fileName}`
  }
}

// Legacy function - use getImageUrl instead
export function getPublicImageUrl(fileName: string): string {
  // Use CloudFront if available, otherwise use S3 direct URL
  const cloudFrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN
  if (cloudFrontDomain) {
    return `https://${cloudFrontDomain}/${fileName}`
  }
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-north-1'}.amazonaws.com/${fileName}`
}

// Generate private signed URL (for progress photos)
export async function generatePrivateImageUrl(
  fileName: string,
  expiresIn: number = 3600,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
  })

  return await getSignedUrl(s3Client, command, { expiresIn })
}

// Delete an image from S3
export async function deleteImage(fileName: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
  })

  await s3Client.send(command)
}

// Extract S3 file key from image URL
export function extractFileKeyFromUrl(imageUrl: string): string {
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

// Delete multiple images from S3
export async function deleteImages(imageUrls: string[]): Promise<void> {
  if (imageUrls.length === 0) return

  const deletePromises = imageUrls.map(async (url) => {
    const fileKey = extractFileKeyFromUrl(url)
    return deleteImage(fileKey)
  })

  await Promise.all(deletePromises)
}

// Move images from temp to final location
export async function moveImagesFromTemp(
  imageUrls: string[],
  exerciseId: string,
): Promise<string[]> {
  const movedUrls: string[] = []

  for (const url of imageUrls) {
    if (url.includes('/exercises/temp/')) {
      // Extract filename from temp URL
      const urlParts = url.split('/')
      const filename = urlParts[urlParts.length - 1]

      // Create new key in exercises folder
      const oldKey = url.split('.com/')[1] // Remove domain
      const newKey = `exercises/${exerciseId}/${filename}`

      try {
        // Copy from temp to final location
        await s3Client.send(
          new CopyObjectCommand({
            Bucket: BUCKET_NAME,
            Key: newKey,
            CopySource: `${BUCKET_NAME}/${oldKey}`,
          }),
        )

        // Delete from temp location
        await deleteImage(url)

        // Create new URL
        const newUrl = getImageUrl(newKey, 'exercise')
        movedUrls.push(newUrl)
      } catch (error) {
        console.error('Failed to move image from temp:', { url, error })
        // Keep original URL if move fails
        movedUrls.push(url)
      }
    } else {
      // Not a temp image, keep as is
      movedUrls.push(url)
    }
  }

  return movedUrls
}

// Validate image file
export function validateImageFile(
  file: File,
  type: ImageType,
): { valid: boolean; error?: string } {
  const config = IMAGE_CONFIGS[type]

  // Check file size
  if (file.size > config.maxSize) {
    return {
      valid: false,
      error: `File size must be less than ${config.maxSize / (1024 * 1024)}MB`,
    }
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPEG, PNG, and WebP images are allowed',
    }
  }

  return { valid: true }
}
