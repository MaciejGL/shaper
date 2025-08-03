import { NextResponse } from 'next/server'

import { isAdminUser } from '@/lib/admin-auth'

const EXERCEMUS_URL =
  'https://raw.githubusercontent.com/exercemus/exercises/main/exercises.json'

export async function GET() {
  try {
    // Check admin access
    const hasAdminAccess = await isAdminUser()
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Download exercemus data
    const response = await fetch(EXERCEMUS_URL)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Return as downloadable JSON file
    const headers = new Headers()
    headers.set('Content-Type', 'application/json')
    headers.set(
      'Content-Disposition',
      'attachment; filename="exercemus-exercises.json"',
    )

    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Failed to download exercemus data:', error)
    return NextResponse.json(
      { error: 'Failed to download exercemus data' },
      { status: 500 },
    )
  }
}
