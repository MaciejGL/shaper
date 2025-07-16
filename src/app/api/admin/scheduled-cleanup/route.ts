import { NextRequest, NextResponse } from 'next/server'

import { requireAdminUser } from '@/lib/admin-auth'
import {
  type CleanupOptions,
  performScheduledCleanup,
} from '@/lib/scheduled-cleanup'

interface ScheduledCleanupRequest {
  maxAgeHours?: number
  dryRun?: boolean
  includeOrphanedExercises?: boolean
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    await requireAdminUser()

    // Parse request body
    const body: ScheduledCleanupRequest = await request.json().catch(() => ({}))
    const {
      maxAgeHours = 24,
      dryRun = false,
      includeOrphanedExercises = false,
    } = body

    // Validate parameters
    if (maxAgeHours < 1 || maxAgeHours > 168) {
      return NextResponse.json(
        { error: 'maxAgeHours must be between 1 and 168 (1 week)' },
        { status: 400 },
      )
    }

    const options: CleanupOptions = {
      maxAgeHours,
      dryRun,
      includeOrphanedExercises,
    }

    // Perform the cleanup
    const report = await performScheduledCleanup(options)

    return NextResponse.json({
      success: true,
      report,
      message: dryRun
        ? `Dry run completed: would delete ${report.tempFolderCleanup.filesDeleted} temp files`
        : `Cleanup completed: deleted ${report.tempFolderCleanup.filesDeleted} temp files`,
    })
  } catch (error) {
    console.error('Error performing scheduled cleanup:', error)

    // Handle admin auth errors
    if (
      error instanceof Error &&
      error.message.includes('Admin access required')
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    return NextResponse.json(
      { error: 'Failed to perform scheduled cleanup' },
      { status: 500 },
    )
  }
}
