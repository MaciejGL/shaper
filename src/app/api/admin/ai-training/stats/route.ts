import { NextResponse } from 'next/server'

import { isAdminUser } from '@/lib/admin-auth'
import { getTrainingStats } from '@/lib/ai-training/storage'

export async function GET() {
  try {
    await isAdminUser()

    const stats = getTrainingStats()

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching training stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch training stats' },
      { status: 500 },
    )
  }
}
