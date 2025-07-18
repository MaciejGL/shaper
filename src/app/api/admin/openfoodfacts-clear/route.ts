import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

import { requireAdminUser } from '@/lib/admin-auth'

const prisma = new PrismaClient()

export async function POST() {
  try {
    // Verify admin access
    await requireAdminUser()

    console.info('🗑️ Starting OpenFoodFacts data clearing...')

    // Clear all OpenFoodFacts product data
    const deletedProducts = await prisma.openFoodFactsProduct.deleteMany({})

    console.info(`✅ Cleared ${deletedProducts.count} OpenFoodFacts products`)

    return NextResponse.json({
      message: 'OpenFoodFacts data cleared successfully',
      deletedProducts: deletedProducts.count,
    })
  } catch (error) {
    console.error('❌ Error clearing OpenFoodFacts data:', error)
    return NextResponse.json(
      { error: 'Failed to clear OpenFoodFacts data' },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}
