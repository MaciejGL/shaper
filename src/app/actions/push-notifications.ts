'use server'

import webpush from 'web-push'

// Configure VAPID details
webpush.setVapidDetails(
  process.env.NEXT_PUBLIC_VAPID_SUBJECT || 'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

// In production, store subscriptions in your database
// For demo purposes, we'll store in memory (this will reset on server restart)
let subscriptions: {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}[] = []

export async function subscribeUser(sub: {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}) {
  try {
    // Add subscription to our storage
    subscriptions.push(sub)

    // TODO: In production, store in your existing database using Prisma
    // Example:
    // await prisma.pushSubscription.create({
    //   data: {
    //     userId: session.user.id,
    //     endpoint: sub.endpoint,
    //     keys: sub.keys,
    //   }
    // })

    console.info('✅ User subscribed to push notifications:', sub.endpoint)
    return { success: true }
  } catch (error) {
    console.error('❌ Error subscribing user:', error)
    return { success: false, error: 'Failed to subscribe user' }
  }
}

export async function unsubscribeUser() {
  try {
    // Remove all subscriptions (in production, remove specific user subscription)
    subscriptions = []

    // TODO: In production, remove from database
    // await prisma.pushSubscription.deleteMany({
    //   where: { userId: session.user.id }
    // })

    console.info('✅ User unsubscribed from push notifications')
    return { success: true }
  } catch (error) {
    console.error('❌ Error unsubscribing user:', error)
    return { success: false, error: 'Failed to unsubscribe user' }
  }
}

export async function sendTestNotification(message: string) {
  if (subscriptions.length === 0) {
    return { success: false, error: 'No subscriptions available' }
  }

  try {
    const payload = JSON.stringify({
      title: '🏋️ Shaper Notification',
      body: message,
      icon: '/icon-192x192.png',
      url: '/fitspace',
    })

    // Send to all subscribed users
    const results = await Promise.allSettled(
      subscriptions.map((subscription) =>
        webpush.sendNotification(subscription, payload),
      ),
    )

    const successful = results.filter(
      (result) => result.status === 'fulfilled',
    ).length
    const failed = results.filter(
      (result) => result.status === 'rejected',
    ).length

    console.info(
      `📧 Sent notification to ${successful} users, ${failed} failed`,
    )

    return {
      success: true,
      message: `Sent to ${successful} subscriptions${failed > 0 ? `, ${failed} failed` : ''}`,
    }
  } catch (error) {
    console.error('❌ Error sending push notification:', error)
    return { success: false, error: 'Failed to send notification' }
  }
}

// Helper functions for different notification types
export async function sendWorkoutReminder(workoutName: string) {
  return await sendTestNotification(`Time for your ${workoutName} workout! 💪`)
}

export async function sendMealReminder(mealName: string) {
  return await sendTestNotification(`Don't forget to log your ${mealName}! 🍽️`)
}

export async function sendCoachingNotification(message: string) {
  return await sendTestNotification(`📝 Coach update: ${message}`)
}

export async function sendAchievementNotification(achievement: string) {
  return await sendTestNotification(`🎉 Achievement unlocked: ${achievement}`)
}

// Function to get subscription count (for testing/admin purposes)
export async function getSubscriptionCount() {
  return { count: subscriptions.length }
}
