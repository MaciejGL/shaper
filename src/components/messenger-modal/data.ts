import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import { useUser } from '@/context/user-context'
import {
  GQLGetChatMessagesQuery,
  GQLGetChatMessagesQueryVariables,
  GQLGetMessengerInitialDataQuery,
  GetChatMessagesDocument,
  useDeleteMessageMutation,
  useEditMessageMutation,
  useGetMessengerInitialDataQuery,
  useMarkMessagesAsReadMutation,
  useSendMessageMutation,
} from '@/generated/graphql-client'
import { fetchData } from '@/lib/graphql'

import type { MessageType } from './types'

export function useMessengerData(
  partnerId: string | undefined,
  isOpen: boolean,
) {
  const hasMarkedAsRead = useRef<string | null>(null)
  const { user } = useUser()
  const queryClient = useQueryClient()
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)

  const messagesPerPage = 30

  // Single query to get all messenger data
  const { data: messengerData, isLoading: isLoadingMessenger } =
    useGetMessengerInitialDataQuery(
      { messagesPerChat: messagesPerPage },
      {
        enabled: isOpen,
        staleTime: 2000, // 2 seconds - keep data fresh for quick updates
        refetchOnWindowFocus: true, // Refetch when user returns to tab
        refetchInterval: isOpen ? 3000 : false, // 3 seconds - much faster polling
        refetchIntervalInBackground: false, // Don't poll when tab is inactive
      },
    )

  // Auto-select chat based on partnerId
  useEffect(() => {
    if (
      !selectedChatId &&
      partnerId &&
      messengerData?.getMessengerInitialData?.chats
    ) {
      const currentUserId = user?.id
      const chat = messengerData.getMessengerInitialData.chats.find(
        (chat) =>
          (chat.trainerId === currentUserId && chat.clientId === partnerId) ||
          (chat.clientId === currentUserId && chat.trainerId === partnerId),
      )
      if (chat) {
        setSelectedChatId(chat.id)
      }
    }
  }, [selectedChatId, partnerId, messengerData, user])

  // Find the selected chat
  const selectedChat = useMemo(() => {
    if (!messengerData?.getMessengerInitialData?.chats) return null

    // Return the selected chat if we have one
    if (selectedChatId) {
      return (
        messengerData.getMessengerInitialData.chats.find(
          (chat) => chat.id === selectedChatId,
        ) || null
      )
    }

    return null
  }, [messengerData?.getMessengerInitialData?.chats, selectedChatId])

  // Get additional messages for the selected chat (pagination)
  // Only fetch when user actually requests more messages
  const {
    data: additionalMessagesData,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['additional-chat-messages', selectedChat?.id],
    queryFn: async ({ pageParam = 0 }) => {
      if (!selectedChat?.id) throw new Error('No chat ID')
      const result = await fetchData<
        GQLGetChatMessagesQuery,
        GQLGetChatMessagesQueryVariables
      >(GetChatMessagesDocument, {
        chatId: selectedChat.id,
        skip: messagesPerPage + pageParam, // Skip initial messages + previously fetched pages
        take: messagesPerPage,
      })()
      return result.getChatMessages
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < messagesPerPage) return undefined
      return allPages.flat().length
    },
    // Only enable when we actually have more messages to fetch
    enabled: false, // We'll manually trigger this when needed
    staleTime: 30000,
    refetchOnWindowFocus: false,
    initialPageParam: 0,
  })

  // Check if we can fetch more messages
  const hasNextPage = selectedChat?.hasMoreMessages && !isFetchingNextPage

  // Combine initial messages with additional paginated messages
  const messages = useMemo(() => {
    if (!selectedChat?.messages) return []

    const initialMessages = selectedChat.messages
    const additionalMessages = additionalMessagesData?.pages?.flat() || []

    // Combine and deduplicate by ID to prevent duplicates
    const allMessages = [...initialMessages, ...additionalMessages]
    const uniqueMessages = allMessages.filter(
      (message, index, array) =>
        array.findIndex((m) => m.id === message.id) === index,
    )

    // Sort by creation time (oldest first for display)
    return uniqueMessages.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
  }, [selectedChat?.messages, additionalMessagesData?.pages])

  // Get partner information
  const currentUserId = user?.id
  const partner = selectedChat
    ? currentUserId === selectedChat.trainerId
      ? selectedChat.client
      : selectedChat.trainer
    : null

  // All chats for the messenger list
  const allChats = messengerData?.getMessengerInitialData?.chats || []
  const totalUnreadCount =
    messengerData?.getMessengerInitialData?.totalUnreadCount || 0

  // Mutations with optimistic updates
  const sendMessageMutation = useSendMessageMutation({
    onMutate: async (variables) => {
      const messengerQueryKey = useGetMessengerInitialDataQuery.getKey({
        messagesPerChat: messagesPerPage,
      })
      await queryClient.cancelQueries({ queryKey: messengerQueryKey })

      const previousMessengerData = queryClient.getQueryData(messengerQueryKey)

      // Create optimistic message
      const optimisticMessage: MessageType = {
        id: `optimistic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        chatId: variables.input.chatId,
        content: variables.input.content,
        imageUrl: variables.input.imageUrl || null,
        isEdited: false,
        isDeleted: false,
        readAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: {
          id: user?.id || '',
          firstName: user?.profile?.firstName || 'You',
          lastName: user?.profile?.lastName || null,
          image: user?.profile?.avatarUrl || null,
          email: user?.email || '',
        },
      }

      // Optimistically update the messenger data
      queryClient.setQueryData(
        messengerQueryKey,
        (old: GQLGetMessengerInitialDataQuery | undefined) => {
          if (!old?.getMessengerInitialData?.chats) return old

          return {
            ...old,
            getMessengerInitialData: {
              ...old.getMessengerInitialData,
              chats: old.getMessengerInitialData.chats.map((chat) => {
                if (chat.id === variables.input.chatId) {
                  return {
                    ...chat,
                    messages: [optimisticMessage, ...chat.messages],
                    lastMessage: optimisticMessage,
                    updatedAt: new Date().toISOString(),
                  }
                }
                return chat
              }),
            },
          }
        },
      )

      return { previousMessengerData, messengerQueryKey }
    },
    onError: (_, __, context) => {
      if (context?.previousMessengerData && context?.messengerQueryKey) {
        queryClient.setQueryData(
          context.messengerQueryKey,
          context.previousMessengerData,
        )
      }
      toast.error('Failed to send message')
    },
    onSuccess: (data, variables, context) => {
      // Update the optimistic message with real server data
      if (data?.sendMessage && context) {
        const messengerQueryKey = context.messengerQueryKey
        queryClient.setQueryData(
          messengerQueryKey,
          (old: GQLGetMessengerInitialDataQuery | undefined) => {
            if (!old?.getMessengerInitialData?.chats) return old

            return {
              ...old,
              getMessengerInitialData: {
                ...old.getMessengerInitialData,
                chats: old.getMessengerInitialData.chats.map((chat) => {
                  if (chat.id === variables.input.chatId) {
                    return {
                      ...chat,
                      messages: chat.messages.map((msg) => {
                        const isOptimisticMessage =
                          msg.id.startsWith('optimistic-') &&
                          msg.content === variables.input.content &&
                          msg.sender.id === user?.id

                        if (isOptimisticMessage) {
                          return {
                            ...data.sendMessage,
                            id: msg.id, // Keep optimistic ID for stable React key
                          }
                        }
                        return msg
                      }),
                      lastMessage: data.sendMessage,
                    }
                  }
                  return chat
                }),
              },
            }
          },
        )
      }
    },
  })

  // Simplified mutations - let's keep them simple and just invalidate the main query
  const editMessageMutation = useEditMessageMutation({
    onError: () => toast.error('Failed to update message'),
    onSettled: () => {
      // Invalidate the main messenger data to refresh
      queryClient.invalidateQueries({
        queryKey: useGetMessengerInitialDataQuery.getKey({
          messagesPerChat: messagesPerPage,
        }),
      })
    },
  })

  const deleteMessageMutation = useDeleteMessageMutation({
    onError: () => toast.error('Failed to delete message'),
    onSettled: () => {
      // Invalidate the main messenger data to refresh
      queryClient.invalidateQueries({
        queryKey: useGetMessengerInitialDataQuery.getKey({
          messagesPerChat: messagesPerPage,
        }),
      })
    },
  })

  const markAsReadMutation = useMarkMessagesAsReadMutation({
    onMutate: async (variables) => {
      const messengerQueryKey = useGetMessengerInitialDataQuery.getKey({
        messagesPerChat: messagesPerPage,
      })
      await queryClient.cancelQueries({ queryKey: messengerQueryKey })

      const previousData = queryClient.getQueryData(messengerQueryKey)

      // Get current unread count for this chat
      const currentChat = allChats.find(
        (chat) => chat.id === variables.input.chatId,
      )
      const currentUnreadCount = currentChat?.unreadCount || 0

      // Optimistically update unread counts
      queryClient.setQueryData(
        messengerQueryKey,
        (old: GQLGetMessengerInitialDataQuery | undefined) => {
          if (!old?.getMessengerInitialData) return old

          return {
            ...old,
            getMessengerInitialData: {
              ...old.getMessengerInitialData,
              totalUnreadCount: Math.max(
                0,
                old.getMessengerInitialData.totalUnreadCount -
                  currentUnreadCount,
              ),
              chats: old.getMessengerInitialData.chats.map((chat) =>
                chat.id === variables.input.chatId
                  ? { ...chat, unreadCount: 0 }
                  : chat,
              ),
            },
          }
        },
      )

      return { previousData, messengerQueryKey }
    },
    onError: (_, __, context) => {
      if (context?.previousData && context?.messengerQueryKey) {
        queryClient.setQueryData(
          context.messengerQueryKey,
          context.previousData,
        )
      }
    },
    onSettled: () => {
      // Refresh to get real server state
      queryClient.invalidateQueries({
        queryKey: useGetMessengerInitialDataQuery.getKey({
          messagesPerChat: messagesPerPage,
        }),
      })
    },
  })

  // Helper functions
  const sendMessage = (content: string) => {
    if (!content.trim() || !selectedChat) return
    sendMessageMutation.mutate({
      input: {
        chatId: selectedChat.id,
        content: content.trim(),
      },
    })
  }

  const editMessage = (id: string, content: string) => {
    if (!content.trim()) return
    editMessageMutation.mutate({
      input: {
        id,
        content: content.trim(),
      },
    })
  }

  const deleteMessage = (id: string) => {
    deleteMessageMutation.mutate({ id })
  }

  const markMessagesAsRead = () => {
    if (selectedChat) {
      if (
        hasMarkedAsRead.current !== selectedChat.id ||
        !markAsReadMutation.isPending
      ) {
        hasMarkedAsRead.current = selectedChat.id
        markAsReadMutation.mutate({ input: { chatId: selectedChat.id } })
      }
    }
  }

  const resetReadStatus = () => {
    hasMarkedAsRead.current = null
  }

  const selectChat = (chatId: string) => {
    setSelectedChatId(chatId)
    resetReadStatus()
  }

  return {
    // Data
    chat: selectedChat,
    allChats,
    messages,
    partner,
    currentUserId,
    totalUnreadCount,

    // Loading states
    isLoadingChat: isLoadingMessenger,
    isLoadingMessages: isLoadingMessenger, // No additional loading since we pre-fetch
    isLoading: isLoadingMessenger,
    isFetchingNextPage,
    hasNextPage,

    // Mutation states
    isSending: sendMessageMutation.isPending,

    // Actions
    sendMessage,
    editMessage,
    deleteMessage,
    markMessagesAsRead,
    resetReadStatus,
    selectChat,
    loadMoreMessages: () => {
      if (hasNextPage && selectedChat?.id) {
        fetchNextPage()
      }
    },
  }
}
