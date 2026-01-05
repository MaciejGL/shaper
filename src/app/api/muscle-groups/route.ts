import { NextResponse } from 'next/server'

import { getMusclesGroupedForGraphQL } from '@/config/muscles'
import { getCurrentUser } from '@/lib/getUser'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
