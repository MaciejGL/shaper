/**
 * AWS S3 Image Configuration
 * Contains only image type configurations and types
 * All S3 operations are handled by ImageHandler
 */

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
    maxWidth: 1200, // Keep original high quality for detailed analysis
    maxHeight: 1600, // Portrait aspect ratio (3:4)
    quality: 0.9, // High quality originals for professional analysis
    folder: 'progress-private', // Private folder for progress images
    maxSize: 8 * 1024 * 1024, // 8MB for high quality originals
    isPublic: false, // Progress photos are private - served via /api/images/private/
  },
  trainerCertificate: {
    maxWidth: 2000, // Keep high resolution for certificates
    maxHeight: 2000,
    quality: 0.9,
    folder: 'trainer-certificates',
    maxSize: 10 * 1024 * 1024, // 10MB for high quality certificates/PDFs
    isPublic: true, // Certificates are publicly viewable on trainer profiles
  },
} as const

export type ImageType = keyof typeof IMAGE_CONFIGS

// Re-export the centralized image handler for convenience
export { ImageHandler } from './image-handler'
