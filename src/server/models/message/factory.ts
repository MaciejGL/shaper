import {
  GQLEditMessageInput,
  GQLNotificationType,
  GQLQueryGetChatMessagesArgs,
  GQLSendMessageInput,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { sendPushForNotification } from '@/lib/notifications/push-integration'
import Message from '@/server/models/message/model'
import { GQLContext } from '@/types/gql-context'

export async function getChatMessages(
  { chatId, skip = 0, take = 50 }: GQLQueryGetChatMessagesArgs,
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

  const messages = await prisma.message.findMany({
    where: {
      chatId,
      isDeleted: false,
    },
    include: {
      sender: {
        include: {
          profile: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
    skip: skip || 0,
    take: take || 50,
  })

  return messages.map((message) => new Message(message, context))
}

export async function sendMessage(
  input: GQLSendMessageInput,
  context: GQLContext,
) {
  const currentUserId = context.user?.user.id
  if (!currentUserId) {
    throw new Error('Authentication required')
  }

  // Verify user has access to this chat
  const chat = await prisma.chat.findFirst({
    where: {
      id: input.chatId,
      OR: [{ trainerId: currentUserId }, { clientId: currentUserId }],
    },
    include: {
      trainer: true,
      client: true,
    },
  })

  if (!chat) {
    throw new Error('Chat not found or access denied')
  }

  // Create the message
  const message = await prisma.message.create({
    data: {
      chatId: input.chatId,
      senderId: currentUserId,
      content: input.content.trim(),
      imageUrl: input.imageUrl,
    },
    include: {
      sender: {
        include: {
          profile: true,
        },
      },
    },
  })

  // Update chat's updatedAt timestamp
  await prisma.chat.update({
    where: { id: input.chatId },
    data: { updatedAt: new Date() },
  })

  // Send push notification to the other person
  const recipientId =
    chat.trainerId === currentUserId ? chat.clientId : chat.trainerId

  const senderName = context.user?.user.profile?.firstName || 'Someone'

  // Only send push notification if user is not currently active
  const recentActivity = await prisma.mobilePushToken.findFirst({
    where: {
      userId: recipientId,
      pushNotificationsEnabled: true,
      lastActiveAt: {
        lt: new Date(Date.now() - 2 * 60 * 1000), // Not active in last 2 minutes
      },
    },
  })

  if (recentActivity) {
    await sendPushForNotification(
      recipientId,
      GQLNotificationType.Message,
      `${senderName} sent you a message`,
      `/fitspace/messages/${input.chatId}`,
      {
        senderName,
      },
    )
  }

  return new Message(message, context)
}

export async function editMessage(
  input: GQLEditMessageInput,
  context: GQLContext,
) {
  const currentUserId = context.user?.user.id
  if (!currentUserId) {
    throw new Error('Authentication required')
  }

  // Find the message and verify ownership
  const existingMessage = await prisma.message.findFirst({
    where: {
      id: input.id,
      senderId: currentUserId,
      isDeleted: false,
    },
    include: {
      sender: {
        include: {
          profile: true,
        },
      },
    },
  })

  if (!existingMessage) {
    throw new Error(
      'Message not found or you do not have permission to edit it',
    )
  }

  // Update the message
  const message = await prisma.message.update({
    where: { id: input.id },
    data: {
      content: input.content.trim(),
      isEdited: true,
      updatedAt: new Date(),
    },
    include: {
      sender: {
        include: {
          profile: true,
        },
      },
    },
  })

  return new Message(message, context)
}

export async function deleteMessage(
  { id }: { id: string },
  context: GQLContext,
) {
  const currentUserId = context.user?.user.id
  if (!currentUserId) {
    throw new Error('Authentication required')
  }

  // Find the message and verify ownership
  const existingMessage = await prisma.message.findFirst({
    where: {
      id,
      senderId: currentUserId,
      isDeleted: false,
    },
  })

  if (!existingMessage) {
    throw new Error(
      'Message not found or you do not have permission to delete it',
    )
  }

  // Soft delete the message
  await prisma.message.update({
    where: { id },
    data: {
      isDeleted: true,
      content: '[Message deleted]',
      updatedAt: new Date(),
    },
  })

  return true
}
