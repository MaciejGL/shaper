import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3'

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

export interface CleanupOptions {
  maxAgeHours: number
  dryRun?: boolean
  includeOrphanedExercises?: boolean
}

export interface CleanupReport {
  timestamp: string
  tempFolderCleanup: {
    filesFound: number
    filesDeleted: number
    bytesDeleted: number
    oldestFileAge: string | null
  }
  orphanedExerciseCleanup?: {
    filesFound: number
    filesDeleted: number
    bytesDeleted: number
  }
  errors: string[]
  dryRun: boolean
}

/**
 * Scheduled cleanup function for temp folders and orphaned files
 * This can be called by cron jobs or admin utilities
 */
export async function performScheduledCleanup(
  options: CleanupOptions,
): Promise<CleanupReport> {
  const report: CleanupReport = {
    timestamp: new Date().toISOString(),
    tempFolderCleanup: {
      filesFound: 0,
      filesDeleted: 0,
      bytesDeleted: 0,
      oldestFileAge: null,
    },
    errors: [],
    dryRun: options.dryRun || false,
  }

  try {
    // Clean up temp folder
    const tempCleanupResult = await cleanupTempFolder(
      options.maxAgeHours,
      options.dryRun,
    )
    report.tempFolderCleanup = tempCleanupResult

    // Optionally clean up orphaned exercise images
    if (options.includeOrphanedExercises) {
      const orphanedCleanupResult = await cleanupOrphanedExerciseImages(
        options.dryRun,
      )
      report.orphanedExerciseCleanup = orphanedCleanupResult
    }

    console.info(
      `Cleanup completed: ${report.tempFolderCleanup.filesDeleted} temp files removed`,
    )
    if (report.orphanedExerciseCleanup) {
      console.info(
        `Orphaned cleanup: ${report.orphanedExerciseCleanup.filesDeleted} orphaned files removed`,
      )
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error during cleanup'
    report.errors.push(errorMessage)
    console.error('Scheduled cleanup failed:', errorMessage)
  }

  return report
}

/**
 * Clean up temp folder files older than specified age
 */
async function cleanupTempFolder(maxAgeHours: number, dryRun: boolean = false) {
  const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000)
  const tempObjects: { key: string; lastModified: Date; size: number }[] = []
  let continuationToken: string | undefined

  // Get all temp folder objects
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

  // Filter files older than cutoff
  const oldTempObjects = tempObjects.filter(
    (obj) => obj.lastModified < cutoffTime,
  )

  const result = {
    filesFound: tempObjects.length,
    filesDeleted: oldTempObjects.length,
    bytesDeleted: oldTempObjects.reduce((sum, obj) => sum + obj.size, 0),
    oldestFileAge:
      tempObjects.length > 0
        ? Math.max(
            ...tempObjects.map(
              (obj) => Date.now() - obj.lastModified.getTime(),
            ),
          ) /
            (1000 * 60 * 60) +
          ' hours'
        : null,
  }

  // Delete old files if not dry run
  if (!dryRun && oldTempObjects.length > 0) {
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

  return result
}

/**
 * Clean up orphaned exercise images (in S3 but not in database)
 */
async function cleanupOrphanedExerciseImages(dryRun: boolean = false) {
  // Import Prisma here to avoid issues in environments where it's not available
  const { prisma } = await import('@/lib/db')

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
  const orphanedFiles = s3Objects.filter((s3Key) => !dbFileKeys.includes(s3Key))

  const result = {
    filesFound: s3Objects.length,
    filesDeleted: orphanedFiles.length,
    bytesDeleted: 0, // Would need additional S3 call to get sizes
  }

  // Delete orphaned files if not dry run
  if (!dryRun && orphanedFiles.length > 0) {
    const orphanedUrls = orphanedFiles.map((key) => {
      if (cloudFrontDomain) {
        return `https://${cloudFrontDomain}/${key}`
      }
      return `https://${s3Domain}/${key}`
    })

    await deleteImages(orphanedUrls)
  }

  return result
}

/**
 * Get cleanup recommendations based on current temp folder state
 */
export async function getCleanupRecommendations() {
  const tempObjects: { lastModified: Date; size: number }[] = []
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
        ...response.Contents.filter((obj) => obj.LastModified).map((obj) => ({
          lastModified: obj.LastModified!,
          size: obj.Size || 0,
        })),
      )
    }

    continuationToken = response.NextContinuationToken
  } while (continuationToken)

  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const filesOlderThan24h = tempObjects.filter(
    (obj) => obj.lastModified < oneDayAgo,
  )
  const filesOlderThanWeek = tempObjects.filter(
    (obj) => obj.lastModified < oneWeekAgo,
  )

  return {
    totalFiles: tempObjects.length,
    totalSize: tempObjects.reduce((sum, obj) => sum + obj.size, 0),
    canClean24h: filesOlderThan24h.length,
    canCleanWeek: filesOlderThanWeek.length,
    savings24h: filesOlderThan24h.reduce((sum, obj) => sum + obj.size, 0),
    savingsWeek: filesOlderThanWeek.reduce((sum, obj) => sum + obj.size, 0),
    oldestFileAgeHours:
      tempObjects.length > 0
        ? Math.max(
            ...tempObjects.map(
              (obj) => now.getTime() - obj.lastModified.getTime(),
            ),
          ) /
          (1000 * 60 * 60)
        : 0,
    recommendedAction:
      filesOlderThanWeek.length > 0
        ? 'Immediate cleanup recommended - files older than 1 week detected'
        : filesOlderThan24h.length > 10
          ? 'Daily cleanup recommended - many files older than 24 hours'
          : 'No urgent cleanup needed',
  }
}
