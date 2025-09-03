import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

import Chat from './model'

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

  // Create chat if it doesn't exist
  if (!chat) {
    chat = await prisma.chat.create({
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
  }

  return new Chat(chat, context)
}

export async function getMyChats(context: GQLContext) {
  const currentUserId = context.user?.user.id
  if (!currentUserId) {
    throw new Error('Authentication required')
  }

  // Check if current user is a trainer
  const currentUser = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { role: true },
  })

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

  // Now fetch all chats (existing + newly created)
  const chats = await prisma.chat.findMany({
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

  // Sort chats by last message creation time (most recent first)
  // Chats without messages will appear at the bottom
  const sortedChats = chats.sort((a, b) => {
    const aLastMessageTime = a.messages[0]?.createdAt
      ? new Date(a.messages[0].createdAt).getTime()
      : 0
    const bLastMessageTime = b.messages[0]?.createdAt
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
