import { NextResponse } from 'next/server'

import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const categories = await prisma.muscleGroupCategory.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Failed to fetch muscle group categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch muscle group categories' },
      { status: 500 },
    )
  }
}
