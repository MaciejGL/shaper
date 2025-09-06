import { NextResponse } from 'next/server'

import { isAdminUser } from '@/lib/admin-auth'

export async function POST() {
  try {
    // Check admin access
    const hasAdminAccess = await isAdminUser()
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Import and run the fix function
    const { fixBrokenBaseRelationships } = await import(
      '@/server/models/training-exercise/fix-base-relationships'
    )

    const result = await fixBrokenBaseRelationships()

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fixing exercise relationships:', error)
    return NextResponse.json(
      {
        error: 'Failed to fix exercise relationships',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
