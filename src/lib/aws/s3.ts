/**
 * AWS S3 Image Configuration
 * Contains only image type configurations and types
 * All S3 operations are handled by ImageHandler
 */

// Image type configurations
export const IMAGE_CONFIGS = {
  avatar: {
    folder: 'avatars',
    maxSize: 5 * 1024 * 1024, // 5MB
    isPublic: true, // Avatars are public - visible to other users
  },
  exercise: {
    folder: 'exercises',
    maxSize: 5 * 1024 * 1024, // 5MB
    isPublic: true, // Exercise images are public content
  },
  progress: {
    folder: 'progress-private', // Private folder for progress images
    maxSize: 15 * 1024 * 1024, // 15MB
    isPublic: false, // Progress photos are private - served via /api/images/private/
  },
  trainerCertificate: {
    folder: 'trainer-certificates',
    maxSize: 15 * 1024 * 1024, // 15MB
    isPublic: true, // Certificates are publicly viewable on trainer profiles
  },
  trainerCardBackground: {
    folder: 'trainer-card-backgrounds',
    maxSize: 15 * 1024 * 1024, // 15MB
    isPublic: true, // Publicly viewable on trainer promo cards
  },
} as const

export type ImageType = keyof typeof IMAGE_CONFIGS

// Re-export the centralized image handler for convenience
export { ImageHandler } from './image-handler'
