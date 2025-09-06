import { NextRequest, NextResponse } from 'next/server'

import { isAdminUser } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const hasAdminAccess = await isAdminUser()
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { exerciseId } = await request.json()

    if (!exerciseId) {
      return NextResponse.json(
        { error: 'Exercise ID is required' },
        { status: 400 },
      )
    }

    // Import and run the fix function for single exercise
    const { fixSingleExerciseRelationship } = await import(
      '@/server/models/training-exercise/fix-base-relationships'
    )

    const result = await fixSingleExerciseRelationship(exerciseId)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fixing single exercise relationship:', error)
    return NextResponse.json(
      {
        error: 'Failed to fix exercise relationship',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
