import DataLoader from 'dataloader'

import { prisma } from '@/lib/db'

/**
 * Chat DataLoaders - PERFORMANCE OPTIMIZATION:
 *
 * 🟢 PREFERRED: Use chatBasic for most cases (includes trainer, client, latest message)
 * 🟢 PREFERRED: Use chatByParticipants for trainer-client pair lookups (complete data)
 * 🟢 PREFERRED: Use unreadCount for batching unread message counts
 * 🟡 CAUTION: messagesByChat includes full message content (heavy, use with pagination)
 *
 * These loaders eliminate N+1 queries and include all necessary relations!
 */
export const createChatLoaders = () => ({
  // COMPLETE: Chat with trainer, client, and latest message included
  chatBasic: new DataLoader(async (chatIds: readonly string[]) => {
    console.info(
      `🔍 [CHAT-LOADER] chatBasic loading ${chatIds.length} chats by ID`,
    )
    const chats = await prisma.chat.findMany({
      relationLoadStrategy: 'query',
      where: { id: { in: chatIds as string[] } },
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

    const map = new Map(chats.map((c) => [c.id, c]))
    return chatIds.map((id) => map.get(id) ?? null)
  }),

  // COMPLETE: Find chat by trainer-client pair with all relations
  chatByParticipants: new DataLoader(
    async (pairs: readonly string[]) => {
      console.info(
        `🔍 [CHAT-LOADER] chatByParticipants loading ${pairs.length} chats by participants`,
      )
      // pairs format: "trainerId:clientId"
      const parsed = pairs.map((p) => {
        const [trainerId, clientId] = p.split(':')
        return { trainerId, clientId }
      })

      const chats = await prisma.chat.findMany({
        relationLoadStrategy: 'query',
        where: {
          OR: parsed.map(({ trainerId, clientId }) => ({
            trainerId,
            clientId,
          })),
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

      const map = new Map(chats.map((c) => [`${c.trainerId}:${c.clientId}`, c]))
      return pairs.map((pair) => map.get(pair) ?? null)
    },
    {
      // Custom cache key since we're using composite keys
      cacheKeyFn: (pair) => pair,
    },
  ),

  // EFFICIENT: Batch unread message counts
  unreadCount: new DataLoader(async (params: readonly string[]) => {
    console.info(
      `🔍 [CHAT-LOADER] unreadCount loading ${params.length} unread counts`,
    )
    // params format: "chatId:userId" (userId is the viewer, not the sender)
    const parsed = params.map((p) => {
      const [chatId, userId] = p.split(':')
      return { chatId, userId }
    })

    const results = await prisma.message.groupBy({
      by: ['chatId'],
      where: {
        chatId: { in: parsed.map((p) => p.chatId) },
        senderId: { notIn: parsed.map((p) => p.userId) }, // Messages NOT sent by the user
        readAt: null,
      },
      _count: { id: true },
    })

    const map = new Map(results.map((r) => [r.chatId, r._count.id]))
    return params.map((param) => {
      const [chatId] = param.split(':')
      return map.get(chatId) ?? 0
    })
  }),

  // HEAVY: Messages for a chat (use with pagination)
  messagesByChat: new DataLoader(
    async (params: readonly string[]) => {
      console.warn(
        `⚠️ [CHAT-LOADER] messagesByChat loading ${params.length} message sets - ensure pagination is used`,
      )
      // params format: "chatId:limit:cursor"
      const queries = params.map((param) => {
        const [chatId, limitStr, cursor] = param.split(':')
        return {
          chatId,
          limit: parseInt(limitStr) || 50,
          cursor: cursor && cursor !== 'undefined' ? cursor : undefined,
        }
      })

      // Execute all queries in parallel
      const results = await Promise.all(
        queries.map(async ({ chatId, limit, cursor }) => {
          const messages = await prisma.message.findMany({
            where: {
              chatId,
              ...(cursor && { createdAt: { lt: new Date(cursor) } }),
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            select: {
              id: true,
              content: true,
              senderId: true,
              createdAt: true,
              readAt: true,
              isEdited: true,
              isDeleted: true,
            },
          })
          return { chatId, messages }
        }),
      )

      const map = new Map(results.map((r) => [r.chatId, r.messages]))
      return params.map((param) => {
        const [chatId] = param.split(':')
        return map.get(chatId) ?? []
      })
    },
    {
      // Custom cache key for pagination params
      cacheKeyFn: (param) => param,
    },
  ),
})
