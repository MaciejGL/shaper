import { prisma } from '@/lib/db'
import { SUPPORT_ACCOUNT_ID } from '@/lib/support-account'

export async function createSupportChatForUser(userId: string): Promise<void> {
  // Skip support account itself
  if (userId === SUPPORT_ACCOUNT_ID) {
    return
  }

  try {
    const chat = await prisma.chat.upsert({
      where: {
        trainerId_clientId: {
          trainerId: SUPPORT_ACCOUNT_ID,
          clientId: userId,
        },
      },
      update: {
        updatedAt: new Date(),
      },
      create: {
        trainerId: SUPPORT_ACCOUNT_ID, // Support account is trainer
        clientId: userId, // User is client
      },
    })

    // Check if this chat needs a welcome message (for newly created chats)
    const existingMessages = await prisma.message.count({
      where: { chatId: chat.id },
    })

    if (existingMessages === 0) {
      await prisma.message.create({
        data: {
          chatId: chat.id,
          senderId: SUPPORT_ACCOUNT_ID,
          content: `Welcome to Hypro Premium!

Thank you for subscribing! I'm here to help you get the most out of your premium experience.

As a premium member, you have access to:
• Advanced training features
• Priority support
• Enhanced progress tracking
• Direct trainer connections

If you have any questions or need assistance, just send me a message. I'm here to help!`,
        },
      })
    }
  } catch (error) {
    // Log error but don't fail the payment/subscription process
    console.error('Failed to create support chat for user:', error)
  }
}
