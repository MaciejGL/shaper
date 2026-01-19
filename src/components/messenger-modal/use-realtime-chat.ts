'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { GQLGetMessengerInitialDataQuery } from '@/generated/graphql-client'
import { useGetMessengerInitialDataQuery } from '@/generated/graphql-client'
import type { RealtimeBroadcastEnvelope } from '@/lib/realtime/use-realtime-channel'
import { useRealtimeChannel } from '@/lib/realtime/use-realtime-channel'

interface UseRealtimeChatParams {
  enabled: boolean
  chatId?: string
  messagesPerChat: number
  currentUserId?: string
}

function normalizeIsoDateTime(value: string): string {
  // Supabase trigger payloads often omit timezone (e.g. `2026-01-18T16:21:25.231`).
  // Add 'Z' so parsing/sorting is consistent in all browsers.
  if (!value) return value
  if (value.endsWith('Z')) return value
  if (/[+-]\d{2}:\d{2}$/.test(value)) return value
  return `${value}Z`
}

// Shape of the message from the DB trigger broadcast
interface BroadcastMessage {
  id: string
  chatId: string
  senderId: string
  content: string
  imageUrl?: string | null
  isEdited?: boolean
  isDeleted?: boolean
  createdAt: string
  updatedAt: string
  readAt?: string | null
}

type ChatRealtimeEvents = {
  INSERT: {
    id: string
    table: 'Message'
    schema: 'public'
    operation: 'INSERT'
    record: BroadcastMessage
    old_record: null
  }
  typing: { userId: string; isTyping: boolean }
}

export function useRealtimeChat({
  enabled,
  chatId,
  messagesPerChat,
  currentUserId,
}: UseRealtimeChatParams) {
  const queryClient = useQueryClient()
  const [isPartnerTyping, setIsPartnerTyping] = useState(false)
  const partnerTypingClearTimerRef = useRef<number | null>(null)
  const localTypingStopTimerRef = useRef<number | null>(null)
  const localIsTypingRef = useRef(false)

  const messengerQueryKey = useMemo(
    () =>
      useGetMessengerInitialDataQuery.getKey({
        messagesPerChat,
      }),
    [messagesPerChat],
  )

  const handleNewMessage = useCallback(
    (message: BroadcastMessage) => {
      // Avoid duplicates: own messages are already handled by optimistic updates.
      if (message.senderId === currentUserId) return

      const old =
        queryClient.getQueryData<GQLGetMessengerInitialDataQuery>(
          messengerQueryKey,
        )
      const chats = old?.getMessengerInitialData?.chats
      if (!chats) return

      const targetChatIndex = chats.findIndex((c) => c.id === message.chatId)
      if (targetChatIndex === -1) return

      const targetChat = chats[targetChatIndex]

      if (targetChat.messages.some((m) => m.id === message.id)) return

      const sender =
        targetChat.trainer.id === message.senderId
          ? targetChat.trainer
          : targetChat.client.id === message.senderId
            ? targetChat.client
            : (targetChat.messages.find((m) => m.sender.id === message.senderId)
                ?.sender ?? {
                id: message.senderId,
                email: '',
                firstName: null,
                lastName: null,
                image: null,
              })

      const newMessage = {
        __typename: 'Message' as const,
        id: message.id,
        chatId: message.chatId,
        senderId: message.senderId,
        content: message.content,
        imageUrl: message.imageUrl ?? null,
        isEdited: message.isEdited ?? false,
        isDeleted: message.isDeleted ?? false,
        createdAt: normalizeIsoDateTime(message.createdAt),
        updatedAt: normalizeIsoDateTime(message.updatedAt),
        readAt: message.readAt ? normalizeIsoDateTime(message.readAt) : null,
        sender,
      }

      const isOwn = currentUserId === message.senderId
      const newUnreadCount =
        !isOwn && targetChat.unreadCount !== undefined
          ? targetChat.unreadCount + 1
          : targetChat.unreadCount

      const updatedChats = [...chats]
      updatedChats[targetChatIndex] = {
        ...targetChat,
        messages: [newMessage, ...targetChat.messages],
        lastMessage: newMessage,
        unreadCount: newUnreadCount,
        updatedAt: new Date().toISOString(),
      }

      queryClient.setQueryData(messengerQueryKey, {
        ...old,
        getMessengerInitialData: {
          ...old.getMessengerInitialData,
          chats: updatedChats,
        },
      })
    },
    [currentUserId, messengerQueryKey, queryClient],
  )

  const broadcastHandlers = useMemo(() => {
    const onInsert = ({
      payload,
    }: RealtimeBroadcastEnvelope<ChatRealtimeEvents['INSERT']>) => {
      if (payload?.record) handleNewMessage(payload.record)
    }

    const onTyping = ({
      payload,
    }: RealtimeBroadcastEnvelope<ChatRealtimeEvents['typing']>) => {
      if (!payload?.userId || payload.userId === currentUserId) return

      if (partnerTypingClearTimerRef.current) {
        window.clearTimeout(partnerTypingClearTimerRef.current)
        partnerTypingClearTimerRef.current = null
      }

      setIsPartnerTyping(Boolean(payload.isTyping))

      if (payload.isTyping) {
        partnerTypingClearTimerRef.current = window.setTimeout(() => {
          setIsPartnerTyping(false)
          partnerTypingClearTimerRef.current = null
        }, 3_000)
      }
    }

    return [
      { event: 'INSERT' as const, handler: onInsert },
      { event: 'typing' as const, handler: onTyping },
    ]
  }, [currentUserId, handleNewMessage])

  const topic = chatId ? `chat:${chatId}:messages` : undefined
  const { sendBroadcast } = useRealtimeChannel<ChatRealtimeEvents>({
    enabled,
    topic,
    broadcastHandlers,
    isPrivate: true,
  })

  const notifyTypingActivity = useCallback(
    (text: string) => {
      if (!enabled || !chatId || !currentUserId) return

      const trimmed = text.trim()
      const shouldBeTyping = trimmed.length > 0

      const setLocalTyping = async (isTyping: boolean) => {
        const result = await sendBroadcast('typing', {
          userId: currentUserId,
          isTyping,
        })
        if (result !== 'ok') {
          console.error('[Realtime] Failed to send typing event', {
            chatId,
            result,
          })
        }
      }

      if (!shouldBeTyping) {
        if (localTypingStopTimerRef.current) {
          window.clearTimeout(localTypingStopTimerRef.current)
          localTypingStopTimerRef.current = null
        }
        if (localIsTypingRef.current) {
          localIsTypingRef.current = false
          void setLocalTyping(false)
        }
        return
      }

      if (!localIsTypingRef.current) {
        localIsTypingRef.current = true
        void setLocalTyping(true)
      }

      if (localTypingStopTimerRef.current) {
        window.clearTimeout(localTypingStopTimerRef.current)
      }
      localTypingStopTimerRef.current = window.setTimeout(() => {
        localTypingStopTimerRef.current = null
        if (localIsTypingRef.current) {
          localIsTypingRef.current = false
          void setLocalTyping(false)
        }
      }, 2_000)
    },
    [chatId, currentUserId, enabled, sendBroadcast],
  )

  useEffect(() => {
    return () => {
      if (partnerTypingClearTimerRef.current) {
        window.clearTimeout(partnerTypingClearTimerRef.current)
        partnerTypingClearTimerRef.current = null
      }
      if (localTypingStopTimerRef.current) {
        window.clearTimeout(localTypingStopTimerRef.current)
        localTypingStopTimerRef.current = null
      }

      if (localIsTypingRef.current && currentUserId) {
        localIsTypingRef.current = false
        void sendBroadcast('typing', { userId: currentUserId, isTyping: false })
      }
    }
  }, [currentUserId, sendBroadcast])

  return { isPartnerTyping, notifyTypingActivity }
}
