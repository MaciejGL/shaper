import { NextResponse } from 'next/server'

import { requireAdminUser } from '@/lib/admin-auth'

// Import the shared status from the full-update endpoint
// Note: In a production app, you'd want to use a proper state management solution
// like Redis or a database table for this shared state
let sharedImportStatus = {
  isDownloading: false,
  isParsing: false,
  isImporting: false,
  progress: 0,
  currentStep: '',
  logs: [] as string[],
}

export async function GET() {
  try {
    // Verify admin access
    await requireAdminUser()
    return NextResponse.json(sharedImportStatus)
  } catch (error) {
    console.error('Error fetching import status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch import status' },
      { status: 500 },
    )
  }
}

// Function to update status (called by other endpoints)
export function updateImportStatus(status: Partial<typeof sharedImportStatus>) {
  sharedImportStatus = { ...sharedImportStatus, ...status }
}

// Function to get current status (for other endpoints to check)
export function getCurrentImportStatus() {
  return sharedImportStatus
}
