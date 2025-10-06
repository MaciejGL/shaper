import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'

/**
 * Activity Heartbeat Endpoint
 *
 * Updates lastActiveAt timestamp to prevent push notifications while user is active
 * Called periodically from mobile/web app when user is actively using the app
 */

export async function POST() {
  try {
    // Use lightweight session check (no DB query) - userId is in JWT
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // userId is properly typed from NextAuth module augmentation
    const userId = session.user.id

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
