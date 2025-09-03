import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useRef } from 'react'
import { toast } from 'sonner'

import { useUser } from '@/context/user-context'
import {
  GQLGetChatMessagesQuery,
  GQLGetChatMessagesQueryVariables,
  GetChatMessagesDocument,
  useDeleteMessageMutation,
  useEditMessageMutation,
  useGetMyChatsQuery,
  useGetOrCreateChatQuery,
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

  // Queries
  const { data: chatData, isLoading: isLoadingChat } = useGetOrCreateChatQuery(
    { partnerId: partnerId! },
    { enabled: isOpen && !!partnerId },
  )

  const chat = chatData?.getOrCreateChat

  const messagesPerPage = 30

  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['chat-messages', chat?.id],
    queryFn: async ({ pageParam = 0 }) => {
      if (!chat?.id) throw new Error('No chat ID')
      const result = await fetchData<
        GQLGetChatMessagesQuery,
        GQLGetChatMessagesQueryVariables
      >(GetChatMessagesDocument, {
        chatId: chat.id,
        skip: pageParam,
        take: messagesPerPage,
      })()
      return result.getChatMessages
    },
    getNextPageParam: (lastPage, allPages) => {
      // If the last page has fewer messages than requested, we've reached the end
      if (lastPage.length < messagesPerPage) return undefined
      // Return the total count of messages loaded so far (this becomes the skip parameter)
      return allPages.flat().length
    },
    enabled: !!chat?.id,
    staleTime: 30000, // 30 seconds - data is fresh for 30s
    refetchOnWindowFocus: true,
    refetchInterval: isOpen ? 10000 : false, // Only refetch when modal is open, less frequently
    initialPageParam: 0,
  })

  // Memoize messages processing to prevent unnecessary re-renders
  const messages = useMemo(() => {
    if (!messagesData?.pages) return []

    return messagesData.pages
      .slice()
      .reverse()
      .map((page) => page.slice().reverse())
      .flat()
  }, [messagesData?.pages])

  // Get partner information
  const currentUserId = user?.id
  const partner = chat
    ? currentUserId === chat.trainerId
      ? chat.client
      : chat.trainer
    : null

  // Mutations with optimistic updates
  const sendMessageMutation = useSendMessageMutation({
    onMutate: async (variables) => {
      const queryKey = ['chat-messages', variables.input.chatId]
      await queryClient.cancelQueries({ queryKey })

      const previousMessages = queryClient.getQueryData(queryKey)

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
          name: user?.name || 'You',
          profile: {
            firstName: user?.profile?.firstName || null,
            lastName: user?.profile?.lastName || null,
            avatarUrl: user?.profile?.avatarUrl || null,
          },
        },
      }

      // Optimistically update the infinite query
      queryClient.setQueryData(
        queryKey,
        (old: { pages: MessageType[][]; pageParams: number[] } | undefined) => {
          if (!old || !old.pages.length) return old

          // Add the optimistic message to the beginning of the first page (since backend returns newest first)
          const newPages = [...old.pages]
          newPages[0] = [optimisticMessage, ...newPages[0]]

          return {
            ...old,
            pages: newPages,
          }
        },
      )

      return { previousMessages, queryKey }
    },
    onError: (error, variables, context) => {
      if (context?.previousMessages && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousMessages)
      }
      toast.error('Failed to send message')
    },
    onSuccess: (data, variables, context) => {
      const queryKey = ['chat-messages', variables.input.chatId]

      // Update the optimistic message with real server data, keeping the same ID to prevent re-animation
      if (data?.sendMessage && context) {
        queryClient.setQueryData(
          queryKey,
          (
            old: { pages: MessageType[][]; pageParams: number[] } | undefined,
          ) => {
            if (!old || !old.pages.length) return old

            const newPages = old.pages.map((page) =>
              page.map((msg) => {
                // Find the optimistic message by content and timestamp (since it was just sent)
                const isOptimisticMessage =
                  msg.id.startsWith('optimistic-') &&
                  msg.content === variables.input.content &&
                  msg.sender.id === user?.id

                if (isOptimisticMessage) {
                  // Update with real server data but keep the optimistic ID to prevent re-animation
                  return {
                    ...data.sendMessage,
                    id: msg.id, // Keep optimistic ID for stable React key
                  }
                }
                return msg
              }),
            )

            return {
              ...old,
              pages: newPages,
            }
          },
        )
      }

      // Only invalidate chat list to update last message, not the messages themselves
      queryClient.invalidateQueries({
        queryKey: useGetMyChatsQuery.getKey({}),
      })
    },
  })

  const editMessageMutation = useEditMessageMutation({
    onMutate: async (variables) => {
      if (!chat) return

      const queryKey = ['chat-messages', chat.id]
      await queryClient.cancelQueries({ queryKey })

      const previousMessages = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(
        queryKey,
        (old: { pages: MessageType[][]; pageParams: number[] } | undefined) => {
          if (!old) return old

          const newPages = old.pages.map((page) =>
            page.map((msg) =>
              msg.id === variables.input.id
                ? {
                    ...msg,
                    content: variables.input.content,
                    isEdited: true,
                    updatedAt: new Date().toISOString(),
                  }
                : msg,
            ),
          )

          return {
            ...old,
            pages: newPages,
          }
        },
      )

      return { previousMessages, queryKey }
    },
    onError: (error, variables, context) => {
      if (context?.previousMessages && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousMessages)
      }
      toast.error('Failed to update message')
    },
    onSettled: () => {
      if (!chat) return
      const queryKey = ['chat-messages', chat.id]
      // Only invalidate messages, not the chat list since editing doesn't change last message timestamp
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const deleteMessageMutation = useDeleteMessageMutation({
    onMutate: async (variables) => {
      if (!chat) return

      const queryKey = ['chat-messages', chat.id]
      await queryClient.cancelQueries({ queryKey })

      const previousMessages = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(
        queryKey,
        (old: { pages: MessageType[][]; pageParams: number[] } | undefined) => {
          if (!old) return old

          const newPages = old.pages.map((page) =>
            page.filter((msg) => msg.id !== variables.id),
          )

          return {
            ...old,
            pages: newPages,
          }
        },
      )

      return { previousMessages, queryKey }
    },
    onError: (error, variables, context) => {
      if (context?.previousMessages && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousMessages)
      }
      toast.error('Failed to delete message')
    },
    onSettled: () => {
      if (!chat) return
      const queryKey = ['chat-messages', chat.id]
      // Invalidate both messages and chat list since deleting might change the last message
      queryClient.invalidateQueries({ queryKey })
      queryClient.invalidateQueries({
        queryKey: useGetMyChatsQuery.getKey({}),
      })
    },
  })

  const markAsReadMutation = useMarkMessagesAsReadMutation({
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for chats
      const chatsQueryKey = useGetMyChatsQuery.getKey({})
      await queryClient.cancelQueries({ queryKey: chatsQueryKey })

      // Snapshot the previous chats data
      const previousChats = queryClient.getQueryData(chatsQueryKey)

      // Optimistically update the unread count to 0 for this chat
      queryClient.setQueryData(
        chatsQueryKey,
        (
          old:
            | {
                getMyChats?: {
                  id: string
                  unreadCount: number
                  [key: string]: unknown
                }[]
              }
            | undefined,
        ) => {
          if (!old?.getMyChats) return old

          return {
            ...old,
            getMyChats: old.getMyChats.map((chat) =>
              chat.id === variables.input.chatId
                ? { ...chat, unreadCount: 0 }
                : chat,
            ),
          }
        },
      )

      return { previousChats, chatsQueryKey }
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousChats && context?.chatsQueryKey) {
        queryClient.setQueryData(context.chatsQueryKey, context.previousChats)
      }
    },
    onSuccess: () => {
      // Invalidate to get the real server state
      queryClient.invalidateQueries({
        queryKey: useGetMyChatsQuery.getKey({}),
      })
    },
  })

  // Helper functions
  const sendMessage = (content: string) => {
    if (!content.trim() || !chat) return
    sendMessageMutation.mutate({
      input: {
        chatId: chat.id,
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
    if (chat) {
      // Always mark messages as read when called, don't rely on ref check
      // The ref is only used to prevent duplicate calls within the same session
      if (
        hasMarkedAsRead.current !== chat.id ||
        !markAsReadMutation.isPending
      ) {
        hasMarkedAsRead.current = chat.id
        markAsReadMutation.mutate({ input: { chatId: chat.id } })
      }
    }
  }

  const resetReadStatus = () => {
    hasMarkedAsRead.current = null
  }

  return {
    // Data
    chat,
    messages,
    partner,
    currentUserId,

    // Loading states
    isLoadingChat,
    isLoadingMessages,
    isLoading: isLoadingChat || isLoadingMessages,
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
    loadMoreMessages: fetchNextPage,
  }
}
