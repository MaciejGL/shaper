import { NextResponse } from 'next/server'

import { requireAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Verify admin access
    await requireAdminUser()
    // Get USDA food statistics
    const totalUSDAFoods = await prisma.uSDAFood.count()

    const dataTypeCounts = await prisma.uSDAFood.groupBy({
      by: ['dataType'],
      _count: {
        dataType: true,
      },
    })

    const lastImportedUSDA = await prisma.uSDAFood.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    })

    // Get OpenFoodFacts cache statistics
    const totalOpenFoodFacts = await prisma.foodProduct.count()

    const lastCachedOpenFoodFacts = await prisma.foodProduct.findFirst({
      orderBy: { lastUpdated: 'desc' },
      select: { lastUpdated: true },
    })

    // Process data types
    const dataTypes = {
      foundationFoods: 0,
      srLegacy: 0,
      branded: 0,
    }

    dataTypeCounts.forEach(({ dataType, _count }) => {
      switch (dataType.toLowerCase()) {
        case 'foundation_food':
        case 'foundation':
          dataTypes.foundationFoods = _count.dataType
          break
        case 'sr_legacy_food':
        case 'sr_legacy':
          dataTypes.srLegacy = _count.dataType
          break
        case 'branded_food':
        case 'branded':
          dataTypes.branded = _count.dataType
          break
      }
    })

    const stats = {
      usda: {
        totalFoods: totalUSDAFoods,
        lastImported: lastImportedUSDA?.createdAt?.toISOString() || null,
        dataTypes,
      },
      openFoodFacts: {
        cachedProducts: totalOpenFoodFacts,
        lastCached: lastCachedOpenFoodFacts?.lastUpdated?.toISOString() || null,
      },
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching food stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch food statistics' },
      { status: 500 },
    )
  }
}
