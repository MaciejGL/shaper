import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3'
import { NextRequest, NextResponse } from 'next/server'

import { requireModeratorUser } from '@/lib/admin-auth'

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!
const CLOUDFRONT_DOMAIN = process.env.AWS_CLOUDFRONT_DOMAIN

interface S3Image {
  key: string
  url: string
  size: number
  lastModified: string
}

export async function GET(request: NextRequest) {
  try {
    await requireModeratorUser()

    const { searchParams } = request.nextUrl
    const continuationToken = searchParams.get('continuationToken') || undefined
    const limit = parseInt(searchParams.get('limit') || '100')
    const search = searchParams.get('search') || ''

    const images: S3Image[] = []
    let nextContinuationToken: string | undefined = continuationToken
    let hasMore = true

    // Fetch images until we have enough or no more pages
    while (images.length < limit && hasMore) {
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: 'exercises/',
        ContinuationToken: nextContinuationToken,
        MaxKeys: 1000,
      })

      const response = await s3Client.send(command)

      if (response.Contents) {
        const validImages = response.Contents.filter((obj) => {
          if (!obj.Key || !obj.LastModified || !obj.Size) return false

          // Exclude temp folder
          if (obj.Key.startsWith('exercises/temp/')) return false

          // Exclude variant images (thumbnails, medium, large versions)
          if (
            obj.Key.includes('_thumbnail.') ||
            obj.Key.includes('_medium.') ||
            obj.Key.includes('_large.')
          ) {
            return false
          }

          // Only include image files
          const ext = obj.Key.split('.').pop()?.toLowerCase()
          if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')) {
            return false
          }

          // Apply search filter
          if (search) {
            const filename = obj.Key.split('/').pop() || ''
            if (!filename.toLowerCase().includes(search.toLowerCase())) {
              return false
            }
          }

          return true
        }).map((obj) => ({
          key: obj.Key!,
          url: getImageUrl(obj.Key!),
          size: obj.Size!,
          lastModified: obj.LastModified!.toISOString(),
        }))

        images.push(...validImages)
      }

      nextContinuationToken = response.NextContinuationToken
      hasMore = !!response.IsTruncated
    }

    // Trim to limit and get continuation token for next page
    const trimmedImages = images.slice(0, limit)
    const returnContinuationToken =
      images.length > limit ? nextContinuationToken : undefined

    return NextResponse.json({
      success: true,
      images: trimmedImages,
      hasMore: hasMore || images.length > limit,
      continuationToken: returnContinuationToken,
      count: trimmedImages.length,
    })
  } catch (error) {
    console.error('Error listing S3 images:', error)

    if (
      error instanceof Error &&
      error.message.includes('Moderator access required')
    ) {
      return NextResponse.json(
        { error: 'Moderator access required' },
        { status: 403 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to list S3 images' },
      { status: 500 },
    )
  }
}

function getImageUrl(key: string): string {
  if (CLOUDFRONT_DOMAIN) {
    return `https://${CLOUDFRONT_DOMAIN}/${key}`
  }
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-north-1'}.amazonaws.com/${key}`
}

