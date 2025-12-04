import { NextResponse } from 'next/server'

import { getMusclesGroupedForGraphQL } from '@/constants/muscles'

export async function GET() {
  try {
    const categories = getMusclesGroupedForGraphQL()
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Failed to fetch muscle group categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch muscle group categories' },
      { status: 500 },
    )
  }
}
