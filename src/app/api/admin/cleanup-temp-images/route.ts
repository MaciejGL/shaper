import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3'
import { NextRequest, NextResponse } from 'next/server'

import { requireAdminUser } from '@/lib/admin-auth'
import { deleteImages } from '@/lib/aws/s3'

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!

interface TempCleanupRequest {
  dryRun?: boolean
  maxAge?: number // Age in hours, defaults to 24
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    await requireAdminUser()

    // Parse request body
    const body: TempCleanupRequest = await request.json().catch(() => ({}))
    const { dryRun = false, maxAge = 24 } = body

    // Calculate cutoff time
    const cutoffTime = new Date(Date.now() - maxAge * 60 * 60 * 1000)

    // Get all temp folder objects from S3
    const tempObjects: { key: string; lastModified: Date; size: number }[] = []
    let continuationToken: string | undefined

    do {
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: 'exercises/temp/',
        ContinuationToken: continuationToken,
      })

      const response = await s3Client.send(command)

      if (response.Contents) {
        tempObjects.push(
          ...response.Contents.filter((obj) => obj.Key && obj.LastModified).map(
            (obj) => ({
              key: obj.Key!,
              lastModified: obj.LastModified!,
              size: obj.Size || 0,
            }),
          ),
        )
      }

      continuationToken = response.NextContinuationToken
    } while (continuationToken)

    // Filter objects older than cutoff time
    const oldTempObjects = tempObjects.filter(
      (obj) => obj.lastModified < cutoffTime,
    )

    const stats = {
      totalTempFiles: tempObjects.length,
      oldTempFiles: oldTempObjects.length,
      totalSizeBytes: tempObjects.reduce((sum, obj) => sum + obj.size, 0),
      oldSizeBytes: oldTempObjects.reduce((sum, obj) => sum + obj.size, 0),
      cutoffTime: cutoffTime.toISOString(),
      maxAgeHours: maxAge,
    }

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        stats,
        message: `Would delete ${oldTempObjects.length} temp files older than ${maxAge} hours`,
        oldFiles: oldTempObjects.map((obj) => ({
          key: obj.key,
          lastModified: obj.lastModified,
          sizeBytes: obj.size,
        })),
      })
    }

    // Delete old temp files
    if (oldTempObjects.length > 0) {
      // Convert to full URLs for deleteImages function
      const cloudFrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN
      const s3Domain = `${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-north-1'}.amazonaws.com`

      const oldTempUrls = oldTempObjects.map((obj) => {
        if (cloudFrontDomain) {
          return `https://${cloudFrontDomain}/${obj.key}`
        }
        return `https://${s3Domain}/${obj.key}`
      })

      await deleteImages(oldTempUrls)
    }

    return NextResponse.json({
      success: true,
      dryRun: false,
      stats,
      cleaned: oldTempObjects.length,
      message: `Successfully deleted ${oldTempObjects.length} temp files older than ${maxAge} hours`,
      deletedFiles: oldTempObjects.map((obj) => ({
        key: obj.key,
        lastModified: obj.lastModified,
        sizeBytes: obj.size,
      })),
    })
  } catch (error) {
    console.error('Error cleaning up temp images:', error)

    // Handle admin auth errors
    if (
      error instanceof Error &&
      error.message.includes('Admin access required')
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    return NextResponse.json(
      { error: 'Failed to cleanup temp images' },
      { status: 500 },
    )
  }
}
