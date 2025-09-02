import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/getUser'

/**
 * Mobile Push Token Registration Endpoint
 *
 * Stores Expo push tokens from mobile apps alongside existing web push subscriptions
 * This bridges mobile and web push notification systems
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { expoPushToken, platform, deviceInfo } = body

    if (!expoPushToken) {
      return NextResponse.json(
        { error: 'expoPushToken is required' },
        { status: 400 },
      )
    }

    // Get current user (if authenticated)
    let userId: string | null = null
    try {
      const currentUser = await getCurrentUser()
      userId = currentUser?.user.id || null
    } catch (error) {
      // Not authenticated - we can still store the token for later association
      console.error('Anonymous push token registration')
    }

    // Store the Expo push token
    // We'll extend the existing PushSubscription model or create a new one
    const existingToken = await prisma.mobilePushToken.findFirst({
      where: { expoPushToken },
    })

    if (existingToken) {
      // Update existing token
      await prisma.mobilePushToken.update({
        where: { id: existingToken.id },
        data: {
          userId,
          platform,
          deviceInfo: deviceInfo ? JSON.stringify(deviceInfo) : null,
          lastActiveAt: new Date(),
          pushNotificationsEnabled: true, // Re-enable when token is re-registered
        },
      })
    } else {
      // Create new token record
      await prisma.mobilePushToken.create({
        data: {
          expoPushToken,
          userId,
          platform,
          deviceInfo: deviceInfo ? JSON.stringify(deviceInfo) : null,
          pushNotificationsEnabled: true, // Default to enabled
          createdAt: new Date(),
          lastActiveAt: new Date(),
        },
      })
    }

    // CRITICAL: Also update the user's profile notification preferences
    // This ensures the web UI shows the correct state
    if (userId) {
      try {
        await prisma.userProfile.update({
          where: { userId },
          data: {
            pushNotifications: true, // Enable push notifications in profile
          },
        })
        console.info(
          `📱 Updated profile push notifications preference for user ${userId}`,
        )
      } catch (profileError) {
        console.error(
          `❌ Failed to update profile preferences for user ${userId}:`,
          profileError,
        )
        // Don't fail the entire request if profile update fails
        // The push token is still registered successfully
      }
    }

    console.info(
      `📱 Registered mobile push token for ${platform}${userId ? ` (user: ${userId})` : ' (anonymous)'}`,
    )

    return NextResponse.json({
      success: true,
      message: 'Push token registered successfully',
    })
  } catch (error) {
    console.error('❌ Error registering mobile push token:', error)
    return NextResponse.json(
      { error: 'Failed to register push token' },
      { status: 500 },
    )
  }
}

/**
 * Get mobile push tokens for a user
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tokens = await prisma.mobilePushToken.findMany({
      where: { userId: currentUser.user.id },
      select: {
        id: true,
        platform: true,
        pushNotificationsEnabled: true,
        createdAt: true,
        lastActiveAt: true,
      },
    })

    return NextResponse.json({ tokens })
  } catch (error) {
    console.error('❌ Error fetching mobile push tokens:', error)
    return NextResponse.json(
      { error: 'Failed to fetch push tokens' },
      { status: 500 },
    )
  }
}

/**
 * Update push notification preferences
 */
export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { expoPushToken, pushNotificationsEnabled } = body

    if (!expoPushToken) {
      return NextResponse.json(
        { error: 'expoPushToken is required' },
        { status: 400 },
      )
    }

    // Update push token table
    await prisma.mobilePushToken.updateMany({
      where: {
        expoPushToken,
        userId: currentUser.user.id,
      },
      data: {
        pushNotificationsEnabled: pushNotificationsEnabled ?? true,
        lastActiveAt: new Date(),
      },
    })

    // CRITICAL: Also update the user's profile notification preferences
    // This ensures the web UI shows the correct state
    try {
      await prisma.userProfile.update({
        where: { userId: currentUser.user.id },
        data: {
          pushNotifications: pushNotificationsEnabled ?? true,
        },
      })
      console.info(
        `📱 Updated push preferences for user ${currentUser.user.id} (both token and profile)`,
      )
    } catch (profileError) {
      console.error(
        `❌ Failed to update profile preferences for user ${currentUser.user.id}:`,
        profileError,
      )
      // Don't fail the entire request if profile update fails
      // The push token preference is still updated successfully
    }

    return NextResponse.json({
      success: true,
      message: 'Push preferences updated',
    })
  } catch (error) {
    console.error('❌ Error updating push preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update push preferences' },
      { status: 500 },
    )
  }
}
