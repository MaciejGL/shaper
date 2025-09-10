import type { ImageLoaderProps } from 'next/image'

/**
 * Custom image loader that handles both public and private images
 * Routes private images through our optimization API with authentication
 */
export default function customImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  // For private images, route through our optimization API
  if (src.startsWith('/api/images/private/')) {
    // Extract the S3 key from the API path
    const s3Key = src.replace('/api/images/private/', '')

    // Build optimization parameters
    const params = new URLSearchParams({
      key: s3Key,
      w: width.toString(),
      q: (quality || 75).toString(),
    })

    return `/api/images/optimized?${params.toString()}`
  }

  // For public images (CloudFront/S3), add optimization parameters
  if (src.includes('cloudfront.net') || src.includes('amazonaws.com')) {
    const url = new URL(src)
    url.searchParams.set('w', width.toString())
    url.searchParams.set('q', (quality || 75).toString())
    return url.toString()
  }

  // For other images (external, relative), return as-is with basic params
  const separator = src.includes('?') ? '&' : '?'
  return `${src}${separator}w=${width}&q=${quality || 75}`
}
