import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3'
import { NextResponse } from 'next/server'

import { requireAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!

interface FolderStats {
  fileCount: number
  totalSizeBytes: number
  oldestFile?: {
    key: string
    lastModified: Date
    sizeBytes: number
  }
  newestFile?: {
    key: string
    lastModified: Date
    sizeBytes: number
  }
}

export async function GET() {
  try {
    // Check admin authentication
    await requireAdminUser()

    // Get stats from different S3 folders
    const [exerciseStats, tempStats, avatarStats, progressStats] =
      await Promise.all([
        getFolderStats('exercises/', ['exercises/temp/']), // Exclude temp from main exercises
        getFolderStats('exercises/temp/'),
        getFolderStats('avatars/'),
        getFolderStats('progress-private/'),
      ])

    // Get database stats
    const [exerciseImageCount, totalExerciseCount, tempThresholds] =
      await Promise.all([
        prisma.image.count({
          where: { entityType: 'exercise' },
        }),
        prisma.baseExercise.count(),
        getTempFileAgeStats(),
      ])

    const now = new Date()

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      storage: {
        exercises: exerciseStats,
        tempFolder: tempStats,
        avatars: avatarStats,
        progressPhotos: progressStats,
        total: {
          fileCount:
            exerciseStats.fileCount +
            tempStats.fileCount +
            avatarStats.fileCount +
            progressStats.fileCount,
          totalSizeBytes:
            exerciseStats.totalSizeBytes +
            tempStats.totalSizeBytes +
            avatarStats.totalSizeBytes +
            progressStats.totalSizeBytes,
        },
      },
      database: {
        exerciseImagesInDb: exerciseImageCount,
        totalExercises: totalExerciseCount,
        orphanedExerciseImages: Math.max(
          0,
          exerciseStats.fileCount - exerciseImageCount,
        ),
      },
      tempFolderAnalysis: {
        ...tempThresholds,
        recommendations: {
          canCleanup24h: tempThresholds.filesOlderThan24h,
          canCleanupWeek: tempThresholds.filesOlderThanWeek,
          potentialSavings24h: `${formatBytes(tempThresholds.bytesOlderThan24h)}`,
          potentialSavingsWeek: `${formatBytes(tempThresholds.bytesOlderThanWeek)}`,
        },
      },
    })
  } catch (error) {
    console.error('Error getting storage stats:', error)

    // Handle admin auth errors
    if (
      error instanceof Error &&
      error.message.includes('Admin access required')
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    return NextResponse.json(
      { error: 'Failed to get storage statistics' },
      { status: 500 },
    )
  }
}

async function getFolderStats(
  prefix: string,
  excludePrefixes: string[] = [],
): Promise<FolderStats> {
  const objects: { key: string; lastModified: Date; size: number }[] = []
  let continuationToken: string | undefined

  do {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    })

    const response = await s3Client.send(command)

    if (response.Contents) {
      objects.push(
        ...response.Contents.filter((obj) => {
          if (!obj.Key || !obj.LastModified) return false
          // Exclude files that match any exclude prefix
          return !excludePrefixes.some((exclude) =>
            obj.Key!.startsWith(exclude),
          )
        }).map((obj) => ({
          key: obj.Key!,
          lastModified: obj.LastModified!,
          size: obj.Size || 0,
        })),
      )
    }

    continuationToken = response.NextContinuationToken
  } while (continuationToken)

  if (objects.length === 0) {
    return {
      fileCount: 0,
      totalSizeBytes: 0,
    }
  }

  // Sort by last modified to find oldest and newest
  const sortedByDate = [...objects].sort(
    (a, b) => a.lastModified.getTime() - b.lastModified.getTime(),
  )

  return {
    fileCount: objects.length,
    totalSizeBytes: objects.reduce((sum, obj) => sum + obj.size, 0),
    oldestFile: {
      key: sortedByDate[0].key,
      lastModified: sortedByDate[0].lastModified,
      sizeBytes: sortedByDate[0].size,
    },
    newestFile: {
      key: sortedByDate[sortedByDate.length - 1].key,
      lastModified: sortedByDate[sortedByDate.length - 1].lastModified,
      sizeBytes: sortedByDate[sortedByDate.length - 1].size,
    },
  }
}

async function getTempFileAgeStats() {
  const objects: { key: string; lastModified: Date; size: number }[] = []
  let continuationToken: string | undefined

  do {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: 'exercises/temp/',
      ContinuationToken: continuationToken,
    })

    const response = await s3Client.send(command)

    if (response.Contents) {
      objects.push(
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

  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const filesOlderThan24h = objects.filter(
    (obj) => obj.lastModified < oneDayAgo,
  )
  const filesOlderThanWeek = objects.filter(
    (obj) => obj.lastModified < oneWeekAgo,
  )

  return {
    totalTempFiles: objects.length,
    filesOlderThan24h: filesOlderThan24h.length,
    filesOlderThanWeek: filesOlderThanWeek.length,
    bytesOlderThan24h: filesOlderThan24h.reduce(
      (sum, obj) => sum + obj.size,
      0,
    ),
    bytesOlderThanWeek: filesOlderThanWeek.reduce(
      (sum, obj) => sum + obj.size,
      0,
    ),
    totalTempBytes: objects.reduce((sum, obj) => sum + obj.size, 0),
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}
