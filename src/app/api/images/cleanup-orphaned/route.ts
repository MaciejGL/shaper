import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3'
import { NextResponse } from 'next/server'

import { deleteImages } from '@/lib/aws/s3'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/getUser'

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!

export async function POST() {
  try {
    // Check authentication and admin permissions
    const user = await getCurrentUser()
    if (!user || user.user.role !== 'TRAINER') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 },
      )
    }

    // Get all exercise images from S3
    const s3Objects: string[] = []
    let continuationToken: string | undefined

    do {
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: 'exercises/',
        ContinuationToken: continuationToken,
      })

      const response = await s3Client.send(command)

      if (response.Contents) {
        s3Objects.push(
          ...response.Contents.map((obj) => obj.Key!).filter(Boolean),
        )
      }

      continuationToken = response.NextContinuationToken
    } while (continuationToken)

    // Get all exercise images from database
    const dbImages = await prisma.image.findMany({
      where: { entityType: 'exercise' },
      select: { url: true },
    })

    // Extract file keys from database URLs
    const cloudFrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN
    const s3Domain = `${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-north-1'}.amazonaws.com`

    const dbFileKeys = dbImages.map((img) => {
      const url = img.url
      if (cloudFrontDomain && url.includes(cloudFrontDomain)) {
        return url.replace(`https://${cloudFrontDomain}/`, '')
      } else if (url.includes(s3Domain)) {
        return url.replace(`https://${s3Domain}/`, '')
      }
      return url
    })

    // Find orphaned files (in S3 but not in DB)
    const orphanedFiles = s3Objects.filter(
      (s3Key) => !dbFileKeys.includes(s3Key),
    )

    // Delete orphaned files
    if (orphanedFiles.length > 0) {
      // Convert back to full URLs for deleteImages function
      const orphanedUrls = orphanedFiles.map((key) => {
        if (cloudFrontDomain) {
          return `https://${cloudFrontDomain}/${key}`
        }
        return `https://${s3Domain}/${key}`
      })

      await deleteImages(orphanedUrls)
    }

    return NextResponse.json({
      success: true,
      cleaned: orphanedFiles.length,
      orphanedFiles: orphanedFiles,
    })
  } catch (error) {
    console.error('Error cleaning up orphaned images:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup orphaned images' },
      { status: 500 },
    )
  }
}
