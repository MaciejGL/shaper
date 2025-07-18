import { NextResponse } from 'next/server'

import { requireAdminUser } from '@/lib/admin-auth'

import { sharedImportStatus } from './utils'

// Import the shared status from the full-update endpoint
// Note: In a production app, you'd want to use a proper state management solution
// like Redis or a database table for this shared state

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
