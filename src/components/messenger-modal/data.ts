import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'
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

export function useMessengerData(partnerId: string, isOpen: boolean) {
  const hasMarkedAsRead = useRef<string | null>(null)
  const { user } = useUser()
  const queryClient = useQueryClient()

  // Queries
  const { data: chatData, isLoading: isLoadingChat } = useGetOrCreateChatQuery(
    { partnerId },
    { enabled: isOpen },
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
    refetchInterval: isOpen ? 5000 : false,
    initialPageParam: 0,
  })

  // Reverse the order of pages, then reverse each page to get chronological order (oldest to newest)
  const messages =
    messagesData?.pages
      .slice()
      .reverse()
      .map((page) => page.slice().reverse())
      .flat() || []

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
        id: `temp-${Date.now()}`,
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
            avatarUrl: null,
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
    onSettled: (data, error, variables) => {
      const queryKey = ['chat-messages', variables.input.chatId]
      queryClient.invalidateQueries({ queryKey })
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
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const markAsReadMutation = useMarkMessagesAsReadMutation({
    onSuccess: () => {
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
    if (chat && hasMarkedAsRead.current !== chat.id) {
      hasMarkedAsRead.current = chat.id
      markAsReadMutation.mutate({ input: { chatId: chat.id } })
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
