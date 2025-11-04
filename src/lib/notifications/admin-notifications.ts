import { prisma } from '@/lib/db'

import { sendMobilePushNotifications } from './mobile-push-service'

const ADMIN_EMAIL = 'm.glowacki01@gmail.com'

interface NewUserNotificationData {
  email: string
  firstName?: string | null
  lastName?: string | null
  name?: string | null
}

/**
 * Send push notification to admin when new user registers
 */
export async function notifyAdminNewUser(userData: NewUserNotificationData) {
  try {
    // Find admin user by email
    const admin = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
      select: { id: true },
    })

    if (!admin) {
      console.warn(
        `⚠️ Admin user not found with email: ${ADMIN_EMAIL}. Skipping admin notification.`,
      )
      return
    }

    // Format user name for notification
    const userName = formatUserName(userData)

    // Send push notification to admin
    await sendMobilePushNotifications({
      userIds: [admin.id],
      title: 'New User',
      body: `${userData.email} ${userName}`,
      data: {
        type: 'new_user_registration',
        userEmail: userData.email,
      },
    })

    console.info(
      `📱 Admin notification sent for new user: ${userData.email} ${userName}`,
    )
  } catch (error) {
    console.error('❌ Failed to send admin notification for new user:', error)
  }
}

/**
 * Format user name from available data
 */
function formatUserName(userData: NewUserNotificationData): string {
  const { firstName, lastName, name } = userData

  // Try firstName + lastName first
  if (firstName || lastName) {
    return `${firstName || ''} ${lastName || ''}`.trim()
  }

  // Fall back to name field
  if (name) {
    return name
  }

  // Default when no name available
  return '(No name)'
}

