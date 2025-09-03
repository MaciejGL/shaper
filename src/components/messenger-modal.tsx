'use client'

import { useQueryClient } from '@tanstack/react-query'
import { Clock, MessageSquare, Send, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useUser } from '@/context/user-context'
import {
  useDeleteMessageMutation,
  useEditMessageMutation,
  useGetChatMessagesQuery,
  useGetOrCreateChatQuery,
  useMarkMessagesAsReadMutation,
  useSendMessageMutation,
} from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { UserAvatar } from './user-avatar'

interface MessengerModalProps {
  isOpen: boolean
  onClose: () => void
  partnerId: string
}

// Temporary type until code generation - matches generated structure
type MessageType = {
  __typename?: 'Message'
  id: string
  chatId: string
  content: string
  imageUrl?: string | null
  isEdited: boolean
  isDeleted: boolean
  readAt?: string | null
  createdAt: string
  updatedAt: string
  sender: {
    id: string
    name?: string | null
    profile?: {
      firstName?: string | null
      lastName?: string | null
      avatarUrl?: string | null
    } | null
  }
}

export function MessengerModal({
  isOpen,
  onClose,
  partnerId,
}: MessengerModalProps) {
  const [newMessage, setNewMessage] = useState('')
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [allowInputFocus, setAllowInputFocus] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasMarkedAsRead = useRef<string | null>(null) // Track if we've marked this chat as read
  const { user } = useUser()
  const queryClient = useQueryClient()

  // GraphQL hooks
  const { data: chatData, isLoading: isLoadingChat } = useGetOrCreateChatQuery(
    { partnerId },
    { enabled: isOpen },
  )

  const chat = chatData?.getOrCreateChat

  const { data: messagesData, isLoading: isLoadingMessages } =
    useGetChatMessagesQuery(
      { chatId: chat?.id || '', take: 50 },
      { enabled: !!chat?.id },
    )

  // Memoize messages to prevent unnecessary re-renders
  const memoizedMessages = useMemo(() => {
    return messagesData?.getChatMessages || []
  }, [messagesData?.getChatMessages])

  const currentUserId = user?.id

  // Get partner information from chat data
  const partner = chat
    ? currentUserId === chat.trainerId
      ? chat.client
      : chat.trainer
    : null

  const partnerName =
    partner && (partner.profile?.firstName || partner.profile?.lastName)
      ? `${partner.profile?.firstName || ''} ${partner.profile?.lastName || ''}`.trim()
      : partner?.name || 'User'

  const partnerAvatar = partner?.profile?.avatarUrl || undefined

  // Mutations with optimistic updates
  const sendMessageMutation = useSendMessageMutation({
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      const queryKey = useGetChatMessagesQuery.getKey({
        chatId: variables.input.chatId,
      })
      await queryClient.cancelQueries({ queryKey })

      // Snapshot the previous value
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
            avatarUrl: null, // Not available in UserBasic query
          },
        },
      }

      // Optimistically update the messages
      queryClient.setQueryData(
        queryKey,
        (old: { getChatMessages?: MessageType[] } | undefined) => {
          if (!old) return old
          return {
            ...old,
            getChatMessages: [
              ...(old.getChatMessages || []),
              optimisticMessage,
            ],
          }
        },
      )

      // Clear input immediately for better UX
      setNewMessage('')

      return { previousMessages, queryKey }
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousMessages && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousMessages)
      }
      // Restore the message text so user can retry
      setNewMessage(variables.input.content)
      toast.error('Failed to send message')
    },
    onSettled: (data, error, variables) => {
      // Always refetch to ensure we have the latest data
      const queryKey = useGetChatMessagesQuery.getKey({
        chatId: variables.input.chatId,
      })
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const editMessageMutation = useEditMessageMutation({
    onMutate: async (variables) => {
      if (!chat) return

      // Cancel outgoing refetches
      const queryKey = useGetChatMessagesQuery.getKey({ chatId: chat.id })
      await queryClient.cancelQueries({ queryKey })

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(queryKey)

      // Optimistically update the message
      queryClient.setQueryData(
        queryKey,
        (old: { getChatMessages?: MessageType[] } | undefined) => {
          if (!old) return old
          return {
            ...old,
            getChatMessages:
              old.getChatMessages?.map((msg) =>
                msg.id === variables.input.id
                  ? {
                      ...msg,
                      content: variables.input.content,
                      isEdited: true,
                      updatedAt: new Date().toISOString(),
                    }
                  : msg,
              ) || [],
          }
        },
      )

      // Clear editing state immediately
      setEditingMessageId(null)
      setEditContent('')

      return { previousMessages, queryKey }
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousMessages && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousMessages)
      }
      // Restore editing state so user can retry
      setEditingMessageId(variables.input.id)
      setEditContent(variables.input.content)
      toast.error('Failed to update message')
    },
    onSettled: () => {
      if (!chat) return
      // Always refetch to ensure we have the latest data
      const queryKey = useGetChatMessagesQuery.getKey({ chatId: chat.id })
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const deleteMessageMutation = useDeleteMessageMutation({
    onMutate: async (variables) => {
      if (!chat) return

      // Cancel outgoing refetches
      const queryKey = useGetChatMessagesQuery.getKey({ chatId: chat.id })
      await queryClient.cancelQueries({ queryKey })

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(queryKey)

      // Optimistically remove the message
      queryClient.setQueryData(
        queryKey,
        (old: { getChatMessages?: MessageType[] } | undefined) => {
          if (!old) return old
          return {
            ...old,
            getChatMessages:
              old.getChatMessages?.filter((msg) => msg.id !== variables.id) ||
              [],
          }
        },
      )

      return { previousMessages, queryKey }
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousMessages && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousMessages)
      }
      toast.error('Failed to delete message')
    },
    onSettled: () => {
      if (!chat) return
      // Always refetch to ensure we have the latest data
      const queryKey = useGetChatMessagesQuery.getKey({ chatId: chat.id })
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const markAsReadMutation = useMarkMessagesAsReadMutation()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [memoizedMessages])

  // Mark messages as read when modal opens (only once per chat)
  useEffect(() => {
    if (isOpen && chat && hasMarkedAsRead.current !== chat.id) {
      hasMarkedAsRead.current = chat.id
      markAsReadMutation.mutate({ input: { chatId: chat.id } })
    }

    // Reset when modal closes
    if (!isOpen) {
      hasMarkedAsRead.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, chat?.id]) // Intentionally excluding markAsReadMutation to prevent infinite loop

  // Manage input focus prevention when modal opens
  useEffect(() => {
    if (isOpen) {
      // Disable input focus initially
      setAllowInputFocus(false)
      // Re-enable after modal has fully opened
      const timer = setTimeout(() => {
        setAllowInputFocus(true)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      // Reset for next time
      setAllowInputFocus(false)
    }
  }, [isOpen])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !chat) return

    sendMessageMutation.mutate({
      input: {
        chatId: chat.id,
        content: newMessage.trim(),
      },
    })
    // Note: setNewMessage('') is now handled optimistically in onMutate
  }

  const handleEditMessage = (message: MessageType) => {
    setEditingMessageId(message.id)
    setEditContent(message.content)
  }

  const handleSaveEdit = () => {
    if (!editContent.trim() || !editingMessageId) return

    editMessageMutation.mutate({
      input: {
        id: editingMessageId,
        content: editContent.trim(),
      },
    })
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setEditContent('')
  }

  const handleDeleteMessage = (messageId: string) => {
    deleteMessageMutation.mutate({ id: messageId })
  }

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        dialogTitle={`Message ${partnerName}`}
        fullScreen={true}
        className="lg:max-w-[800px] h-dvh lg:h-[80vh] lg:rounded-2xl flex flex-col p-0 !px-0"
      >
        {/* Header */}
        <DialogHeader className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <UserAvatar
              withFallbackAvatar
              firstName={partnerName}
              lastName={partnerName}
              imageUrl={partnerAvatar}
              className="size-8"
            />
            <div>
              <DialogTitle className="text-base font-medium">
                {partnerName}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
          {isLoadingChat || isLoadingMessages ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-2">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : memoizedMessages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center py-8">
              <div className="space-y-2">
                <MessageSquare className="size-12 mx-auto text-muted-foreground" />
                <h3 className="font-medium">Start the conversation</h3>
                <p className="text-sm text-muted-foreground">
                  Send a message to {partnerName} to get started.
                </p>
              </div>
            </div>
          ) : (
            memoizedMessages.map((message: MessageType) => {
              const isOwnMessage = message.sender.id === currentUserId
              const isEditing = editingMessageId === message.id

              return (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-2 group',
                    isOwnMessage && 'flex-row-reverse',
                  )}
                >
                  <Avatar className="size-8">
                    <AvatarImage
                      src={message.sender.profile?.avatarUrl || undefined}
                    />
                    <AvatarFallback>
                      {(message.sender.profile?.firstName || 'U')
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={cn(
                      'flex-1 max-w-[75%]',
                      isOwnMessage && 'text-right',
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">
                        {message.sender.profile?.firstName || 'Unknown User'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatMessageTime(message.createdAt)}
                      </span>
                      {message.isEdited && (
                        <span className="text-xs text-muted-foreground italic">
                          edited
                        </span>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-2">
                        <Input
                          id={`edit-${message.id}`}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit()
                            if (e.key === 'Escape') handleCancelEdit()
                          }}
                          placeholder="Edit your message..."
                          variant="ghost"
                          autoFocus
                        />
                        <div className="grid grid-cols-[1fr_auto_auto] gap-1">
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => handleDeleteMessage(message.id)}
                            iconOnly={<Trash2 className="opacity-70" />}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            variant="tertiary"
                            onClick={handleSaveEdit}
                            disabled={!editContent.trim()}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={cn(
                          'bg-card rounded-lg px-3 py-2',
                          isOwnMessage && 'bg-card text-card-foreground',
                        )}
                      >
                        <p
                          className="text-sm"
                          onClick={() => handleEditMessage(message)}
                        >
                          {message.content}
                        </p>
                      </div>
                    )}

                    {/* Read indicator */}
                    {isOwnMessage && message.readAt && (
                      <div className="flex items-center gap-1 mt-1 justify-end">
                        <Clock className="size-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Read
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="px-4 py-3 w-full ">
          <div className="grid grid-cols-[1fr_auto] gap-2 w-full">
            <Input
              id="message-input"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder={`Aa`}
              variant="secondary"
              className="flex-1"
              autoComplete="off"
              autoFocus={false}
              tabIndex={allowInputFocus ? 0 : -1}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sendMessageMutation.isPending}
              loading={sendMessageMutation.isPending}
              iconOnly={<Send className="size-4" />}
            >
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
