import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

import Message from '../message/model'
import UserPublic from '../user-public/model'

import Chat from './model'

export async function getOrCreateChat(
  { partnerId }: { partnerId: string },
  context: GQLContext,
) {
  const currentUserId = context.user?.user.id
  if (!currentUserId) {
    throw new Error('Authentication required')
  }

  // Use DataLoaders for batched user lookups
  const [currentUser, partner] = await Promise.all([
    context.loaders.user.userBasic.load(currentUserId),
    context.loaders.user.userBasic.load(partnerId),
  ])

  if (!currentUser) {
    throw new Error('User not found')
  }

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

  // Use DataLoader to find existing chat
  let chat = await context.loaders.chat.chatByParticipants.load(
    `${trainerId}:${clientId}`,
  )

  // Create chat if it doesn't exist
  if (!chat) {
    const newChat = await prisma.chat.create({
      data: {
        trainerId,
        clientId,
      },
      include: {
        trainer: {
          include: {
            profile: true,
          },
        },
        client: {
          include: {
            profile: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    // Prime the DataLoader cache with the new chat
    context.loaders.chat.chatByParticipants.prime(
      `${trainerId}:${clientId}`,
      newChat,
    )
    context.loaders.chat.chatBasic.prime(newChat.id, newChat)

    chat = newChat
  }

  return new Chat(chat, context)
}

export async function getMyChats(context: GQLContext) {
  const currentUserId = context.user?.user.id
  if (!currentUserId) {
    throw new Error('Authentication required')
  }

  // Use DataLoader for user lookup
  const currentUser = await context.loaders.user.userBasic.load(currentUserId)

  if (!currentUser) {
    throw new Error('User not found')
  }

  // If user is a trainer, auto-create chats with all clients that don't have chats yet
  if (currentUser.role === 'TRAINER') {
    // Get all clients of this trainer
    const clients = await prisma.user.findMany({
      where: { trainerId: currentUserId },
      select: { id: true },
    })

    // Get existing chats for this trainer
    const existingChats = await prisma.chat.findMany({
      where: { trainerId: currentUserId },
      select: { clientId: true },
    })

    const existingClientIds = new Set(
      existingChats.map((chat) => chat.clientId),
    )

    // Find clients without chats
    const clientsWithoutChats = clients.filter(
      (client) => !existingClientIds.has(client.id),
    )

    // Create chats for clients that don't have them
    if (clientsWithoutChats.length > 0) {
      await prisma.chat.createMany({
        data: clientsWithoutChats.map((client) => ({
          trainerId: currentUserId,
          clientId: client.id,
        })),
        skipDuplicates: true, // Safety net in case of race conditions
      })
    }
  }

  // Get chat IDs first with lightweight query
  const chatIds = await prisma.chat.findMany({
    where: {
      OR: [{ trainerId: currentUserId }, { clientId: currentUserId }],
    },
    select: { id: true },
  })

  // Load complete chat data (including trainer, client, latest message) via DataLoader
  const chats = await Promise.all(
    chatIds.map((chat) => context.loaders.chat.chatBasic.load(chat.id)),
  )

  // Filter out any null results and sort by last message time
  const validChats = chats.filter((chat) => chat !== null)
  const sortedChats = validChats.sort((a, b) => {
    const aLastMessageTime = a.messages?.[0]?.createdAt
      ? new Date(a.messages[0].createdAt).getTime()
      : 0
    const bLastMessageTime = b.messages?.[0]?.createdAt
      ? new Date(b.messages[0].createdAt).getTime()
      : 0
    return bLastMessageTime - aLastMessageTime
  })

  return sortedChats.map((chat) => new Chat(chat, context))
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

export async function getTotalUnreadCount(context: GQLContext) {
  const currentUserId = context.user?.user.id
  if (!currentUserId) {
    return 0
  }

  // Get all chat IDs for this user
  const chats = await prisma.chat.findMany({
    where: {
      OR: [{ trainerId: currentUserId }, { clientId: currentUserId }],
    },
    select: { id: true },
  })

  // Sum up unread counts for all chats using DataLoader for efficient batching
  const unreadCounts = await Promise.all(
    chats.map((chat) =>
      context.loaders.chat.unreadCount.load(`${chat.id}:${currentUserId}`),
    ),
  )

  return unreadCounts.reduce((total, count) => total + count, 0)
}

export async function getMessengerInitialData(
  { messagesPerChat = 30 }: { messagesPerChat?: number | null },
  context: GQLContext,
) {
  const currentUserId = context.user?.user.id
  if (!currentUserId) {
    throw new Error('Authentication required')
  }

  // Auto-create chats for trainers (same logic as getMyChats)
  if (context.user?.user.role === 'TRAINER') {
    const clients = await prisma.user.findMany({
      where: { trainerId: currentUserId },
      select: { id: true },
    })

    const existingChats = await prisma.chat.findMany({
      where: { trainerId: currentUserId },
      select: { clientId: true },
    })

    const existingClientIds = new Set(
      existingChats.map((chat) => chat.clientId),
    )

    const clientsWithoutChats = clients.filter(
      (client) => !existingClientIds.has(client.id),
    )

    if (clientsWithoutChats.length > 0) {
      await prisma.chat.createMany({
        data: clientsWithoutChats.map((client) => ({
          trainerId: currentUserId,
          clientId: client.id,
        })),
        skipDuplicates: true,
      })
    }
  }

  // Get all chats with complete data in a single efficient query
  const chatsWithData = await prisma.chat.findMany({
    where: {
      OR: [{ trainerId: currentUserId }, { clientId: currentUserId }],
    },
    include: {
      trainer: {
        include: {
          profile: true,
        },
      },
      client: {
        include: {
          profile: true,
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: (messagesPerChat || 30) + 1, // Take one extra to check if there are more
        include: {
          sender: {
            include: {
              profile: true,
            },
          },
        },
      },
    },
    orderBy: [
      // Sort by last message time, then by creation time
      { updatedAt: 'desc' },
      { createdAt: 'desc' },
    ],
  })

  // Process each chat
  const chatsWithMessages = await Promise.all(
    chatsWithData.map(async (chatData) => {
      const messages = chatData.messages
      const hasMoreMessages = messages.length > (messagesPerChat || 30)
      const actualMessages = hasMoreMessages
        ? messages.slice(0, messagesPerChat || 30)
        : messages

      // Get unread count using DataLoader
      const unreadCount = await context.loaders.chat.unreadCount.load(
        `${chatData.id}:${currentUserId}`,
      )

      // Get last message (first in the desc ordered list)
      const lastMessage = messages.length > 0 ? messages[0] : null

      return {
        id: chatData.id,
        trainerId: chatData.trainerId,
        clientId: chatData.clientId,
        trainer: new UserPublic(chatData.trainer, context),
        client: new UserPublic(chatData.client, context),
        messages: actualMessages.map((msg) => new Message(msg, context)),
        hasMoreMessages,
        lastMessage: lastMessage ? new Message(lastMessage, context) : null,
        unreadCount,
        createdAt: chatData.createdAt.toISOString(),
        updatedAt: chatData.updatedAt.toISOString(),
      }
    }),
  )

  // Sort chats by last message time (most recent first)
  const sortedChats = chatsWithMessages.sort((a, b) => {
    const aLastMessageTime = a.lastMessage?.createdAt
      ? new Date(a.lastMessage.createdAt).getTime()
      : 0
    const bLastMessageTime = b.lastMessage?.createdAt
      ? new Date(b.lastMessage.createdAt).getTime()
      : 0
    return bLastMessageTime - aLastMessageTime
  })

  // Calculate total unread count
  const totalUnreadCount = chatsWithMessages.reduce(
    (total, chat) => total + chat.unreadCount,
    0,
  )

  return {
    chats: sortedChats,
    totalUnreadCount,
  }
}
