import { NextResponse } from 'next/server'

import { isAdminUser } from '@/lib/admin-auth'
import {
  getUnmatchedStats,
  loadUnmatchedExercises,
  removeUnmatchedExercise,
} from '@/lib/ai-training/unmatched-storage'

export async function GET() {
  try {
    await isAdminUser()

    const exercises = loadUnmatchedExercises()
    const stats = getUnmatchedStats()

    return NextResponse.json({ exercises, stats })
  } catch (error) {
    console.error('Error loading unmatched exercises:', error)
    return NextResponse.json(
      { error: 'Failed to load unmatched exercises' },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    await isAdminUser()

    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    removeUnmatchedExercise(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing unmatched exercise:', error)
    return NextResponse.json(
      { error: 'Failed to remove unmatched exercise' },
      { status: 500 },
    )
  }
}
