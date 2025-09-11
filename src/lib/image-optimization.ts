/**
 * Image optimization utilities using Sharp for on-demand processing
 * This file contains helpers for generating optimized image URLs
 */
import { ImageHandler } from './aws/image-handler'

export type ImageSize = 'thumbnail' | 'small' | 'medium' | 'large' | 'original'

export const IMAGE_SIZE_CONFIGS = {
  thumbnail: { width: 150, height: 200, quality: 70 },
  small: { width: 300, height: 400, quality: 80 },
  medium: { width: 600, height: 800, quality: 85 },
  large: { width: 900, height: 1200, quality: 90 },
  original: { quality: 95 }, // No resize, just optimize
} as const

/**
 * Generate optimized image URL for progress photos
 */
export function getOptimizedProgressImageUrl(
  s3Key: string,
  size: ImageSize = 'medium',
): string {
  const config = IMAGE_SIZE_CONFIGS[size]

  return ImageHandler.getOptimizedImageUrl(s3Key, {
    ...('width' in config && { width: config.width }),
    ...('height' in config && { height: config.height }),
    quality: config.quality,
    format: 'webp', // Modern format for best compression
  })
}

/**
 * Generate responsive image sources for different screen sizes
 */
export function getResponsiveImageSources(s3Key: string) {
  return {
    // Mobile
    small: getOptimizedProgressImageUrl(s3Key, 'small'),
    // Tablet
    medium: getOptimizedProgressImageUrl(s3Key, 'medium'),
    // Desktop
    large: getOptimizedProgressImageUrl(s3Key, 'large'),
    // Original for detailed analysis
    original: getOptimizedProgressImageUrl(s3Key, 'original'),
  }
}

/**
 * Generate Next.js Image component props for responsive images
 */
export function getResponsiveImageProps(s3Key: string) {
  const sources = getResponsiveImageSources(s3Key)

  return {
    src: sources.medium, // Default fallback
    sizes: '(max-width: 640px) 300px, (max-width: 1024px) 600px, 900px',
    // Optional: Generate srcSet if needed
    // srcSet: `${sources.small} 300w, ${sources.medium} 600w, ${sources.large} 900w`
  }
}
