import { prisma } from '@/lib/db'
import { SUPPORT_ACCOUNT_ID } from '@/lib/support-account'

export async function createSupportChatForUser(userId: string): Promise<void> {
  // Skip support account itself
  if (userId === SUPPORT_ACCOUNT_ID) {
    return
  }

  try {
    const existingChat = await prisma.chat.findUnique({
      where: {
        trainerId_clientId: {
          trainerId: SUPPORT_ACCOUNT_ID,
          clientId: userId,
        },
      },
      select: { id: true },
    })

    // Fast path: chat already exists (no extra work on repeated logins)
    if (existingChat) return

    const chat = await prisma.chat.create({
      data: {
        trainerId: SUPPORT_ACCOUNT_ID, // Support account is trainer
        clientId: userId, // User is client
      },
      select: { id: true },
    })

    // Welcome message (sent once — only for newly created chat)
    await prisma.message.create({
      data: {
        chatId: chat.id,
        senderId: SUPPORT_ACCOUNT_ID,
        content:
          'Hey! 👋 I’m Mats from Hypro Team. Welcome to Hypro — message me anytime if you want help navigating the app or choosing what to do next. We reply personally (no bots), so I’ll get back to you when I’m available.',
      },
    })
  } catch (error) {
    // Log error but don't fail the payment/subscription process
    console.error('Failed to create support chat for user:', error)
  }
}
