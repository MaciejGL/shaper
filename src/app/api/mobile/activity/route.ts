import { NextResponse } from 'next/server'

import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/getUser'

/**
 * Activity Heartbeat Endpoint
 *
 * Updates lastActiveAt timestamp to prevent push notifications while user is active
 * Called periodically from mobile/web app when user is actively using the app
 */

export async function POST() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = currentUser.user.id

    // Update lastActiveAt for all user's mobile push tokens
    await prisma.mobilePushToken.updateMany({
      where: {
        userId,
        pushNotificationsEnabled: true,
      },
      data: {
        lastActiveAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('❌ Error updating activity heartbeat:', error)
    return NextResponse.json(
      { error: 'Failed to update activity' },
      { status: 500 },
    )
  }
}
