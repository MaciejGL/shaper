import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

import Chat from './model'

// Dynamic import to avoid circular dependency

export async function getOrCreateChat(
  { partnerId }: { partnerId: string },
  context: GQLContext,
) {
  const currentUserId = context.user?.user.id
  if (!currentUserId) {
    throw new Error('Authentication required')
  }

  // Determine if current user is trainer or client by checking their relationship
  const currentUser = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { trainerId: true, role: true },
  })

  if (!currentUser) {
    throw new Error('User not found')
  }

  // Check if the partner is in a trainer-client relationship with current user
  const partner = await prisma.user.findUnique({
    where: { id: partnerId },
    select: { trainerId: true, role: true },
  })

  if (!partner) {
    throw new Error('Partner not found')
  }

  // Determine trainer and client IDs based on relationships
  let trainerId: string
  let clientId: string

  if (currentUser.role === 'TRAINER' && partner.trainerId === currentUserId) {
    // Current user is trainer, partner is their client
    trainerId = currentUserId
    clientId = partnerId
  } else if (
    currentUser.trainerId === partnerId &&
    partner.role === 'TRAINER'
  ) {
    // Current user is client, partner is their trainer
    trainerId = partnerId
    clientId = currentUserId
  } else {
    throw new Error('No trainer-client relationship exists between users')
  }

  // Try to find existing chat
  let chat = await prisma.chat.findUnique({
    where: {
      trainerId_clientId: {
        trainerId,
        clientId,
      },
    },
    include: {
      trainer: true,
      client: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          sender: {
            include: {
              profile: true,
            },
          },
        },
      },
    },
  })

  // Create chat if it doesn't exist
  if (!chat) {
    chat = await prisma.chat.create({
      data: {
        trainerId,
        clientId,
      },
      include: {
        trainer: true,
        client: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    })
  }

  return new Chat(chat, context)
}

export async function getMyChats(context: GQLContext) {
  const currentUserId = context.user?.user.id
  if (!currentUserId) {
    throw new Error('Authentication required')
  }

  const chats = await prisma.chat.findMany({
    where: {
      OR: [{ trainerId: currentUserId }, { clientId: currentUserId }],
    },
    include: {
      trainer: true,
      client: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          sender: {
            include: {
              profile: true,
            },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const { default: Chat } = await import('./model')
  return chats.map((chat) => new Chat(chat, context))
}

export async function markMessagesAsRead(
  { chatId }: { chatId: string },
  context: GQLContext,
) {
  const currentUserId = context.user?.user.id
  if (!currentUserId) {
    throw new Error('Authentication required')
  }

  // Verify user has access to this chat
  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      OR: [{ trainerId: currentUserId }, { clientId: currentUserId }],
    },
  })

  if (!chat) {
    throw new Error('Chat not found or access denied')
  }

  // Mark all unread messages as read
  await prisma.message.updateMany({
    where: {
      chatId,
      senderId: { not: currentUserId }, // Only mark messages from other person as read
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  })

  return true
}
