import { NextResponse } from 'next/server'

import { requireAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export async function DELETE() {
  try {
    // Verify admin access
    await requireAdminUser()
    // Clear all USDA food data
    const result = await prisma.uSDAFood.deleteMany({})

    return NextResponse.json({
      message: 'USDA food data cleared successfully',
      deletedCount: result.count,
    })
  } catch (error) {
    console.error('Error clearing USDA data:', error)
    return NextResponse.json(
      { error: 'Failed to clear USDA food data' },
      { status: 500 },
    )
  }
}
